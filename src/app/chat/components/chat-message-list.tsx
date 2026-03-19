"use client";

import { useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import ChatBubble          from "./chat-bubble";
import ChatTypingIndicator from "./chat-typing-indicator";
import type { ChatMessage, ChatUser } from "@/types/chat";

interface ChatMessageListProps {
  messages:  ChatMessage[];
  partner:   ChatUser;
  isTyping:  boolean;
}

export default function ChatMessageList({
  messages,
  partner,
  isTyping,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3 bg-background">
      {/* Date separator */}
      <div className="flex items-center gap-3 my-2">
        <Separator className="flex-1 bg-border" />
        <span className="text-[10px] uppercase text-foreground/30 shrink-0">
          Hôm nay
        </span>
        <Separator className="flex-1 bg-border" />
      </div>

      {/* Messages */}
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          message={msg}
          isOwn={msg.ownerId === "me"}
        />
      ))}

      {/* Typing indicator */}
      {isTyping && <ChatTypingIndicator partner={partner} />}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
