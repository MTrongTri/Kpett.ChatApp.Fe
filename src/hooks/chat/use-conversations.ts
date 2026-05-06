import { useMemo, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { useAuth } from "@/components/providers/auth-provider";

const CONVERSATION_LIMIT = 12;

export function useConversations() {
    const { user } = useAuth();

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useInfiniteQuery({
        queryKey: ["conversations"],
        queryFn: ({ pageParam }) => chatService.getConversations(CONVERSATION_LIMIT, pageParam as string | undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.pagination?.nextCursor || undefined,
        enabled: !!user,
    });

    const conversations = useMemo(() => {
        return data?.pages.flatMap((page) => page?.items ?? []) ?? [];
    }, [data]);

    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return {
        conversations,
        isLoading,
        isLoadingMore: isFetchingNextPage,
        hasMore: !!hasNextPage,
        loadMore,
    };
}