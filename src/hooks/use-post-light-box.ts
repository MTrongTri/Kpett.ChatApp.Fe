// hooks/use-post-modal.ts
"use client";

import { useState, useCallback, useMemo } from "react";
import { Post } from "@/types/post";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { getPostById } from "@/services/post.service";
import { getCommentsByPostId } from "@/services/comment.service";

const COMMENTS_LIMIT = 1;

export function usePostLightBox() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [initialPost, setInitialPost] = useState<Post | null>(null);
  const [autoScrollTarget, setAutoScrollTarget] = useState<string | null>(null);

  // Fetch thông tin chi tiết bài viết
  const {
    data: fetchedPost,
    isLoading: isPostLoading,
    error: postError,
  } = useSWR(
    selectedPostId && !initialPost ? ["post", selectedPostId] : null,
    ([_, id]) => getPostById(id).then((r) => r.data!),
  );

  // Fetch danh sách bình luận (Cursor-based)
  const {
    data: commentPages,
    isLoading: isCommentsLoading,
    isValidating,
    error: commentsError,
    size,
    setSize,
  } = useSWRInfinite(
    // getKey: Quyết định key nào sẽ được fetch tiếp theo
    (pageIndex, previousPageData) => {
      // Dừng fetch nếu không có Post ID
      if (!selectedPostId) return null;

      // Dừng fetch nếu đã tải trang trước đó NHƯNG không còn nextCursor (hết dữ liệu)
      if (previousPageData && !previousPageData.data.pagination.nextCursor) {
        return null;
      }

      // Lấy con trỏ từ trang trước đó. Nếu là trang đầu tiên (previousPageData = null), cursor = null
      const cursor = previousPageData
        ? previousPageData.data.pagination.nextCursor
        : null;

      // Trả về mảng Key chứa đầy đủ tham số
      return ["comments", selectedPostId, cursor, COMMENTS_LIMIT];
    },
    // fetcher: Lấy dữ liệu từ Key đã định nghĩa ở trên
    ([_, postId, cursor, limit]) => {
      return getCommentsByPostId(postId, cursor, limit);
    },
    {
      revalidateFirstPage: false,
      persistSize: true, // Giữ nguyên số lượng trang đã tải khi re-render
    },
  );

  const post = initialPost ?? fetchedPost;

  // Gom và làm phẳng danh sách bình luận từ các trang trả về
  const comments = useMemo(() => {
    if (!commentPages) return [];
    // Vì commentPages là mảng các Response từ API, ta cần trích xuất items bên trong
    return commentPages.flatMap((page) => page.data?.items ?? []);
  }, [commentPages]);

  const isLoadingMore = isValidating && size > 1;

  // Lấy trạng thái hasMore trực tiếp từ metadata của API trả về ở trang cuối cùng
  const hasMore = useMemo(() => {
    if (!commentPages || commentPages.length === 0) return false;
    const lastPage = commentPages[commentPages.length - 1];
    return lastPage.data?.pagination.hasMore ?? false;
  }, [commentPages]);

  const loadMoreComments = useCallback(() => {
    if (!isValidating && hasMore) {
      setSize((prevSize) => prevSize + 1);
    }
  }, [isValidating, hasMore, setSize]);

  const openModal = useCallback(
    (postId: string, preloadedPost?: Post, scrollTarget?: string) => {
      setInitialPost(preloadedPost ?? null);
      setSelectedPostId(postId);
      setAutoScrollTarget(scrollTarget ?? null);
    },
    [],
  );

  const closeModal = useCallback(() => {
    setSelectedPostId(null);
    setInitialPost(null);
  }, []);

  return {
    isOpen: !!selectedPostId,
    autoScrollTarget,
    isPostLoading,
    isCommentsLoading,
    postError,
    commentsError,
    post,
    comments,
    isLoadingMore,
    hasMore,
    loadMoreComments,
    openModal,
    closeModal,
  };
}
