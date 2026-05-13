// app/chat/[id]/page.tsx
"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import ChatWindow from '@/components/chat/chat-window';
import ChatInfo from '@/components/chat/chat-info';
import { useChatRealtime } from '@/hooks/chat/use-chat-realtime';

export default function ChatConversationPage() {
    // Đọc conversationId trực tiếp từ thư mục [id]
    const params = useParams();
    const conversationId = params.id as string;

    const [isInfoOpen, setIsInfoOpen] = useState(false);

    // Kích hoạt kết nối realtime chung
    useChatRealtime(null);

    if (!conversationId) return null;

    return (
        <>
            {/* Cột giữa: Khung chat chính */}
            <ChatWindow
                key={conversationId}
                conversationId={conversationId}
                mobileBackHref="/chat"
                toggleInfo={() => setIsInfoOpen((open) => !open)}
            />

            {/* Cột phải: Thông tin hội thoại */}
            {isInfoOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 md:contents md:bg-transparent"
                    onClick={() => setIsInfoOpen(false)}
                >
                    <div className="h-full w-full md:contents" onClick={(event) => event.stopPropagation()}>
                        <ChatInfo
                            conversationId={conversationId}
                            onClose={() => setIsInfoOpen(false)}
                            className="w-full border-l-0 md:w-[320px] md:border-l"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
