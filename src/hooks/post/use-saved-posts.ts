"use client";
import { useMemo, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getSavedPosts } from "@/services/post.service";

const SAVED_LIMIT = 20;

export function useSavedPosts() {
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["saved-posts"],
    queryFn: ({ pageParam }) => getSavedPosts(pageParam as string | null, SAVED_LIMIT),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor || undefined,
  });

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
