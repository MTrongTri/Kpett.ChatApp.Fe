// hooks/post/use-post-comments.ts
"use client";
import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getCommentsByPostId } from "@/services/comment.service";

interface PostCommentsProps {
  postId: string | null | undefined;
  limit?: number;
}

export function usePostComments({ postId, limit = 12 }: PostCommentsProps) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) => getCommentsByPostId(postId!, null, pageParam as string | null, limit),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor || undefined,
    enabled: !!postId,
  });

  const comments = useMemo(() => {
    return data?.pages.flatMap((page) => page.items ?? []) ?? [];
  }, [data]);

  return {
    comments,
    isCommentsLoading: isLoading,
    isLoadingMore: isFetchingNextPage,
    hasMore: !!hasNextPage,
    commentsError: error,
    loadMoreComments: fetchNextPage,
    mutateComments: refetch
  };
}