import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { ConversationResponse, MessageResponse } from "@/types/chat";
import { PaginatedData } from "@/types/common/api";

export type MessagesCache = InfiniteData<
    PaginatedData<MessageResponse>,
    string | undefined
>;

export type ConversationsCache = InfiniteData<
    PaginatedData<ConversationResponse>,
    string | undefined
>;

export const createConversationCache = (
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

export const upsertMessageInMessagesCache = (
    queryClient: QueryClient,
    conversationId: string,
    newMessage: MessageResponse
) => {
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
                        (!!newMessage.clientMessageId &&
                            (message.id === newMessage.clientMessageId ||
                                message.clientMessageId === newMessage.clientMessageId))
                );

                if (existingIndex > -1) {
                    currentItems[existingIndex] = newMessage;
                    return;
                }

                currentItems.unshift(newMessage);
            });
        }
    );
};

export const updateConversationCacheWithMessage = (
    queryClient: QueryClient,
    conversationId: string,
    newMessage: MessageResponse,
    hasUnread: boolean
) => {
    let isFoundInCache = false;

    queryClient.setQueryData<ConversationsCache>(
        ["conversations"],
        (oldData) => {
            if (!oldData?.pages.length) return oldData;

            return produce(oldData, (draft) => {
                let pageIndex = -1;
                let itemIndex = -1;

                for (let index = 0; index < draft.pages.length; index += 1) {
                    const conversationIndex = draft.pages[index].items.findIndex(
                        (conversation) => conversation.id === conversationId
                    );

                    if (conversationIndex > -1) {
                        pageIndex = index;
                        itemIndex = conversationIndex;
                        break;
                    }
                }

                if (pageIndex === -1 || itemIndex === -1) {
                    return;
                }

                isFoundInCache = true;
                const [conversation] = draft.pages[pageIndex].items.splice(itemIndex, 1);
                conversation.lastMessageAt = newMessage.createdAt;
                conversation.lastMessage = { ...newMessage };
                conversation.hasUnread = hasUnread;
                draft.pages[0].items.unshift(conversation);
            });
        }
    );

    return isFoundInCache;
};

export const insertConversationAtTopIfMissing = (
    queryClient: QueryClient,
    conversation: ConversationResponse
) => {
    queryClient.setQueryData<ConversationsCache>(
        ["conversations"],
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

                if (exists) return;

                draft.pages[0].items.unshift(conversation);
            });
        }
    );
};
