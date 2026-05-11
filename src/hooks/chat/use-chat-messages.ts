"use client";

import { useMemo, useCallback, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { MessageResponse } from "@/types/chat";
import { produce } from "immer";
import { useSignalR } from "@/components/providers/signalr-provider";

const MESSAGES_LIMIT = 20;

export function useChatMessages(conversationId: string | null, isMinisized: boolean = false) {
    const queryClient = useQueryClient();
    const { connection, isConnected } = useSignalR();

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
        queryKey: ["chat-messages", conversationId],
        queryFn: ({ pageParam }) => chatService.getMessages(conversationId!, MESSAGES_LIMIT, pageParam as string | undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.pagination?.nextCursor || undefined,
        enabled: !!conversationId && !isMinisized,
    });

    const messages = useMemo(() => {
        return data?.pages.flatMap((page) => page?.items ?? []).reverse() ?? [];
    }, [data]);

    const loadOlderMessages = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // CẬP NHẬT TRẠNG THÁI (Đang gửi -> Lỗi/Thành công) BẰNG IMMER
    const updateMessageStatus = useCallback((clientMessageId: string, status: "error" | "sent") => {
        queryClient.setQueryData(["chat-messages", conversationId], (oldData: any) => {
            if (!oldData?.pages) return oldData;

            return produce(oldData, (draft: any) => {
                const currentItems = draft.pages[0]?.items;
                if (!currentItems) return;

                const idx = currentItems.findIndex((m: MessageResponse) => m.clientMessageId === clientMessageId);
                if (idx > -1) {
                    if (status === "sent") {
                        // Nếu gửi thành công, XÓA trạng thái localStatus để UI trở về bình thường
                        delete currentItems[idx].localStatus;
                    } else {
                        // Nếu lỗi, gán thành "error"
                        currentItems[idx].localStatus = status;
                    }
                }
            });
        });
    }, [queryClient, conversationId]);

    // THÊM TIN NHẮN MỚI VÀO CACHE BẰNG IMMER
    const addMessageToCache = useCallback((newMessage: MessageResponse) => {
        // 1. Cập nhật mảng tin nhắn của cuộc hội thoại hiện tại
        queryClient.setQueryData(["chat-messages", conversationId], (oldData: any) => {

            // NẾU CHƯA CÓ CACHE (Chưa mở popup bao giờ) -> TUYỆT ĐỐI KHÔNG TẠO DUMMY DATA!
            // Việc tạo Dummy Data sẽ làm React Query lầm tưởng đã load xong và không fetch API nữa.
            if (!oldData?.pages || oldData.pages.length === 0) {
                return oldData;
            }

            return produce(oldData, (draft: any) => {
                const currentItems = draft.pages[0]?.items;
                if (!currentItems) return; // Bảo vệ an toàn

                const existingIndex = currentItems.findIndex(
                    (m: MessageResponse) => m.id === newMessage.id || (newMessage.clientMessageId && m.id === newMessage.clientMessageId)
                );

                if (existingIndex > -1) {
                    currentItems[existingIndex] = newMessage;
                } else {
                    currentItems.unshift(newMessage);
                }
            });
        });

        // 2. Cập nhật Sidebar Conversations (Đẩy hội thoại lên đầu + Update tin nhắn cuối)
        queryClient.setQueryData(["conversations"], (oldData: any) => {
            if (!oldData?.pages) return oldData;

            return produce(oldData, (draft: any) => {
                let foundConv = null;
                let pageIdx = -1;
                let itemIdx = -1;

                for (let i = 0; i < draft.pages.length; i++) {
                    const idx = draft.pages[i].items?.findIndex((c: any) => c.id === conversationId);
                    if (idx > -1) {
                        foundConv = draft.pages[i].items[idx];
                        pageIdx = i;
                        itemIdx = idx;
                        break;
                    }
                }

                if (foundConv) {
                    foundConv.lastMessageAt = newMessage.createdAt;
                    foundConv.lastMessage = { ...newMessage };
                    foundConv.hasUnread = isMinisized;

                    // Cắt ra khỏi vị trí cũ và đẩy lên đầu trang 1
                    draft.pages[pageIdx].items.splice(itemIdx, 1);
                    draft.pages[0].items.unshift(foundConv);
                }
            });
        });
    }, [queryClient, conversationId, isMinisized]);

    // LẮNG NGHE TIN NHẮN MỚI VÀ TRẠNG THÁI NGƯỜI KHÁC ĐÃ ĐỌC TỪ SIGNALR
    useEffect(() => {
        if (!isConnected || !connection || !conversationId) return;

        const handleNewMessage = (newMessage: MessageResponse) => {
            const targetConvId = (newMessage as any).conversationId || conversationId;
            if (targetConvId === conversationId) {
                // 1. Đẩy tin nhắn mới vào giao diện
                addMessageToCache(newMessage);

                // 2. Nếu đang mở khung chat (không thu nhỏ), báo server là đã đọc
                if (!isMinisized) {
                    chatService.markAsRead(conversationId).catch(() => { });
                }
            }
        };

        const handleUserRead = (convId: string, userId: string, messageId: string) => {
            if (convId !== conversationId) return;

            // Dùng Immer cập nhật an toàn avatar người đã đọc (lastReadMessageId)
            queryClient.setQueryData(["conversations"], (oldData: any) => {
                if (!oldData?.pages) return oldData;
                return produce(oldData, (draft: any) => {
                    for (const page of draft.pages) {
                        const conv = page.items?.find((c: any) => c.id === convId);
                        if (conv && conv.participants) {
                            const participant = conv.participants.find((p: any) => p.id === userId);
                            if (participant) {
                                participant.lastReadMessageId = messageId;
                            }
                        }
                    }
                });
            });
        };

        connection.on("ReceiveNewMessage", handleNewMessage);
        connection.on("UserReadMessage", handleUserRead);

        return () => {
            connection.off("ReceiveNewMessage", handleNewMessage);
            connection.off("UserReadMessage", handleUserRead);
        };
    }, [connection, isConnected, conversationId, addMessageToCache, isMinisized, queryClient]);

    // TỰ ĐỘNG XÓA CHẤM ĐỎ (UNREAD) KHI VỪA MỞ MÀN HÌNH CHAT
    useEffect(() => {
        if (conversationId && !isMinisized) {
            let needsApiCall = false;

            queryClient.setQueryData(["conversations"], (oldData: any) => {
                if (!oldData?.pages) return oldData;

                return produce(oldData, (draft: any) => {
                    for (const page of draft.pages) {
                        const conv = page.items?.find((c: any) => c.id === conversationId);
                        if (conv && conv.hasUnread) {
                            // Tắt chấm đỏ trên UI Sidebar/Dropdown ngay lập tức
                            conv.hasUnread = false;
                            needsApiCall = true;
                        }
                    }
                });
            });

            // Nếu phát hiện có chấm đỏ, gọi API để đồng bộ với Database
            if (needsApiCall) {
                chatService.markAsRead(conversationId).catch(() => { });
            }
        }
    }, [conversationId, isMinisized, queryClient]);

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