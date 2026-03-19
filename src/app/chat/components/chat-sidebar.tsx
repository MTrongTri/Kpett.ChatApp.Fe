"use client";

import { useState, useMemo } from "react";
import { Settings, Plus } from "lucide-react";
import ChatAvatar from "./chat-avatar";
import ChatSidebarSearch from "./chat-sidebar-search";
import ChatSidebarFilter from "./chat-sidebar-filter";
import ChatSidebarItem from "./chat-sidebar-item";
import { ME } from "../_data/chat-data";
import type { Conversation, FilterType } from "@/types/chat";
import Link from "next/link";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export default function ChatSidebar({
  conversations,
  activeId,
  onSelect,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  // Filtered list
  const visible = useMemo(() => {
    let list = conversations;
    if (search.trim())
      list = list.filter((c) =>
        c.partner.displayName.toLowerCase().includes(search.toLowerCase()),
      );
    if (filter === "unread") list = list.filter((c) => c.unread > 0);
    if (filter === "pinned") list = list.filter((c) => c.pinned);
    return list;
  }, [conversations, search, filter]);

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);
  const totalPinned = conversations.filter((c) => c.pinned).length;

  return (
    <aside className="w-[300px] shrink-0 flex flex-col bg-card border-r border-border">
      {/* ── Header ── */}
      <div className="shrink-0 h-[58px] px-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Link
            href={"/"}
            className="font-serif font-black italic text-[20px] text-primary"
          >
            K<span className="not-italic font-light text-foreground">PET</span>
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/40 border border-border rounded-md px-1.5 py-0.5">
            Messages
          </span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="shrink-0 px-4 py-3 border-b border-border">
        <ChatSidebarSearch value={search} onChange={setSearch} />
      </div>

      {/* ── Filter tabs ── */}
      <div className="shrink-0 px-4 pb-2 pt-2">
        <ChatSidebarFilter
          active={filter}
          onSelect={setFilter}
          totalUnread={totalUnread}
          totalPinned={totalPinned}
        />
      </div>

      {/* ── Conversation list ── */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="py-10 text-center text-[11px] text-foreground/25">
            Không tìm thấy cuộc trò chuyện
          </div>
        ) : (
          visible.map((c) => (
            <ChatSidebarItem
              key={c.id}
              conversation={c}
              isActive={c.id === activeId}
              onClick={() => onSelect(c.id)}
            />
          ))
        )}
      </div>

      {/* ── Me footer ── */}
      <div className="shrink-0 px-4 py-3 border-t border-border flex items-center gap-2.5">
        <div className="relative">
          <ChatAvatar
            initial={ME.avatarInitial}
            gradient={ME.avatarGradient}
            size={36}
            radius={99999}
            status={ME.status}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">
            {ME.displayName}
          </p>
          <p className="text-[10px] text-emerald-500 mt-0.5">
            Đang hoạt động
          </p>
        </div>
        <button
          className="
            h-8 w-8 flex items-center justify-center rounded-lg
            border border-border bg-transparent
            text-foreground/35 hover:text-primary hover:border-primary/50 hover:bg-primary/8
            transition-all duration-150
          "
          title="Cài đặt"
        >
          <Settings size={14} />
        </button>
      </div>
    </aside>
  );
}
