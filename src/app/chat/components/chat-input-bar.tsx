"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import {
  Paperclip,
  Smile,
  ArrowUp,
  Image,
  Mic,
  MapPin,
  Gamepad2,
} from "lucide-react";

interface ChatInputBarProps {
  partnerName: string;
  onSend: (text: string) => void;
}

const TOOLBAR_ACTIONS = [
  { icon: <Image size={16} />, label: "Ảnh / Video" },
  { icon: <Mic size={16} />, label: "Ghi âm" },
];

export default function ChatInputBar({
  partnerName,
  onSend,
}: ChatInputBarProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    textareaRef.current?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 px-5 py-3 border-t border-border bg-card">
      {/* Input wrapper */}
      <div
        className={cn(
          "flex items-center gap-2.5",
          "bg-background border rounded-2xl px-3.5 py-2.5",
          "transition-all duration-150",
          focused
            ? "border-primary/50 shadow-[0_0_0_3px_rgba(245,158,11,0.08)]"
            : "border-border",
        )}
      >
        {/* Attach */}
        <button
          className="
            h-8 w-8 shrink-0 flex items-center justify-center rounded-lg
            text-foreground/35 hover:text-primary hover:bg-primary/8
            transition-all duration-150
          "
          title="Đính kèm"
        >
          <Paperclip size={16} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`Nhắn tin ${partnerName}...`}
          rows={1}
          className="
            flex-1 bg-transparent border-none outline-none resize-none
            text-[14px] leading-relaxed text-foreground
            placeholder:text-foreground/30 font-[inherit]
            max-h-[100px] overflow-y-auto
          "
        />

        {/* Emoji */}
        <button
          className="
            h-8 w-8 shrink-0 flex items-center justify-center rounded-lg
            text-foreground/35 hover:text-primary hover:bg-primary/8
            transition-all duration-150
          "
          title="Emoji"
        >
          <Smile size={16} />
        </button>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "h-9 w-9 shrink-0 flex items-center justify-center rounded-xl",
            "transition-all duration-200",
            canSend
              ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(245,158,11,0.35)] hover:bg-primary/90"
              : "bg-foreground/8 text-foreground/25 cursor-not-allowed",
          )}
        >
          <ArrowUp size={16} />
        </button>
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex gap-1">
          {TOOLBAR_ACTIONS.map((action) => (
            <button
              key={action.label}
              title={action.label}
              className="
                h-8 w-8 flex items-center justify-center rounded-lg
                text-foreground/30 hover:text-primary hover:bg-primary/8
                transition-all duration-150
              "
            >
              {action.icon}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-foreground/25 hidden sm:block">
          Enter để gửi · Shift+Enter xuống dòng
        </p>
      </div>
    </div>
  );
}
