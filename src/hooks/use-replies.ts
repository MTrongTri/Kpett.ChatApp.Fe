// hooks/use-replies.ts
import useSWRInfinite from "swr/infinite";
import { getCommentsByPostId, getRepliesByCommentId } from "@/services/comment.service";

const REPLIES_LIMIT = 12;

const getRepliesKey =
  (postId: string, commentId: string, enabled: boolean) =>
    (pageIndex: number, previousPageData: any) => {
      if (!enabled) return null;
      if (previousPageData && !previousPageData.data?.pagination.hasMore)
        return null;

      const cursor =
        pageIndex === 0
          ? null
          : (previousPageData?.data?.pagination.nextCursor ?? null);

      return ["replies", postId, commentId, cursor, REPLIES_LIMIT];
    };

export const useReplies = (postId: string, commentId: string, enabled: boolean) => {
  const { data, size, setSize, mutate, isLoading, isValidating, error } =
    useSWRInfinite(
      getRepliesKey(postId, commentId, enabled),
      ([, postId, parentId, cursor]) => getCommentsByPostId(postId, parentId, cursor, REPLIES_LIMIT),
      {
        revalidateFirstPage: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      },
    );

  const pages = data ?? [];
  const replies = pages.flatMap((page) => page.data?.items ?? []);
  const hasMore = pages.at(-1)?.data?.pagination.hasMore ?? false;

  const loadMore = () => setSize(size + 1);

  return {
    replies,
    hasMore,
    isLoading,
    isLoadingMore: isValidating && size > 1,
    error,
    loadMore,
    mutate,
  };
};
