import { useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { useTrackPresence } from '@/hooks/use-track-presence';
import { ConversationResponse } from '@/types/chat';

export function useConversationPresenceSync(conversationId: string, participants: { id: string }[]) {
    const queryClient = useQueryClient();

    // Lọc ra ID của các thành viên để track
    const participantIds = participants?.map(p => p.id) || [];

    useTrackPresence(participantIds, ({ userId, isOnline }) => {
        // 1. Cập nhật trạng thái online trong detail hội thoại
        queryClient.setQueryData<ConversationResponse>(["conversation", conversationId], (oldData) => {
            if (!oldData) return oldData;
            return produce(oldData, draft => {
                const participant = draft.participants.find(p => p.id === userId);
                if (participant) {
                    participant.isOnline = isOnline;
                }
            });
        });

        // 2. Tùy chọn: Đồng bộ vào cả list Sidebar nếu danh sách sidebar lưu participants
        queryClient.setQueryData(["conversations"], (oldData: any) => {
            if (!oldData?.pages) return oldData;
            return produce(oldData, (draft: any) => {
                for (const page of draft.pages) {
                    const conv = page.items?.find((c: any) => c.id === conversationId);
                    if (conv && conv.participants) {
                        const sidebarParticipant = conv.participants.find((p: any) => p.id === userId);
                        if (sidebarParticipant) sidebarParticipant.isOnline = isOnline;
                    }
                }
            });
        });
    });
}