import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { produce } from 'immer';
import { useAuth } from '@/components/providers/auth-provider';
import { useSignalR } from '@/components/providers/signalr-provider';
import { chatService } from '@/services/chat.service';
import {
    closeChatPopup,
    openChatPopupSilent
} from '@/store/features/chat-slice';
import { RootState } from '@/store/store';
import { ConversationResponse, MessageResponse } from '@/types/chat';
import { playSound } from '@/lib/notification-sound';
import {
    ConversationsCache,
    insertConversationAtTopIfMissing,
    updateConversationCacheWithMessage,
    upsertMessageInMessagesCache,
} from './chat-cache-utils';

const playedMessageSoundIds = new Set<string>();
const markedAsReadAtByConversation = new Map<string, number>();

const playIncomingMessageSoundOnce = (messageId: string) => {
    if (playedMessageSoundIds.has(messageId)) return;

    playedMessageSoundIds.add(messageId);
    if (playedMessageSoundIds.size > 100) {
        const oldestMessageId = playedMessageSoundIds.values().next().value;
        if (oldestMessageId) {
            playedMessageSoundIds.delete(oldestMessageId);
        }
    }

    playSound('chat_message', 0.75);
};

const markConversationAsReadThrottled = (conversationId: string) => {
    const now = Date.now();
    const lastMarkedAt = markedAsReadAtByConversation.get(conversationId) ?? 0;
    if (now - lastMarkedAt < 2000) return;

    markedAsReadAtByConversation.set(conversationId, now);
    if (markedAsReadAtByConversation.size > 100) {
        const oldestConversationId = markedAsReadAtByConversation.keys().next().value;
        if (oldestConversationId) {
            markedAsReadAtByConversation.delete(oldestConversationId);
        }
    }

    chatService.markAsRead(conversationId).catch(() => undefined);
};

export const useChatRealtime = (currentConversationId?: string | null) => {
    const { connection, isConnected, reconnectVersion } = useSignalR();
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
            const targetConversationId =
                newMessage.conversationId ?? currentConversationId;
            if (!targetConversationId) return;

            const isMyMessage = newMessage.senderId === user?.id;
            const isViewingInPopup = openPopupsRef.current.some(
                (popup) =>
                    popup.conversationId === targetConversationId &&
                    !popup.isMinimized
            );
            const isViewingInFullPage =
                typeof window !== 'undefined' &&
                window.location.pathname.includes(`/chat/${targetConversationId}`);
            const isViewing =
                currentConversationId === targetConversationId ||
                isViewingInPopup ||
                isViewingInFullPage;
            const hasUnread = !isMyMessage && !isViewing;

            upsertMessageInMessagesCache(
                queryClient,
                targetConversationId,
                newMessage
            );

            const isFoundInCache = updateConversationCacheWithMessage(
                queryClient,
                targetConversationId,
                newMessage,
                hasUnread
            );

            if (!isFoundInCache) {
                try {
                    const missingConversation =
                        await queryClient.fetchQuery({
                            queryKey: ['conversation', targetConversationId],
                            queryFn: () => chatService.getConversationById(targetConversationId),
                            staleTime: 30000,
                        });

                    insertConversationAtTopIfMissing(queryClient, {
                        ...missingConversation,
                        hasUnread,
                        lastMessageAt: newMessage.createdAt,
                        lastMessage: { ...newMessage },
                    });
                } catch (error) {
                    console.error(
                        'Loi khi fetch bu thong tin hoi thoai:',
                        error
                    );
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                }
            }

            if (!isMyMessage && isViewing) {
                markConversationAsReadThrottled(targetConversationId);
            }

            if (hasUnread) {
                if (newMessage.type !== 'System') {
                    playIncomingMessageSoundOnce(newMessage.id);
                }

                queryClient.setQueryData(['hasUnreadConversations'], true);
                dispatch(
                    openChatPopupSilent({
                        conversationId: targetConversationId,
                        newMessage,
                    })
                );
            }
        };

        const handleNewConversation = (conversation: ConversationResponse) => {
            insertConversationAtTopIfMissing(queryClient, conversation);
        };

        const handleRemovedFromConversation = (conversationId: string) => {
            queryClient.setQueryData<ConversationsCache>(
                ['conversations'],
                (oldData) => {
                    if (!oldData?.pages.length) return oldData;

                    return produce(oldData, (draft) => {
                        for (const page of draft.pages) {
                            page.items = page.items.filter(
                                (conversation) => conversation.id !== conversationId
                            );
                        }
                    });
                }
            );

            dispatch(closeChatPopup(conversationId));
        };

        const handleAddedToConversation = (addedConversationId: string) => {
            if (addedConversationId === currentConversationId) return;

            chatService.getConversationById(addedConversationId).then((conversation) => {
                insertConversationAtTopIfMissing(queryClient, conversation);
            }).catch(() => {
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            });
        };

        connection.on('ReceiveNewMessage', handleNewMessage);
        connection.on('NewConversationCreated', handleNewConversation);
        connection.on('RemovedFromConversation', handleRemovedFromConversation);
        connection.on('AddedToConversation', handleAddedToConversation);

        return () => {
            connection.off('ReceiveNewMessage', handleNewMessage);
            connection.off('NewConversationCreated', handleNewConversation);
            connection.off('RemovedFromConversation', handleRemovedFromConversation);
            connection.off('AddedToConversation', handleAddedToConversation);
        };
    }, [connection, isConnected, reconnectVersion, currentConversationId, queryClient, dispatch, user?.id]);
};
