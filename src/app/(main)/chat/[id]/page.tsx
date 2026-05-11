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
                toggleInfo={() => setIsInfoOpen(!isInfoOpen)}
            />

            {/* Cột phải: Thông tin hội thoại */}
            {isInfoOpen && (
                <ChatInfo conversationId={conversationId} onClose={() => setIsInfoOpen(false)} />
            )}
        </>
    );
}