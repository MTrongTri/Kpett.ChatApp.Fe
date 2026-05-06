import { useEffect, useRef } from 'react';
import { useSignalR } from '@/components/providers/signalr-provider';
import { MessageResponse, ConversationResponse } from '@/types/chat';
import { useDispatch, useSelector } from 'react-redux';
import { closeChatPopup, openChatPopupSilent } from '@/store/features/chat-slice';
import { useAuth } from '@/components/providers/auth-provider';
import { chatService } from '@/services/chat.service';
import { useConversations } from '@/hooks/chat/use-conversations';
import { RootState } from '@/store/store';

export const useChatRealtime = (currentConversationId?: string | null) => {
    const { connection, isConnected } = useSignalR();
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { mutate: mutateConversations } = useConversations();

    // 1. Theo dõi danh sách Popup đang mở từ Redux (Dùng Ref để không re-trigger SignalR)
    const openPopups = useSelector((state: RootState) => state.chatUI.openPopups);
    const openPopupsRef = useRef(openPopups);

    useEffect(() => {
        openPopupsRef.current = openPopups;
    }, [openPopups]);

    useEffect(() => {
        if (!isConnected || !connection) return;

        const handleNewMessage = async (newMessage: MessageResponse) => {
            const targetConvId = newMessage.conversationId || currentConversationId;

            if (targetConvId) {
                const isMyMessage = newMessage.senderId === user?.id;

                // 2. LOGIC KIỂM TRA ĐANG XEM CHÍNH XÁC 100%:
                // - Có đang mở Popup và không bị thu nhỏ?
                // - Hoặc đang ở trang Full Chat (/chat/[id])?
                const isViewingInPopup = openPopupsRef.current.some(p => p.conversationId === targetConvId && !p.isMinimized);
                const isViewingInFullPage = typeof window !== 'undefined' && window.location.pathname.includes(`/chat/${targetConvId}`);
                const isViewing = currentConversationId === targetConvId || isViewingInPopup || isViewingInFullPage;

                let isFoundInCache = false;

                // A. THỬ CẬP NHẬT TRONG CACHE HIỆN TẠI
                mutateConversations((currentPages: any) => {
                    if (!currentPages || currentPages.length === 0) return currentPages;

                    const newPages = [...currentPages];
                    let foundConv: any = null;
                    let pageIdx = -1;
                    let itemIdx = -1;

                    for (let i = 0; i < newPages.length; i++) {
                        if (!newPages[i] || !newPages[i].items) continue;
                        const idx = newPages[i].items.findIndex((c: any) => c.id === targetConvId);
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

                        // QUYẾT ĐỊNH DẤU CHẤM ĐỎ TẠI ĐÂY
                        foundConv.hasUnread = (!isMyMessage && !isViewing);

                        const itemsInPage = [...newPages[pageIdx].items];
                        itemsInPage.splice(itemIdx, 1);
                        newPages[pageIdx] = { ...newPages[pageIdx], items: itemsInPage };

                        const firstPageItems = [...(newPages[0].items || [])];
                        firstPageItems.unshift(foundConv);
                        newPages[0] = { ...newPages[0], items: firstPageItems };
                    }

                    return newPages;
                }, { revalidate: false });

                // B. NẾU KHÔNG TÌM THẤY TRONG CACHE -> FETCH BÙ
                if (!isFoundInCache) {
                    try {
                        const missingConv = await chatService.getConversationById(targetConvId);

                        mutateConversations((currentPages: any) => {
                            const pages = currentPages ? [...currentPages] : [];

                            if (!pages[0]) pages[0] = { items: [], pagination: {} };
                            if (!pages[0].items) pages[0].items = [];

                            const alreadyExists = pages[0].items.some((c: any) => c.id === missingConv.id);

                            if (!alreadyExists) {
                                // Tương tự, nếu đang mở xem thì coi như đã đọc
                                missingConv.hasUnread = (!isMyMessage && !isViewing);
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

                // C. TỰ ĐỘNG MỞ BONG BÓNG CHAT NGẦM (CHỈ KHI KHÔNG ĐANG XEM)
                if (!isMyMessage && !isViewing) {
                    dispatch(openChatPopupSilent({
                        conversationId: targetConvId,
                        newMessage: newMessage
                    }));
                }
            }
        };

        const handleNewConversation = (conversation: ConversationResponse) => {
            mutateConversations((currentPages: any) => {
                if (!currentPages || currentPages.length === 0) return currentPages;

                const newPages = [...currentPages];
                const exists = newPages.some(page => page.items?.some((c: any) => c.id === conversation.id));
                if (exists) return currentPages;

                const firstPageItems = [...(newPages[0].items || [])];
                firstPageItems.unshift(conversation);
                newPages[0] = { ...newPages[0], items: firstPageItems };

                return newPages;
            }, { revalidate: false });
        };

        const handleConversationUpdated = (conversation: ConversationResponse) => {
            mutateConversations((currentPages: any) => {
                if (!currentPages || currentPages.length === 0) return currentPages;

                const newPages = currentPages.map((page: any) => ({
                    ...page,
                    items: (page.items || []).filter((c: any) => c.id !== conversation.id)
                }));

                newPages[0].items.unshift(conversation);
                return newPages;
            }, { revalidate: false });
        };

        const handleAddedToConversation = (convId: string) => mutateConversations();

        const handleRemovedFromConversation = (convId: string) => {
            mutateConversations((currentPages: any) => {
                if (!currentPages || currentPages.length === 0) return currentPages;

                return currentPages.map((page: any) => ({
                    ...page,
                    items: (page.items || []).filter((c: any) => c.id !== convId)
                }));
            }, { revalidate: false });

            dispatch(closeChatPopup(convId));
        };

        connection.on("ReceiveNewMessage", handleNewMessage);
        connection.on("NewConversationCreated", handleNewConversation);
        connection.on("ConversationUpdated", handleConversationUpdated);
        connection.on("AddedToConversation", handleAddedToConversation);
        connection.on("RemovedFromConversation", handleRemovedFromConversation);

        return () => {
            connection.off("ReceiveNewMessage", handleNewMessage);
            connection.off("NewConversationCreated", handleNewConversation);
            connection.off("ConversationUpdated", handleConversationUpdated);
            connection.off("AddedToConversation", handleAddedToConversation);
            connection.off("RemovedFromConversation", handleRemovedFromConversation);
        };
    }, [connection, isConnected, currentConversationId, mutateConversations, dispatch, user?.id]);
};