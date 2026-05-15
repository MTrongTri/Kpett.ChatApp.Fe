import { useEffect, useRef } from 'react';
import { useSignalR } from '@/components/providers/signalr-provider';
import { MessageResponse, ConversationResponse } from '@/types/chat';
import { useDispatch, useSelector } from 'react-redux';
import { closeChatPopup, openChatPopupSilent } from '@/store/features/chat-slice';
import { useAuth } from '@/components/providers/auth-provider';
import { chatService } from '@/services/chat.service';
import { RootState } from '@/store/store';
import { useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';

export const useChatRealtime = (currentConversationId?: string | null) => {
    const { connection, isConnected } = useSignalR();
    const dispatch = useDispatch();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const openPopups = useSelector((state: RootState) => state.chatUI.openPopups);
    const openPopupsRef = useRef(openPopups);

    useEffect(() => {
        openPopupsRef.current = openPopups;
    }, [openPopups]);

    useEffect(() => {
        if (!isConnected || !connection) return;

        const handleNewMessage = async (newMessage: MessageResponse) => {
            const targetConvId = newMessage.conversationId || currentConversationId;
            if (!targetConvId) return;

            const isMyMessage = newMessage.senderId === user?.id;
            const isViewingInPopup = openPopupsRef.current.some(p => p.conversationId === targetConvId && !p.isMinimized);
            const isViewingInFullPage = typeof window !== 'undefined' && window.location.pathname.includes(`/chat/${targetConvId}`);
            const isViewing = currentConversationId === targetConvId || isViewingInPopup || isViewingInFullPage;

            let isFoundInCache = false;

            // A. CẬP NHẬT CACHE HIỆN TẠI VỚI IMMER
            queryClient.setQueryData(["conversations"], (oldData: any) => {
                if (!oldData?.pages) return oldData;

                return produce(oldData, (draft: any) => {
                    let foundConv = null;
                    let pageIdx = -1;
                    let itemIdx = -1;

                    for (let i = 0; i < draft.pages.length; i++) {
                        const idx = draft.pages[i].items?.findIndex((c: any) => c.id === targetConvId);
                        if (idx > -1) {
                            foundConv = draft.pages[i].items[idx];
                            pageIdx = i;
                            itemIdx = idx;
                            break;
                        }
                    }

                    if (foundConv) {
                        isFoundInCache = true;
                        foundConv.lastMessageAt = newMessage.createdAt;
                        foundConv.lastMessage = { ...newMessage };
                        foundConv.hasUnread = (!isMyMessage && !isViewing);

                        draft.pages[pageIdx].items.splice(itemIdx, 1);
                        draft.pages[0].items.unshift(foundConv);
                    }
                });
            });

            // B. FETCH BÙ NẾU KHÔNG CÓ TRONG CACHE
            if (!isFoundInCache) {
                try {
                    const missingConv = await chatService.getConversationById(targetConvId);
                    queryClient.setQueryData(["conversations"], (oldData: any) => {
                        if (!oldData?.pages) return { pages: [{ items: [missingConv] }], pageParams: [undefined] };

                        return produce(oldData, (draft: any) => {
                            const alreadyExists = draft.pages[0].items.some((c: any) => c.id === missingConv.id);
                            if (!alreadyExists) {
                                missingConv.hasUnread = (!isMyMessage && !isViewing);
                                missingConv.lastMessageAt = newMessage.createdAt;
                                missingConv.lastMessage = { ...newMessage };
                                draft.pages[0].items.unshift(missingConv);
                            }
                        });
                    });
                } catch (error) {
                    console.error("Lỗi khi fetch bù thông tin hội thoại:", error);
                    queryClient.invalidateQueries({ queryKey: ["conversations"] });
                }
            }


            // C. MỞ BONG BÓNG CHAT NGẦM
            if (!isMyMessage && !isViewing) {
                queryClient.setQueryData(["hasUnreadConversations"], true);
                dispatch(openChatPopupSilent({ conversationId: targetConvId, newMessage }));
            }
        };

        const handleNewConversation = (conversation: ConversationResponse) => {
            queryClient.setQueryData(["conversations"], (oldData: any) => {
                if (!oldData?.pages) return oldData;
                return produce(oldData, (draft: any) => {
                    const exists = draft.pages.some((page: any) => page.items?.some((c: any) => c.id === conversation.id));
                    if (!exists) {
                        draft.pages[0].items.unshift(conversation);
                    }
                });
            });
        };

        const handleRemovedFromConversation = (convId: string) => {
            queryClient.setQueryData(["conversations"], (oldData: any) => {
                if (!oldData?.pages) return oldData;
                return produce(oldData, (draft: any) => {
                    for (const page of draft.pages) {
                        page.items = page.items.filter((c: any) => c.id !== convId);
                    }
                });
            });
            dispatch(closeChatPopup(convId));
        };

        connection.on("ReceiveNewMessage", handleNewMessage);
        connection.on("NewConversationCreated", handleNewConversation);
        connection.on("RemovedFromConversation", handleRemovedFromConversation);

        return () => {
            connection.off("ReceiveNewMessage", handleNewMessage);
            connection.off("NewConversationCreated", handleNewConversation);
            connection.off("RemovedFromConversation", handleRemovedFromConversation);
        };
    }, [connection, isConnected, currentConversationId, queryClient, dispatch, user?.id]);
};