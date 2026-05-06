import React from 'react';
import ChatSidebar from '@/components/chat/chat-sidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-14.5 flex h-[calc(100vh-64px)] w-full bg-background overflow-hidden border-t border-border">
            <ChatSidebar />

            {children}
        </div>
    );
}