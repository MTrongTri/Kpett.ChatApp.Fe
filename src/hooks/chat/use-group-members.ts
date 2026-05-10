import { useInfiniteQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";

export function useGroupMembers(conversationId: string, limit: number = 20) {
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useInfiniteQuery({
        queryKey: ["group-members", conversationId],
        queryFn: ({ pageParam }) => chatService.getGroupMembers(conversationId, limit, pageParam as string | undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.pagination?.nextCursor || undefined,
        enabled: !!conversationId,
    });

    const members = data?.pages.flatMap((page) => page?.items ?? []) ?? [];

    return {
        members,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    };
}