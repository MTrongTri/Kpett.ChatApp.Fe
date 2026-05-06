"use client";

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import ChatPopup from './chat-popup';
import { useChatRealtime } from '@/hooks/chat/use-chat-realtime';

export default function GlobalChatContainer() {
    const openPopups = useSelector((state: RootState) => state.chatUI.openPopups);

    // KÍCH HOẠT LẮNG NGHE SỰ KIỆN SIGNALR TOÀN CỤC
    useChatRealtime(null);

    if (openPopups.length === 0) return null;

    // Tách 2 nhóm popup
    const minimizedPopups = openPopups.filter(p => p.isMinimized);
    const expandedPopups = openPopups.filter(p => !p.isMinimized);

    return (
        <div className="fixed bottom-0 right-4 z-50 flex flex-row-reverse items-end pointer-events-none gap-4">

            {/* NHÓM 1: BONG BÓNG CHAT - Xếp chồng theo chiều dọc ở sát mép phải */}
            <div className="flex flex-col-reverse items-center gap-3 mb-4">
                {minimizedPopups.map((popup) => (
                    <div key={popup.conversationId} className="pointer-events-auto">
                        <ChatPopup
                            conversationId={popup.conversationId}
                            isMinimized={true}
                            newMessage={popup.newMessage}
                        />
                    </div>
                ))}
            </div>

            {/* NHÓM 2: CỬA SỔ CHAT - Xếp hàng ngang sang bên trái của nhóm bong bóng */}
            <div className="flex flex-row-reverse items-end gap-3">
                {expandedPopups.map((popup) => (
                    <div key={popup.conversationId} className="pointer-events-auto">
                        <ChatPopup
                            conversationId={popup.conversationId}
                            isMinimized={false}
                            newMessage={popup.newMessage}
                        />
                    </div>
                ))}
            </div>

        </div>
    );
}