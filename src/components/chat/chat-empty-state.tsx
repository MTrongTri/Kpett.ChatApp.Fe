"use client";

import { ConversationAvatar } from "./conversation-avatar";
import { ConversationResponse } from "@/types/chat";

const suggestedMessages = [
    "Xin chào 👋",
    "Hi 👋",
    "Ê",
    "Làm quen nhé",
];

interface Props {
    conversation: ConversationResponse;
    onSend: (message: string) => void;
}

export function ChatEmptyState({
    conversation,
    onSend,
}: Props) {
    return (
        <div className="flex h-full flex-col items-center justify-center px-6">
            <ConversationAvatar
                conversation={conversation}
                isShowDotOnline={false}
                className="h-16 w-16"
            />

            <h3 className="mt-4 text-base font-semibold">
                {conversation.name}
            </h3>

            <p className="mt-1 text-center text-sm text-muted-foreground">
                Hãy bắt đầu cuộc trò chuyện với {conversation.name} bằng cách gửi tin nhắn đầu tiên.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestedMessages.map((message) => (
                    <button
                        key={message}
                        onClick={() => onSend(message)}
                        className="rounded-full border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-muted"
                    >
                        {message}
                    </button>
                ))}
            </div>
        </div>
    );
}