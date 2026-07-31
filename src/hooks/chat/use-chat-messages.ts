"use client";

import { useMemo, useCallback, useEffect, useRef } from "react";
import {
    useInfiniteQuery,
    useQueryClient
} from "@tanstack/react-query";
import { produce } from "immer";
import { useSignalR } from "@/components/providers/signalr-provider";
import { chatService } from "@/services/chat.service";
import { MessageResponse } from "@/types/chat";
import {
    ConversationsCache,
    MessagesCache,
    updateConversationCacheWithMessage,
    upsertMessageInMessagesCache,
} from "./chat-cache-utils";

const MESSAGES_LIMIT = 20;

export function useChatMessages(
    conversationId: string | null,
    isMinimized = false
) {
    const queryClient = useQueryClient();
    const { connection, isConnected, reconnectVersion } = useSignalR();
    const lastMarkedRef = useRef<string | null>(null);

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteQuery({
            queryKey: ["chat-messages", conversationId],
            queryFn: ({ pageParam }) =>
                chatService.getMessages(
                    conversationId!,
                    MESSAGES_LIMIT,
                    pageParam as string | undefined
                ),
            initialPageParam: undefined as string | undefined,
            getNextPageParam: (lastPage) =>
                lastPage.pagination?.nextCursor || undefined,
            enabled: !!conversationId && !isMinimized,
        });

    const messages = useMemo(() => {
        return data?.pages.flatMap((page) => page.items ?? []).reverse() ?? [];
    }, [data]);

    const loadOlderMessages = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const updateMessageStatus = useCallback(
        (clientMessageId: string, status: "error" | "sent") => {
            queryClient.setQueryData<MessagesCache>(
                ["chat-messages", conversationId],
                (oldData) => {
                    if (!oldData?.pages.length) return oldData;

                    return produce(oldData, (draft) => {
                        const currentItems = draft.pages[0]?.items;
                        if (!currentItems) return;

                        const messageIndex = currentItems.findIndex(
                            (message) =>
                                message.clientMessageId === clientMessageId
                        );

                        if (messageIndex === -1) {
                            return;
                        }

                        if (status === "sent") {
                            delete currentItems[messageIndex].localStatus;
                            return;
                        }

                        currentItems[messageIndex].localStatus = status;
                    });
                }
            );
        },
        [queryClient, conversationId]
    );

    const addMessageToCache = useCallback(
        (newMessage: MessageResponse) => {
            if (!conversationId) return;

            upsertMessageInMessagesCache(queryClient, conversationId, newMessage);
            updateConversationCacheWithMessage(
                queryClient,
                conversationId,
                newMessage,
                isMinimized
            );
        },
        [queryClient, conversationId, isMinimized]
    );

    useEffect(() => {
        if (!isConnected || !connection || !conversationId) return;

        const handleUserRead = (
            targetConversationId: string,
            userId: string,
            messageId: string
        ) => {
            if (targetConversationId !== conversationId) return;

            queryClient.setQueryData<ConversationsCache>(
                ["conversations"],
                (oldData) => {
                    if (!oldData?.pages.length) return oldData;

                    return produce(oldData, (draft) => {
                        for (const page of draft.pages) {
                            const conversation = page.items.find(
                                (cachedConversation) =>
                                    cachedConversation.id === targetConversationId
                            );

                            if (!conversation) {
                                continue;
                            }

                            const participant = conversation.participants.find(
                                (member) => member.id === userId
                            );

                            if (participant) {
                                participant.lastReadMessageId = messageId;
                            }
                        }
                    });
                }
            );
        };

        const handleMessageUpdated = (updatedMessage: MessageResponse) => {
            if (updatedMessage.conversationId !== conversationId) return;

            queryClient.setQueryData<MessagesCache>(
                ["chat-messages", conversationId],
                (oldData) => {
                    if (!oldData?.pages.length) return oldData;
                    return produce(oldData, (draft) => {
                        for (const page of draft.pages) {
                            const index = page.items.findIndex(
                                (m) => m.id === updatedMessage.id
                            );
                            if (index > -1) {
                                page.items[index] = updatedMessage;
                                return;
                            }
                        }
                    });
                }
            );
        };

        const handleMessageDeleted = (payload: { conversationId: string; messageId: string }) => {
            if (payload.conversationId !== conversationId) return;

            queryClient.setQueryData<MessagesCache>(
                ["chat-messages", conversationId],
                (oldData) => {
                    if (!oldData?.pages.length) return oldData;
                    return produce(oldData, (draft) => {
                        for (const page of draft.pages) {
                            const index = page.items.findIndex(
                                (m) => m.id === payload.messageId
                            );
                            if (index > -1) {
                                page.items[index].isDeleted = true;
                                page.items[index].content = null;
                            }
                        }
                    });
                }
            );
        };

        connection.on("UserReadMessage", handleUserRead);
        connection.on("MessageUpdated", handleMessageUpdated);
        connection.on("MessageDeleted", handleMessageDeleted);

        return () => {
            connection.off("UserReadMessage", handleUserRead);
            connection.off("MessageUpdated", handleMessageUpdated);
            connection.off("MessageDeleted", handleMessageDeleted);
        };
    }, [
        connection,
        isConnected,
        reconnectVersion,
        conversationId,
        queryClient
    ]);

    useEffect(() => {
        if (!conversationId || isMinimized) return;

        let needsApiCall = false;

        queryClient.setQueryData<ConversationsCache>(["conversations"], (oldData) => {
            if (!oldData?.pages.length) return oldData;

            return produce(oldData, (draft) => {
                for (const page of draft.pages) {
                    const conversation = page.items.find(
                        (cachedConversation) =>
                            cachedConversation.id === conversationId
                    );

                    if (conversation?.hasUnread) {
                        conversation.hasUnread = false;
                        needsApiCall = true;
                    }
                }
            });
        });

        if (!needsApiCall) return;

        if (lastMarkedRef.current === conversationId) return;
        lastMarkedRef.current = conversationId;

        chatService.markAsRead(conversationId).catch(() => undefined);
        queryClient.setQueryData<boolean>(
            ["hasUnreadConversations"],
            (oldValue) => {
                if (oldValue !== true) {
                    return oldValue;
                }

                const cachedData =
                    queryClient.getQueryData<ConversationsCache>(["conversations"]);

                const hasOtherUnread = cachedData?.pages.some((page) =>
                    page.items.some((conversation) => conversation.hasUnread)
                );

                return hasOtherUnread ?? false;
            }
        );
    }, [conversationId, isMinimized, queryClient]);

    return {
        messages,
        isLoading,
        isLoadingMore: isFetchingNextPage,
        hasMore: !!hasNextPage,
        loadOlderMessages,
        addMessageToCache,
        updateMessageStatus
    };
}
