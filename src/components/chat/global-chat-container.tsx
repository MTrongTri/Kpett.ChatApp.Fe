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
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-end justify-end gap-3 px-2 pb-[env(safe-area-inset-bottom)] sm:right-4 sm:left-auto sm:flex-row-reverse sm:items-end sm:justify-start sm:gap-4 sm:px-0 sm:pb-0">

            {/* NHÓM 1: BONG BÓNG CHAT - Xếp chồng theo chiều dọc ở sát mép phải */}
            <div className="mb-4 flex flex-col-reverse items-center gap-3">
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
            <div className="flex w-full flex-col-reverse items-stretch gap-3 sm:w-auto sm:flex-row-reverse sm:items-end">
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
