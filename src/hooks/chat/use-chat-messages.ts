"use client";
import { useMemo, useCallback, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { chatService } from "@/services/chat.service";
import { MessageResponse } from "@/types/chat";
import { useSignalR } from "@/components/providers/signalr-provider";
import { useConversations } from '@/hooks/chat/use-conversations';

const MESSAGES_LIMIT = 20;

export function useChatMessages(conversationId: string | null, isMinisized: boolean = false) {
    const { connection, isConnected } = useSignalR();
    const { mutate: mutateConversations } = useConversations();

    const { data, size, setSize, mutate, isLoading, isValidating } = useSWRInfinite(
        (pageIndex, previousPageData) => {
            if (!conversationId || isMinisized) return null;
            if (previousPageData && !previousPageData.pagination.nextCursor) return null;
            const cursor = previousPageData ? previousPageData.pagination.nextCursor : null;
            return ["chat-messages", conversationId, cursor, MESSAGES_LIMIT];
        },
        ([_, id, cursor, limit]) => chatService.getMessages(id, limit as number, cursor),
        { revalidateOnFocus: false, keepPreviousData: true }
    );

    const messages = useMemo(() => {
        if (!data) return [];
        return data.flatMap((page) => page?.items ?? []).reverse();
    }, [data]);

    const hasMore = data ? data[data.length - 1]?.pagination.hasMore ?? false : false;
    const isLoadingMore = isValidating && size > 0;

    const loadOlderMessages = useCallback(() => {
        if (hasMore && !isValidating) {
            setSize((prev) => prev + 1);
        }
    }, [hasMore, isValidating, setSize]);

    const updateMessageStatus = useCallback((clientMessageId: string, status: "error") => {
        mutate((currentPages: any) => {
            if (!currentPages || currentPages.length === 0) return currentPages;

            const newPages = [...currentPages];
            const currentItems = [...(newPages[0].items || [])];

            const idx = currentItems.findIndex((m: MessageResponse) => m.clientMessageId === clientMessageId);
            if (idx > -1) {
                currentItems[idx] = { ...currentItems[idx], localStatus: status };
                newPages[0] = { ...newPages[0], items: currentItems };
            }
            return newPages;
        }, { revalidate: false });
    }, [mutate]);

    const addMessageToCache = useCallback(async (newMessage: MessageResponse) => {
        // 1. Cập nhật mảng tin nhắn
        mutate((currentPages: any) => {
            let pages = currentPages;
            if (!pages || !Array.isArray(pages) || pages.length === 0) {
                pages = [{ items: [], pagination: {} }];
            } else {
                pages = [...currentPages];
            }

            const currentItems = [...(pages[0].items || [])];

            const existingIndex = currentItems.findIndex(
                (m: MessageResponse) =>
                    m.id === newMessage.id ||
                    (newMessage.clientMessageId && m.id === newMessage.clientMessageId)
            );

            if (existingIndex > -1) {
                currentItems[existingIndex] = newMessage;
            } else {
                currentItems.unshift(newMessage);
            }

            pages[0] = { ...pages[0], items: currentItems };
            return pages;
        }, { revalidate: false });

        // 2. Đồng bộ Sidebar
        if (conversationId) {
            let isFoundInCache = false;

            mutateConversations((currentPages: any) => {
                if (!currentPages || currentPages.length === 0) return currentPages;

                const newPages = [...currentPages];
                let foundConv: any = null;
                let pageIdx = -1;
                let itemIdx = -1;

                for (let i = 0; i < newPages.length; i++) {
                    if (!newPages[i] || !newPages[i].items) continue;
                    const idx = newPages[i].items.findIndex((c: any) => c.id === conversationId);
                    if (idx > -1) {
                        foundConv = { ...newPages[i].items[idx] };
                        pageIdx = i;
                        itemIdx = idx;
                        break;
                    }
                }

                if (foundConv) {
                    isFoundInCache = true;
                    foundConv.lastMessageAt = newMessage.createdAt;
                    foundConv.lastMessage = {
                        id: newMessage.id,
                        senderId: newMessage.senderId,
                        senderName: newMessage.senderName,
                        content: newMessage.content,
                        type: newMessage.type,
                        actionMetadata: newMessage.actionMetadata,
                        createdAt: newMessage.createdAt
                    };

                    // NẾU ĐANG THU NHỎ -> VẪN CÒN UNREAD (CHẤM ĐỎ)
                    foundConv.hasUnread = isMinisized ? true : false;

                    const itemsInPage = [...newPages[pageIdx].items];
                    itemsInPage.splice(itemIdx, 1);
                    newPages[pageIdx] = { ...newPages[pageIdx], items: itemsInPage };

                    const firstPageItems = [...(newPages[0].items || [])];
                    firstPageItems.unshift(foundConv);
                    newPages[0] = { ...newPages[0], items: firstPageItems };
                }
                return newPages;
            }, { revalidate: false });

            if (!isFoundInCache) {
                try {
                    const missingConv = await chatService.getConversationById(conversationId);

                    mutateConversations((currentPages: any) => {
                        const pages = currentPages ? [...currentPages] : [];
                        if (!pages[0]) pages[0] = { items: [], pagination: {} };
                        if (!pages[0].items) pages[0].items = [];

                        const alreadyExists = pages[0].items.some((c: any) => c.id === missingConv.id);
                        if (!alreadyExists) {
                            missingConv.hasUnread = isMinisized ? true : false;
                            missingConv.lastMessageAt = newMessage.createdAt;
                            missingConv.lastMessage = {
                                id: newMessage.id,
                                senderId: newMessage.senderId,
                                senderName: newMessage.senderName,
                                content: newMessage.content,
                                type: newMessage.type,
                                actionMetadata: newMessage.actionMetadata,
                                createdAt: newMessage.createdAt
                            };
                            pages[0].items.unshift(missingConv);
                        }
                        return pages;
                    }, { revalidate: false });
                } catch (error) {
                    console.error("Lỗi khi fetch bù thông tin hội thoại:", error);
                    mutateConversations();
                }
            }
        }
    }, [mutate, mutateConversations, conversationId, isMinisized]);

    useEffect(() => {
        if (!isConnected || !connection || !conversationId) return;

        const handleNewMessage = (newMessage: MessageResponse) => {
            const targetConvId = (newMessage as any).conversationId || conversationId;
            if (targetConvId === conversationId) {
                addMessageToCache(newMessage);
                if (!isMinisized) {
                    chatService.markAsRead(conversationId).catch(() => { });
                }
            }
        };

        const handleUserRead = (convId: string, userId: string, messageId: string) => {
            if (convId !== conversationId) return;

            mutateConversations((currentPages: any) => {
                if (!currentPages || currentPages.length === 0) return currentPages;

                return currentPages.map((page: any) => {
                    if (!page || !page.items) return page;
                    const items = page.items.map((c: any) => {
                        if (c.id === convId) {
                            return {
                                ...c,
                                participants: c.participants.map((p: any) =>
                                    p.id === userId ? { ...p, lastReadMessageId: messageId } : p
                                )
                            };
                        }
                        return c;
                    });
                    return { ...page, items };
                });
            }, { revalidate: false });
        };

        connection.on("ReceiveNewMessage", handleNewMessage);
        connection.on("UserReadMessage", handleUserRead);

        return () => {
            connection.off("ReceiveNewMessage", handleNewMessage);
            connection.off("UserReadMessage", handleUserRead);
        };
    }, [connection, isConnected, conversationId, addMessageToCache, mutateConversations, isMinisized]);

    useEffect(() => {
        if (conversationId && !isMinisized) {
            let needsApiCall = false;

            mutateConversations((currentPages: any) => {
                if (!currentPages || currentPages.length === 0) return currentPages;

                let isChanged = false;
                const newPages = currentPages.map((page: any) => {
                    if (!page || !page.items) return page;
                    const items = page.items.map((c: any) => {
                        if (c.id === conversationId && c.hasUnread) {
                            isChanged = true;
                            needsApiCall = true;
                            return { ...c, hasUnread: false };
                        }
                        return c;
                    });
                    return { ...page, items };
                });

                if (!isChanged) return currentPages;
                return newPages;
            }, { revalidate: false });

            if (needsApiCall) {
                chatService.markAsRead(conversationId).catch(() => { });
            }
        }
    }, [conversationId, isMinisized, mutateConversations]);

    return {
        messages,
        isLoading,
        isValidating,
        isLoadingMore,
        hasMore,
        loadOlderMessages,
        addMessageToCache,
        updateMessageStatus
    };
}