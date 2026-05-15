import { useMemo, useCallback } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { useAuth } from "@/components/providers/auth-provider";
import { useTrackPresence } from "@/hooks/use-track-presence";
import { produce } from "immer";

const CONVERSATION_LIMIT = 12;

export function useConversations({ enabled = true }: { enabled?: boolean } = {}) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

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
        enabled: !!user && enabled,
    });

    const conversations = useMemo(() => {
        return data?.pages.flatMap((page) => page?.items ?? []) ?? [];
    }, [data]);

    // TRÍCH XUẤT TẤT CẢ USER_ID ĐANG HIỂN THỊ TRONG DANH SÁCH (TRỪ BẢN THÂN)
    const participantsToTrack = useMemo(() => {
        const ids = new Set<string>();
        conversations.forEach(conv => {
            conv.participants?.forEach(p => {
                if (p.id !== user?.id) {
                    ids.add(p.id);
                }
            });
        });
        return Array.from(ids);
    }, [conversations, user?.id]);

    // LẮNG NGHE REALTIME STATUS VÀ CẬP NHẬT TRỰC TIẾP VÀO CACHE
    useTrackPresence(participantsToTrack, ({ userId, isOnline }) => {
        queryClient.setQueryData(["conversations"], (oldData: any) => {
            if (!oldData?.pages) return oldData;

            return produce(oldData, (draft: any) => {
                // Duyệt qua tất cả các trang và hội thoại để tìm user cần cập nhật
                for (const page of draft.pages) {
                    if (!page.items) continue;
                    for (const conv of page.items) {
                        if (!conv.participants) continue;

                        // Tìm thành viên trùng ID và cập nhật trạng thái
                        const participant = conv.participants.find((p: any) => p.id === userId);
                        if (participant) {
                            participant.isOnline = isOnline;
                        }
                    }
                }
            });
        });
    });

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