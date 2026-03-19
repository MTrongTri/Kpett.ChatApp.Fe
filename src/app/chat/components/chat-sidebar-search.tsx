"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface ChatSidebarSearchProps {
  value:    string;
  onChange: (v: string) => void;
}

export default function ChatSidebarSearch({ value, onChange }: ChatSidebarSearchProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        "bg-foreground/5 border rounded-xl px-3 py-2",
        "transition-all duration-150",
        focused
          ? "border-primary/50 shadow-[0_0_0_3px_rgba(245,158,11,0.08)]"
          : "border-border"
      )}
    >
      <Search size={14} className="text-foreground/30 shrink-0" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Tìm kiếm tin nhắn..."
        className="
          flex-1 bg-transparent border-none outline-none
          text-[12px] text-foreground
          placeholder:text-foreground/30
        "
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="text-foreground/30 hover:text-foreground transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
