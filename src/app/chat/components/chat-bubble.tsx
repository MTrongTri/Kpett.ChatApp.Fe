"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CornerUpLeft, MoreHorizontal, Smile } from "lucide-react";
import { REACT_EMOJIS } from "../_data/chat-data";
import type { ChatMessage } from "@/types/chat";

// ── READ RECEIPT ──────────────────────────────────────────────────────
function ReadReceipt({ status }: { status: ChatMessage["status"] }) {
  if (status === "read")
    return <span className="text-emerald-500 text-[10px]">✓✓</span>;
  if (status === "delivered")
    return <span className="text-foreground/30 text-[10px]">✓✓</span>;
  return <span className="text-foreground/30 text-[10px]">✓</span>;
}

// ── REACT PICKER ──────────────────────────────────────────────────────
function EmojiPicker({
  visible,
  align,
  onPick,
}: {
  visible: boolean;
  align: "left" | "right";
  onPick: (emoji: string) => void;
}) {
  if (!visible) return null;
  return (
    <div
      className={cn(
        "absolute bottom-[calc(100%+8px)] z-50",
        "flex gap-1 p-1.5",
        "bg-card border border-border rounded-xl",
        "shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
        align === "right" ? "right-0" : "left-0",
      )}
    >
      {REACT_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onPick(emoji)}
          className="
            h-8 w-8 flex items-center justify-center rounded-lg text-lg
            hover:scale-125 transition-transform duration-100
            hover:bg-foreground/8
          "
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ── HOVER ACTION BAR ──────────────────────────────────────────────────
function HoverActions({
  visible,
  ownMessage,
  onReact,
  showPicker,
  onTogglePicker,
}: {
  visible: boolean;
  ownMessage: boolean;
  onReact: (a: string) => void;
  showPicker: boolean;
  onTogglePicker: () => void;
}) {
  if (!visible) return null;
  return (
    <div
      className="
        flex items-center gap-1 px-1.5 py-1
        bg-card border border-border rounded-xl
        shadow-[0_4px_12px_rgba(0,0,0,0.25)]
      "
    >
      <div className="relative">
        <button
          onClick={onTogglePicker}
          className="
            h-7 w-7 flex items-center justify-center rounded-lg
            text-foreground/40 hover:text-foreground hover:bg-foreground/8
            transition-all duration-150
          "
        >
          <Smile size={14} />
        </button>
      </div>
      <button
        className="
          h-7 w-7 flex items-center justify-center rounded-lg
          text-foreground/40 hover:text-foreground hover:bg-foreground/8
          transition-all duration-150
        "
      >
        <CornerUpLeft size={14} />
      </button>
      <button
        className="
          h-7 w-7 flex items-center justify-center rounded-lg
          text-foreground/40 hover:text-foreground hover:bg-foreground/8
          transition-all duration-150
        "
      >
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────
interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export default function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const [hovered, setHovered] = useState(false);
  const [reaction, setReaction] = useState(message.reaction ?? null);
  const [showPicker, setShowPicker] = useState(false);

  const handleReact = (emoji: string) => {
    setReaction((prev) => (prev === emoji ? null : emoji));
    setShowPicker(false);
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 mb-1",
        isOwn ? "flex-row-reverse" : "flex-row",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowPicker(false);
      }}
    >
      {/* Bubble */}
      <div className="relative max-w-[72%]">
        <div
          className={cn(
            "px-3.5 py-2.5 text-[14px] leading-relaxed",
            isOwn
              ? "bg-primary text-primary-foreground rounded-[18px_18px_4px_18px] shadow-[0_2px_12px_rgba(245,158,11,0.2)]"
              : "bg-card text-card-foreground border border-border rounded-[18px_18px_18px_4px] shadow-sm",
          )}
        >
          {message.text}
        </div>

        {/* Reaction badge */}
        {reaction && (
          <button
            onClick={() => setReaction(null)}
            className={cn(
              "absolute -bottom-2.5 text-[13px]",
              "bg-card border border-border rounded-[10px] px-1.5 py-0 leading-6",
              "shadow-[0_2px_6px_rgba(0,0,0,0.2)]",
              isOwn ? "-left-2" : "-right-2",
            )}
          >
            {reaction}
          </button>
        )}

        {/* Emoji picker */}
        <EmojiPicker
          visible={showPicker}
          align={isOwn ? "right" : "left"}
          onPick={handleReact}
        />
      </div>

      {/* Hover action bar */}
      <HoverActions
        visible={hovered}
        ownMessage={isOwn}
        onReact={handleReact}
        showPicker={showPicker}
        onTogglePicker={() => setShowPicker((p) => !p)}
      />

      {/* Timestamp + receipt */}
      <div
        className={cn(
          "flex items-center gap-1 pb-0.5 shrink-0",
          "text-[10px] text-foreground/30",
          "transition-opacity duration-150",
          hovered ? "opacity-100" : "opacity-60",
        )}
      >
        {message.time}
        {isOwn && <ReadReceipt status={message.status} />}
      </div>
    </div>
  );
}
