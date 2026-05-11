import { ConversationResponse } from "@/types/chat";

export const shouldShowDotOnline = (
    conversation: ConversationResponse,
    currentUserId: string | undefined
): boolean => {
    if (!conversation) return false;

    if (conversation.type === "Group") {
        return true;
    }

    return conversation.participants?.some(
        (p) => p.id !== currentUserId && p.isFriend
    ) ?? false;
};