"use client";

import React from "react";
import { formatMessageDateHeader } from "@/lib/format-date-utils";
import { MessageResponse, ConversationResponse } from "@/types/chat";
import ChatMessageBubble from "./chat-message-bubble";

interface ChatMessageListProps {
    messages: MessageResponse[];
    currentUserId?: string;
    conversation?: ConversationResponse | null;
}

export function ChatMessageList({
    messages,
    currentUserId,
    conversation,
}: ChatMessageListProps) {
    return (
        <>
            {messages.map((message, index) => {
                const isMine = message.senderId === currentUserId;

                const previousMessage =
                    index > 0 ? messages[index - 1] : null;

                const isConsecutive =
                    previousMessage?.senderId === message.senderId &&
                    message.type !== "System";

                const readers =
                    conversation?.participants?.filter(
                        (participant) =>
                            participant.id !== currentUserId &&
                            participant.lastReadMessageId === message.id
                    ) ?? [];

                const isLastMessage =
                    index === messages.length - 1;

                const currentDateLabel =
                    formatMessageDateHeader(message.createdAt);

                const previousDateLabel = previousMessage
                    ? formatMessageDateHeader(previousMessage.createdAt)
                    : null;

                const showDateDivider =
                    currentDateLabel !== previousDateLabel;

                return (
                    <React.Fragment key={message.id}>
                        {showDateDivider && (
                            <div className="my-6 flex justify-center">
                                <span className="bg-background border-border rounded-full border px-3 py-1 text-[11px] font-normal text-muted-foreground shadow-sm">
                                    {currentDateLabel}
                                </span>
                            </div>
                        )}

                        <div
                            className={`mb-1 flex flex-col ${isMine ? "items-end" : "items-start"
                                }`}
                        >
                            <ChatMessageBubble
                                msg={message}
                                isMine={isMine}
                                isConsecutive={isConsecutive}
                                readers={readers}
                                isLastMessage={isLastMessage}
                            />
                        </div>
                    </React.Fragment>
                );
            })}
        </>
    );
}