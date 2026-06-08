import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { useTrackPresence } from '@/hooks/use-track-presence';
import { ConversationResponse, ParticipantResponse } from '@/types/chat';
import { PaginatedData } from '@/types/common/api';

type ConversationsCache = InfiniteData<
    PaginatedData<ConversationResponse>,
    string | undefined
>;

export function useConversationPresenceSync(
    conversationId: string,
    participants: Pick<ParticipantResponse, 'id'>[] = []
) {
    const queryClient = useQueryClient();
    const participantIds = participants.map((participant) => participant.id);

    useTrackPresence(participantIds, ({ userId, isOnline }) => {
        queryClient.setQueryData<ConversationResponse>(
            ["conversation", conversationId],
            (oldData) => {
                if (!oldData) return oldData;

                return produce(oldData, (draft) => {
                    const participant = draft.participants.find(
                        (member) => member.id === userId
                    );

                    if (participant) {
                        participant.isOnline = isOnline;
                    }
                });
            }
        );

        queryClient.setQueryData<ConversationsCache>(["conversations"], (oldData) => {
            if (!oldData?.pages.length) return oldData;

            return produce(oldData, (draft) => {
                for (const page of draft.pages) {
                    const conversation = page.items.find(
                        (cachedConversation) => cachedConversation.id === conversationId
                    );

                    if (!conversation) {
                        continue;
                    }

                    const sidebarParticipant = conversation.participants.find(
                        (member) => member.id === userId
                    );

                    if (sidebarParticipant) {
                        sidebarParticipant.isOnline = isOnline;
                    }
                }
            });
        });
    });
}
