// components/chat/chat-message-bubble.tsx
import React from 'react';
import { MessageResponse, ParticipantResponse } from '@/types/chat';
import { UserAvatar } from '@/components/user/user-avatar';
import { AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { formatSystemMessage } from '@/lib/message-utils';
import { formatRelativeTime } from '@/lib/format-date-utils';
import { cn } from '@/lib/utils';

interface BubbleProps {
    msg: MessageResponse;
    isMine: boolean;
    isConsecutive: boolean;
    readers?: ParticipantResponse[];
    isLastMessage?: boolean;
}

export default function ChatMessageBubble({ msg, isMine, isConsecutive, readers = [], isLastMessage = false }: BubbleProps) {
    const { user } = useAuth();
    const currentUserId = user?.id;

    if (msg.type === "System") {
        return (
            <div className="w-full flex justify-center items-center my-6">
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full font-medium text-center max-w-[85%] border border-border/50 shadow-sm">
                    {formatSystemMessage(msg, currentUserId)}
                </span>
            </div>
        );
    }

    const borderRadiusClass = isMine
        ? isConsecutive ? "rounded-2xl rounded-tr-sm rounded-br-sm" : "rounded-2xl rounded-br-sm"
        : isConsecutive ? "rounded-2xl rounded-tl-sm rounded-bl-sm" : "rounded-2xl rounded-bl-sm";

    return (
        <div className='w-full'>
            <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} ${isConsecutive ? "mt-0.5" : "mt-4"}`}>
                <div className={`flex ${isMine ? "justify-end" : "justify-start"} w-full`}>
                    {!isMine && (
                        <div className="w-8 mr-2 shrink-0 flex items-end">
                            {!isConsecutive && (
                                <UserAvatar
                                    user={{
                                        id: msg.senderId,
                                        displayName: msg.senderName,
                                        avatarUrl: msg.senderAvatarUrl,
                                    }}
                                    className="w-7 h-7 border-border"
                                />
                            )}
                        </div>
                    )}

                    <div className="relative max-w-[65%] group flex items-center gap-2 group">
                        <span className={cn(
                            "absolute top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap text-[10px] text-muted-foreground",
                            isMine ? "right-full mr-2" : "left-full ml-2"
                        )}>
                            {formatRelativeTime(msg.createdAt)}
                        </span>
                        <div className={`px-4 py-2 text-[15px] shadow-sm ${borderRadiusClass} ${isMine ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
                            } ${msg.localStatus === "sending" ? "opacity-70" : ""}`}>
                            {msg.content}
                        </div>
                    </div>
                </div>

                {isMine && msg.localStatus && (
                    <div className="flex items-center gap-1 mt-1 mr-1">
                        {msg.localStatus === "sending" && <Circle size={12} className="text-muted-foreground animate-pulse" />}
                        {msg.localStatus === "error" && <AlertCircle size={12} className="text-destructive" />}
                    </div>
                )}

                {isMine && !msg.localStatus && readers.length === 0 && isLastMessage && (
                    <div className="flex items-center gap-1 mt-1 mr-1">
                        <CheckCircle2 size={12} className="text-muted-foreground" />
                    </div>
                )}
            </div>

            {readers.length > 0 && isLastMessage && (
                <div className="flex items-center gap-1 mt-1 justify-end">
                    {readers.map(reader => (
                        <UserAvatar
                            key={reader.id}
                            user={reader}
                            className="w-4 h-4"
                            initialClassName="text-[8px]"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}