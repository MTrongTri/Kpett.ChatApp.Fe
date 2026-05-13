import React from 'react';
import ChatSidebar from '@/components/chat/chat-sidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-14.5 flex h-[calc(100dvh-58px)] w-full min-w-0 overflow-hidden border-t border-border bg-background">
            <ChatSidebar />

            {children}
        </div>
    );
}
