// hooks/use-home-feed.ts
"use client";

import { useMemo, useCallback } from "react";
import useSWRInfinite from "swr/infinite";
import { getFeedHome } from "@/services/post.service";

const FEED_LIMIT = 10;

export function useHomeFeed() {
  const {
    data: pages,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite(
    // 1. Hàm getKey: Khởi tạo mảng tham số
    (pageIndex, previousPageData) => {
      // Dừng fetch nếu đã tải trang trước đó nhưng không còn nextCursor
      if (previousPageData && !previousPageData.data?.pagination.nextCursor) {
        return null;
      }

      // Lấy cursor từ metadata của trang trước
      const cursor = previousPageData
        ? previousPageData.data.pagination.nextCursor
        : null;

      // Trả về mảng Key chuẩn (Không còn username nữa)
      return ["feed", cursor, FEED_LIMIT];
    },

    // 2. Hàm fetcher: Nhận mảng Key và gọi API
    ([_, currentCursor, limit]) => {
      return getFeedHome(currentCursor, limit as number);
    },
    {
      revalidateFirstPage: false,
      persistSize: true,
      revalidateOnFocus: false,
    },
  );

  // 3. Xử lý làm phẳng mảng (Flattening)
  const posts = useMemo(() => {
    if (!pages) return [];
    return pages.flatMap((page) => page.data?.items ?? []);
  }, [pages]);

  // 4. Kiểm tra còn dữ liệu không
  const hasMore = useMemo(() => {
    if (!pages || pages.length === 0) return false;
    const lastPage = pages[pages.length - 1];
    return lastPage.data?.pagination.hasMore ?? false;
  }, [pages]);

  // 5. Trạng thái cuộn tải thêm (Loading More)
  const isLoadingMore =
    isLoading || (size > 0 && pages && typeof pages[size - 1] === "undefined");

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize((prevSize) => prevSize + 1);
    }
  }, [isLoadingMore, hasMore, setSize]);

  // Hàm làm mới bảng tin (Pull to refresh)
  const refresh = useCallback(() => {
    mutate(); // Gọi lại dữ liệu mới nhất ở background
    setSize(1); // Reset cuộn về trang đầu
  }, [mutate, setSize]);

  return {
    posts,
    error,
    isLoadingInitialData: isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
    mutate,
  };
}
