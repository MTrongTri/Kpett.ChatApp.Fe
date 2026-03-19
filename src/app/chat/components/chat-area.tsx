"use client";

import ChatAreaHeader    from "./chat-area-header";
import ChatMessageList  from "./chat-message-list";
import ChatInputBar     from "./chat-input-bar";
import type { Conversation } from "@/types/chat";

interface ChatAreaProps {
  conversation: Conversation | null;
  isTyping:     boolean;
  infoOpen:     boolean;
  onToggleInfo: () => void;
  onSend:       (text: string) => void;
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4 text-foreground/25">
      <span className="text-[56px]">💬</span>
      <p className="font-mono text-[11px] uppercase tracking-[0.12em]">
        Chọn một cuộc trò chuyện
      </p>
    </div>
  );
}

export default function ChatArea({
  conversation,
  isTyping,
  infoOpen,
  onToggleInfo,
  onSend,
}: ChatAreaProps) {
  if (!conversation) {
    return (
      <div className="flex-1 flex min-w-0">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ChatAreaHeader
        partner={conversation.partner}
        isTyping={isTyping}
        infoOpen={infoOpen}
        onToggleInfo={onToggleInfo}
      />

      <ChatMessageList
        messages={conversation.messages}
        partner={conversation.partner}
        isTyping={isTyping}
      />

      <ChatInputBar
        partnerName={conversation.partner.displayName}
        onSend={onSend}
      />
    </div>
  );
}
