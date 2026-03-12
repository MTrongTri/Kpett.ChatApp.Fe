"use client";

import { cn } from "@/lib/utils";
import ChatAvatar from "./chat-avatar";
import { Pin } from "lucide-react";
import type { Conversation } from "@/types/chat";

interface ChatSidebarItemProps {
  conversation: Conversation;
  isActive:     boolean;
  onClick:      () => void;
}

export default function ChatSidebarItem({
  conversation: c,
  isActive,
  onClick,
}: ChatSidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left",
        "border-l-[3px] border-b border-b-border",
        "transition-all duration-150",
        isActive
          ? "border-l-primary bg-primary/8"
          : "border-l-transparent hover:bg-foreground/4"
      )}
    >
      <ChatAvatar
        initial={c.partner.avatarInitial}
        gradient={c.partner.avatarGradient}
        size={42}
        radius={999999}
        status={c.partner.status}
      />

      <div className="flex-1 min-w-0">
        {/* Name + time */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {c.pinned && (
              <Pin size={12} className="text-primary shrink-0" />
            )}
            <span
              className={cn(
                "text-[13.5px] truncate",
                c.unread > 0
                  ? "font-bold text-foreground"
                  : "font-medium text-foreground"
              )}
            >
              {c.partner.displayName}
            </span>
          </div>
          <span
            className={cn(
              "text-[10px] shrink-0",
              c.unread > 0 ? "text-primary" : "text-foreground/30"
            )}
          >
            {c.time}
          </span>
        </div>

        {/* Preview + unread badge */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-[11.5px] truncate",
              c.unread > 0 ? "text-foreground/70" : "text-foreground/35"
            )}
          >
            {c.preview}
          </span>
          {c.unread > 0 && (
            <span
              className="
                min-w-[18px] h-[18px] rounded-full px-1 shrink-0
                bg-primary text-primary-foreground
                text-[9px] font-bold
                flex items-center justify-center
              "
            >
              {c.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
