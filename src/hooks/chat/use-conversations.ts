import { useMemo, useCallback } from "react";
import useSWRInfinite from "swr/infinite";
import { chatService } from "@/services/chat.service";
import { useAuth } from "@/components/providers/auth-provider";

const CONVERSATION_LIMIT = 12;

export function useConversations() {
    const { user } = useAuth();

    const { data, size, setSize, isValidating, isLoading, mutate } = useSWRInfinite(
        (pageIndex, previousPageData) => {
            if (!user) return null;
            // Dừng fetch nếu trang trước đó không có nextCursor
            if (previousPageData && !previousPageData.pagination?.nextCursor) return null;

            const cursor = previousPageData ? previousPageData.pagination.nextCursor : null;

            // Key thay đổi thành mảng chứa cursor
            return ["conversations-infinite", cursor, CONVERSATION_LIMIT];
        },
        ([_, cursor, limit]) => chatService.getConversations(limit as number, cursor as string),
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    // Gộp tất cả các trang lại thành một mảng duy nhất
    const conversations = useMemo(() => {
        if (!data) return [];
        return data.flatMap((page) => page?.items ?? []);
    }, [data]);

    const hasMore = data ? data[data.length - 1]?.pagination?.hasMore ?? false : false;
    const isLoadingMore = isValidating && size > 0;

    const loadMore = useCallback(() => {
        if (hasMore && !isValidating) {
            setSize((prev) => prev + 1);
        }
    }, [hasMore, isValidating, setSize]);

    return {
        conversations,
        isLoading,
        isLoadingMore,
        hasMore,
        loadMore,
        mutate
    };
}