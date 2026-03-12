"use client";

import { useState, useCallback, useEffect } from "react";
import ChatSidebar from "./chat-sidebar";
import ChatArea from "./chat-area";
import ChatInfoPanel from "./chat-info-panel";
import { MOCK_CONVERSATIONS, AUTO_REPLIES } from "../_data/chat-data";
import type { Conversation, ChatMessage } from "@/types/chat";

export default function ChatLayout() {
  const [conversations, setConversations] =
    useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>("c1");
  const [infoOpen, setInfoOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const activeConvo = conversations.find((c) => c.id === activeId) ?? null;

  // ── Select conversation ───────────────────────────────────────────
  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setInfoOpen(false);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  }, []);

  // ── Simulate typing when switching to c1 ─────────────────────────
  useEffect(() => {
    if (!activeId) return;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    if (activeId === "c1") {
      t1 = setTimeout(() => setIsTyping(true), 800);
      t2 = setTimeout(() => setIsTyping(false), 3500);
    } else {
      setIsTyping(false);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeId]);

  // ── Send message ──────────────────────────────────────────────────
  const handleSend = useCallback(
    (text: string) => {
      if (!activeId) return;

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        ownerId: "me",
        text,
        time: "Vừa xong",
        status: "sent",
      };

      // Optimistic update
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [...c.messages, newMsg],
                preview: text,
                time: "Vừa xong",
              }
            : c,
        ),
      );

      // Auto-reply simulation
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyText =
          AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        const reply: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          ownerId: activeId, // partner's id doesn't matter for isOwn check; ownerId !== "me"
          text: replyText,
          time: "Vừa xong",
          status: "read",
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  messages: [...c.messages, newMsg, reply],
                  preview: replyText,
                  time: "Vừa xong",
                }
              : c,
          ),
        );
      }, 1600);
    },
    [activeId],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Left sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
      />

      {/* Chat area */}
      <ChatArea
        conversation={activeConvo}
        isTyping={isTyping}
        infoOpen={infoOpen}
        onToggleInfo={() => setInfoOpen((p) => !p)}
        onSend={handleSend}
      />

      {/* Info panel */}
      {activeConvo && (
        <ChatInfoPanel conversation={activeConvo} isOpen={infoOpen} />
      )}
    </div>
  );
}
