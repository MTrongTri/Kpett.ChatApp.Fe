"use client";

import { cn } from "@/lib/utils";
import { SIDEBAR_FILTERS } from "../_data/chat-data";
import type { FilterType } from "@/types/chat";

interface ChatSidebarFilterProps {
  active:         FilterType;
  onSelect:       (filter: FilterType) => void;
  totalUnread:    number;
  totalPinned:    number;
}

export default function ChatSidebarFilter({
  active,
  onSelect,
  totalUnread,
  totalPinned,
}: ChatSidebarFilterProps) {
  const badges: Record<FilterType, number> = {
    all:    0,
    unread: totalUnread,
    pinned: totalPinned,
  };

  return (
    <div className="flex gap-1.5">
      {SIDEBAR_FILTERS.map((filter) => {
        const isActive = active === filter.key;
        const badge    = badges[filter.key];

        return (
          <button
            key={filter.key}
            onClick={() => onSelect(filter.key)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
              "text-[11px] font-semibold",
              "border transition-all duration-150",
              isActive
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border bg-transparent text-foreground/35 hover:text-foreground/60 hover:border-border"
            )}
          >
            {filter.label}
            {badge > 0 && (
              <span
                className="
                  min-w-[16px] h-4 rounded-full px-1
                  bg-primary text-primary-foreground
                  font-mono text-[9px] font-bold
                  flex items-center justify-center
                "
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
