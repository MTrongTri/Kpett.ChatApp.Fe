import React from "react";
import ChatSidebar from "@/components/chat/chat-sidebar";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Tin nhắn",
  description:
    "Quản lý cuộc trò chuyện và nhắn tin theo thời gian thực trên Kpett ChatApp.",
  path: "/chat",
  noIndex: true,
});

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-background mt-14.5 flex h-[calc(100dvh-58px)] w-full min-w-0 overflow-hidden border-t">
      <ChatSidebar />

      {children}
    </div>
  );
}
