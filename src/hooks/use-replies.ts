// hooks/use-replies.ts
import useSWRInfinite from "swr/infinite";
import { getRepliesByCommentId } from "@/services/comment.service";

const REPLIES_LIMIT = 1;

const getRepliesKey =
  (commentId: string, enabled: boolean) =>
  (pageIndex: number, previousPageData: any) => {
    if (!enabled) return null;
    if (previousPageData && !previousPageData.data?.pagination.hasMore)
      return null;

    const cursor =
      pageIndex === 0
        ? null
        : (previousPageData?.data?.pagination.nextCursor ?? null);

    return ["replies", commentId, cursor, REPLIES_LIMIT];
  };

export const useReplies = (commentId: string, enabled: boolean) => {
  const { data, size, setSize, isLoading, isValidating, error } =
    useSWRInfinite(
      getRepliesKey(commentId, enabled),
      ([, id, cursor]) => getRepliesByCommentId(id, cursor, REPLIES_LIMIT),
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
  };
};
