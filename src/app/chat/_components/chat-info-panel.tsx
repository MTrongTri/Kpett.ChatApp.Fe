"use client";

import { cn } from "@/lib/utils";
import { Phone, Video, User, BellOff, Ban, Trash2 } from "lucide-react";
import ChatAvatar from "./chat-avatar";
import { MOCK_SHARED_MEDIA } from "../_data/chat-data";
import type { Conversation } from "@/types/chat";

interface ChatInfoPanelProps {
  conversation: Conversation;
  isOpen: boolean;
}

const QUICK_ACTIONS = [
  { icon: <Phone size={18} />, label: "Gọi" },
  { icon: <Video size={18} />, label: "Video" },
  { icon: <User size={18} />, label: "Trang" },
];

const DANGER_ACTIONS = [
  { icon: <BellOff size={14} />, label: "Tắt thông báo", danger: false },
  { icon: <Ban size={14} />, label: "Chặn người dùng", danger: true },
  { icon: <Trash2 size={14} />, label: "Xoá cuộc trò chuyện", danger: true },
];

export default function ChatInfoPanel({
  conversation,
  isOpen,
}: ChatInfoPanelProps) {
  const { partner } = conversation;

  return (
    <aside
      className={cn(
        "shrink-0 flex flex-col overflow-y-auto",
        "bg-card border-l border-border",
        "transition-all duration-250",
        isOpen ? "w-[272px]" : "w-0 overflow-hidden border-l-0",
      )}
    >
      <div className="min-w-[272px]">
        {/* ── Profile ── */}
        <div className="flex flex-col items-center px-5 py-6 border-b border-border text-center">
          <ChatAvatar
            initial={partner.avatarInitial}
            gradient={partner.avatarGradient}
            size={72}
            radius={9999}
            status={partner.status}
          />
          <h3 className="mt-3 text-[16px] font-bold text-foreground">
            {partner.displayName}
          </h3>
          <p className="text-[11px] text-foreground/35 mt-1">
            @{partner.username}
          </p>

          {/* Quick actions */}
          <div className="flex gap-3 mt-4">
            {QUICK_ACTIONS.map((action) => (
              <div
                key={action.label}
                className="flex flex-col items-center gap-1.5"
              >
                <button
                  className="
                    h-11 w-11 flex items-center justify-center rounded-xl
                    border border-border bg-foreground/4
                    text-foreground/55
                    hover:border-primary/50 hover:bg-primary/8 hover:text-primary
                    transition-all duration-150
                  "
                >
                  {action.icon}
                </button>
                <span className="text-[9px] text-foreground/30">
                  {action.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Info ── */}
        <div className="px-5 py-4 border-b border-border">
          <p className="text-[11px] font-semibold text-foreground/30 mb-3">
            Thông tin
          </p>
          <div className="space-y-2.5">
            {[
              partner.location && ["📍", partner.location],
              partner.joinedAt && ["📅", `Tham gia ${partner.joinedAt}`],
              partner.website && ["🔗", partner.website],
            ]
              .filter(Boolean)
              .map(([icon, text]) => (
                <div key={text as string} className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{icon}</span>
                  <span className="text-[12px] text-foreground/55">
                    {text as string}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* ── Shared media ── */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-foreground/30">
              Ảnh & Media
            </p>
            <button className="text-[10px] text-primary/70 hover:text-primary transition-colors">
              Xem tất cả
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MOCK_SHARED_MEDIA.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "aspect-square rounded-lg overflow-hidden",
                  "border border-border",
                  "flex items-center justify-center text-xl",
                  "bg-gradient-to-br",
                  "hover:scale-[1.04] hover:border-primary/50 transition-all duration-150",
                  item.bgGradient,
                )}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="px-5 py-4">
          {DANGER_ACTIONS.map((action) => (
            <button
              key={action.label}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl",
                "text-[12px] text-left",
                "border-none bg-transparent",
                "transition-colors duration-150",
                action.danger
                  ? "text-destructive hover:bg-destructive/8"
                  : "text-foreground/55 hover:bg-foreground/6 hover:text-foreground",
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
