// components/chat/chat-message-bubble.tsx
import React from 'react';
import { MessageResponse, ParticipantResponse } from '@/types/chat';
import { UserAvatar } from '@/components/user/user-avatar';
import { AlertCircle, CheckCircle2, Circle } from 'lucide-react';

interface BubbleProps {
    msg: MessageResponse;
    isMine: boolean;
    isConsecutive: boolean;
    readers?: ParticipantResponse[];
    isLastMessage?: boolean;
}

export default function ChatMessageBubble({ msg, isMine, isConsecutive, readers = [], isLastMessage = false }: BubbleProps) {
    if (msg.type === "System") {
        return (
            <div className="flex justify-center my-6">
                <span className="text-xs text-muted-foreground bg-muted/80 px-3 py-1 rounded-full font-medium">
                    {msg.content}
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
                                    user={{ id: msg.senderId, displayName: msg.senderName, avatarUrl: msg.senderAvatarUrl }}
                                    className="w-7 h-7 border-border"
                                />
                            )}
                        </div>
                    )}

                    <div className="max-w-[65%] group flex items-center gap-2">
                        <div className={`px-4 py-2 text-[15px] shadow-sm ${borderRadiusClass} ${isMine ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
                            } ${msg.localStatus === "sending" ? "opacity-70" : ""}`}>
                            {msg.content}
                        </div>
                    </div>
                </div>

                {/* TRẠNG THÁI GỬI TIN NHẮN (Đang gửi / Lỗi) */}
                {isMine && msg.localStatus && (
                    <div className="flex items-center gap-1 mt-1 mr-1">
                        {msg.localStatus === "sending" && <Circle size={12} className="text-muted-foreground animate-pulse" />}
                        {msg.localStatus === "error" && <AlertCircle size={12} className="text-destructive" />}
                    </div>
                )}

                {/* CHỈ HIỆN TICK KHI LÀ MESSAGE CUỐI CÙNG */}
                {isMine && !msg.localStatus && readers.length === 0 && isLastMessage && (
                    <div className="flex items-center gap-1 mt-1 mr-1">
                        <CheckCircle2 size={12} className="text-muted-foreground" />
                    </div>
                )}

            </div>

            {/* HIỂN THỊ AVATAR NGƯỜI ĐÃ XEM */}
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