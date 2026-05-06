"use client";
import { useMemo, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getFeedHome } from "@/services/post.service";

const FEED_LIMIT = 10;

export function useHomeFeed() {
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => getFeedHome(pageParam as string | null, FEED_LIMIT),
    initialPageParam: null as string | null,
    // Tự động trích xuất cursor cho trang tiếp theo
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor || undefined,
  });

  // Gom phẳng mảng các trang thành 1 mảng bài viết duy nhất
  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.items ?? []) ?? [];
  }, [data]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    posts,
    error,
    isLoadingInitialData: isLoading,
    isLoadingMore: isFetchingNextPage,
    hasMore: !!hasNextPage,
    loadMore,
    refresh,
  };
}