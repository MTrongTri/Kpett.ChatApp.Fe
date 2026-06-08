"use client";

import { useMemo, useCallback } from "react";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useAuth } from "@/components/providers/auth-provider";
import { useTrackPresence } from "@/hooks/use-track-presence";
import { chatService } from "@/services/chat.service";
import { ConversationResponse } from "@/types/chat";
import { PaginatedData } from "@/types/common/api";

const CONVERSATION_LIMIT = 12;

type ConversationsCache = InfiniteData<
    PaginatedData<ConversationResponse>,
    string | undefined
>;

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
        queryFn: ({ pageParam }) =>
            chatService.getConversations(
                CONVERSATION_LIMIT,
                pageParam as string | undefined
            ),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.pagination?.nextCursor || undefined,
        enabled: !!user && enabled,
    });

    const conversations = useMemo(() => {
        return data?.pages.flatMap((page) => page.items ?? []) ?? [];
    }, [data]);

    const participantsToTrack = useMemo(() => {
        const ids = new Set<string>();

        conversations.forEach((conversation) => {
            conversation.participants.forEach((participant) => {
                if (participant.id !== user?.id) {
                    ids.add(participant.id);
                }
            });
        });

        return Array.from(ids);
    }, [conversations, user?.id]);

    useTrackPresence(participantsToTrack, ({ userId, isOnline }) => {
        queryClient.setQueryData<ConversationsCache>(["conversations"], (oldData) => {
            if (!oldData?.pages.length) return oldData;

            return produce(oldData, (draft) => {
                for (const page of draft.pages) {
                    for (const conversation of page.items) {
                        const participant = conversation.participants.find(
                            (member) => member.id === userId
                        );

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
