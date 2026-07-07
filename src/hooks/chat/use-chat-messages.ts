"use client";

import { useMemo, useCallback, useEffect, useRef } from "react";
import {
    InfiniteData,
    useInfiniteQuery,
    useQueryClient
} from "@tanstack/react-query";
import { produce } from "immer";
import { useSignalR } from "@/components/providers/signalr-provider";
import { chatService } from "@/services/chat.service";
import {
    ConversationResponse,
    MessageResponse,
} from "@/types/chat";
import { PaginatedData } from "@/types/common/api";

const MESSAGES_LIMIT = 20;

type MessagesCache = InfiniteData<
    PaginatedData<MessageResponse>,
    string | undefined
>;

type ConversationsCache = InfiniteData<
    PaginatedData<ConversationResponse>,
    string | undefined
>;

export function useChatMessages(
    conversationId: string | null,
    isMinimized = false
) {
    const queryClient = useQueryClient();
    const { connection, isConnected } = useSignalR();
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
            queryClient.setQueryData<MessagesCache>(
                ["chat-messages", conversationId],
                (oldData) => {
                    if (!oldData?.pages.length) return oldData;

                    return produce(oldData, (draft) => {
                        const currentItems = draft.pages[0]?.items;
                        if (!currentItems) return;

                        const existingIndex = currentItems.findIndex(
                            (message) =>
                                message.id === newMessage.id ||
                                (newMessage.clientMessageId
                                    ? message.id === newMessage.clientMessageId
                                    : false)
                        );

                        if (existingIndex > -1) {
                            currentItems[existingIndex] = newMessage;
                            return;
                        }

                        currentItems.unshift(newMessage);
                    });
                }
            );

            queryClient.setQueryData<ConversationsCache>(
                ["conversations"],
                (oldData) => {
                    if (!oldData?.pages.length) return oldData;

                    return produce(oldData, (draft) => {
                        let foundConversation:
                            | ConversationResponse
                            | undefined;
                        let pageIndex = -1;
                        let itemIndex = -1;

                        for (let index = 0; index < draft.pages.length; index += 1) {
                            const conversationIndex = draft.pages[index].items.findIndex(
                                (conversation) => conversation.id === conversationId
                            );

                            if (conversationIndex > -1) {
                                foundConversation =
                                    draft.pages[index].items[conversationIndex];
                                pageIndex = index;
                                itemIndex = conversationIndex;
                                break;
                            }
                        }

                        if (!foundConversation || pageIndex === -1 || itemIndex === -1) {
                            return;
                        }

                        foundConversation.lastMessageAt = newMessage.createdAt;
                        foundConversation.lastMessage = { ...newMessage };
                        foundConversation.hasUnread = isMinimized;

                        draft.pages[pageIndex].items.splice(itemIndex, 1);
                        draft.pages[0].items.unshift(foundConversation);
                    });
                }
            );
        },
        [queryClient, conversationId, isMinimized]
    );

    useEffect(() => {
        if (!isConnected || !connection || !conversationId) return;

        const handleNewMessage = (newMessage: MessageResponse) => {
            const targetConversationId = newMessage.conversationId ?? conversationId;
            if (targetConversationId !== conversationId) return;

            addMessageToCache(newMessage);

            if (!isMinimized) {
                chatService.markAsRead(conversationId).catch(() => undefined);
            }
        };

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

        connection.on("ReceiveNewMessage", handleNewMessage);
        connection.on("UserReadMessage", handleUserRead);

        return () => {
            connection.off("ReceiveNewMessage", handleNewMessage);
            connection.off("UserReadMessage", handleUserRead);
        };
    }, [
        connection,
        isConnected,
        conversationId,
        addMessageToCache,
        isMinimized,
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

        // Dedup: chỉ gọi markAsRead nếu chưa gọi cho conversation này
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
