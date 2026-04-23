"use client";

import { useCallback, useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { getCommentsByPostId } from "@/services/comment.service";
import { Comment } from "@/types/comment";

interface PostCommentsProps {
  postId: string | null | undefined
  limit?: number;
}

export function usePostComments({ postId, limit = 12 }: PostCommentsProps) {
  const {
    data: commentPages,
    isLoading: isCommentsLoading,
    isValidating,
    error: commentsError,
    size,
    setSize,
    mutate: mutateComments
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (!postId) return null;

      // Dừng fetch nếu đã tải trang trước đó nhưng không còn nextCursor)
      if (previousPageData && !previousPageData.data.pagination.nextCursor) {
        return null;
      }

      // Lấy cursor từ metadata của trang trước đó, nếu không có thì để null (tức là trang đầu tiên)
      const cursor = previousPageData ? previousPageData.data.pagination.nextCursor : null;

      // Trả về mảng Key chứa đầy đủ tham số cho SWR cache
      return ["comments", postId, cursor, limit];
    },
    // fetcher: Hàm thực thi gọi API
    ([_, id, cursor, limit]) => {
      return getCommentsByPostId(id, null, cursor, limit);
    },
    {
      revalidateFirstPage: false,
      persistSize: true,
      revalidateOnFocus: false,
    }
  );

  // ── XỬ LÝ DỮ LIỆU ĐẦU RA ──

  // Gom và làm phẳng danh sách bình luận từ các trang trả về
  const comments = useMemo(() => {
    if (!commentPages) return [];
    return commentPages.flatMap((page) => page.data?.items ?? []);
  }, [commentPages]);

  const isLoadingMore = isValidating && size > 1;

  // Lấy trạng thái hasMore trực tiếp từ metadata của API trả về ở trang cuối cùng
  const hasMore = useMemo(() => {
    if (!commentPages || commentPages.length === 0) return false;
    const lastPage = commentPages[commentPages.length - 1];
    return lastPage.data?.pagination.hasMore ?? false;
  }, [commentPages]);

  // Hàm loadMoreComments được gọi khi người dùng cuộn đến cuối danh sách bình luận
  const loadMoreComments = useCallback(() => {
    if (!isValidating && hasMore) {
      setSize((prevSize) => prevSize + 1);
    }
  }, [isValidating, hasMore, setSize]);

  return {
    comments,
    isCommentsLoading,
    isLoadingMore,
    hasMore,
    commentsError,
    loadMoreComments,
    mutateComments
  };
}