"use client";
import { useMemo, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getReelsFeed } from "@/services/post.service";

const REELS_LIMIT = 5;

export function useReelsFeed() {
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["reels"],
    queryFn: ({ pageParam }) => getReelsFeed(pageParam as string | null, REELS_LIMIT),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor || undefined,
  });

  const reels = useMemo(() => {
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
    reels,
    error,
    isLoadingInitialData: isLoading,
    isLoadingMore: isFetchingNextPage,
    hasMore: !!hasNextPage,
    loadMore,
    refresh,
  };
}
