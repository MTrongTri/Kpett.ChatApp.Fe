import { useEffect, useRef } from 'react';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
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
import { PaginatedData } from '@/types/common/api';
import { playSound } from '@/lib/notification-sound';

type ConversationsCache = InfiniteData<
    PaginatedData<ConversationResponse>,
    string | undefined
>;

const createConversationCache = (
    items: ConversationResponse[]
): ConversationsCache => ({
    pages: [
        {
            items,
            pagination: {
                nextCursor: null,
                hasMore: false,
                limit: items.length || 1,
            },
        },
    ],
    pageParams: [undefined],
});

const playedMessageSoundIds = new Set<string>();

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

            let isFoundInCache = false;

            queryClient.setQueryData<ConversationsCache>(
                ['conversations'],
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
                                (conversation) =>
                                    conversation.id === targetConversationId
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

                        isFoundInCache = true;
                        foundConversation.lastMessageAt = newMessage.createdAt;
                        foundConversation.lastMessage = { ...newMessage };
                        foundConversation.hasUnread = !isMyMessage && !isViewing;

                        draft.pages[pageIndex].items.splice(itemIndex, 1);
                        draft.pages[0].items.unshift(foundConversation);
                    });
                }
            );

            if (!isFoundInCache) {
                try {
                    const missingConversation =
                        await chatService.getConversationById(targetConversationId);

                    queryClient.setQueryData<ConversationsCache>(
                        ['conversations'],
                        (oldData) => {
                            if (!oldData?.pages.length) {
                                missingConversation.hasUnread =
                                    !isMyMessage && !isViewing;
                                missingConversation.lastMessageAt =
                                    newMessage.createdAt;
                                missingConversation.lastMessage = { ...newMessage };

                                return createConversationCache([missingConversation]);
                            }

                            return produce(oldData, (draft) => {
                                const alreadyExists = draft.pages.some((page) =>
                                    page.items.some(
                                        (conversation) =>
                                            conversation.id === missingConversation.id
                                    )
                                );

                                if (alreadyExists) {
                                    return;
                                }

                                missingConversation.hasUnread =
                                    !isMyMessage && !isViewing;
                                missingConversation.lastMessageAt =
                                    newMessage.createdAt;
                                missingConversation.lastMessage = { ...newMessage };
                                draft.pages[0].items.unshift(missingConversation);
                            });
                        }
                    );
                } catch (error) {
                    console.error(
                        'Loi khi fetch bu thong tin hoi thoai:',
                        error
                    );
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                }
            }

            if (!isMyMessage && !isViewing) {
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
            queryClient.setQueryData<ConversationsCache>(
                ['conversations'],
                (oldData) => {
                    if (!oldData?.pages.length) {
                        return createConversationCache([conversation]);
                    }

                    return produce(oldData, (draft) => {
                        const exists = draft.pages.some((page) =>
                            page.items.some(
                                (cachedConversation) =>
                                    cachedConversation.id === conversation.id
                            )
                        );

                        if (!exists) {
                            draft.pages[0].items.unshift(conversation);
                        }
                    });
                }
            );
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

        connection.on('ReceiveNewMessage', handleNewMessage);
        connection.on('NewConversationCreated', handleNewConversation);
        connection.on(
            'RemovedFromConversation',
            handleRemovedFromConversation
        );

        return () => {
            connection.off('ReceiveNewMessage', handleNewMessage);
            connection.off('NewConversationCreated', handleNewConversation);
            connection.off(
                'RemovedFromConversation',
                handleRemovedFromConversation
            );
        };
    }, [connection, isConnected, currentConversationId, queryClient, dispatch, user?.id]);
};
