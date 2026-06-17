import { useInfiniteQuery } from "@tanstack/react-query";
import { getCommentsByPostId } from "@/services/comment.service";

const REPLIES_LIMIT = 12;

export const useCommentReplies = (postId: string, commentId: string, enabled: boolean) => {
  const {
    data,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ["replies", postId, commentId],
    queryFn: ({ pageParam }) => getCommentsByPostId(postId, commentId, pageParam as string | null, REPLIES_LIMIT),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor || undefined,
    enabled: enabled && !!postId && !!commentId,
  });

  const replies = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  return {
    replies,
    hasMore: !!hasNextPage,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    error,
    loadMore: fetchNextPage,
    mutate: refetch,
  };
};