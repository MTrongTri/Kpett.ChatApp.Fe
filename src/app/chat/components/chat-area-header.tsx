"use client";

import { cn } from "@/lib/utils";
import { Phone, Video, Search, Info } from "lucide-react";
import type { ChatUser } from "@/types/chat";
import ChatAvatar from "./chat-avatar";

interface ChatAreaHeaderProps {
  partner:       ChatUser;
  isTyping:      boolean;
  infoOpen:      boolean;
  onToggleInfo:  () => void;
}

const STATUS_LABEL: Record<string, string> = {
  online:  "Đang hoạt động",
  away:    "Vừa hoạt động",
  offline: "Offline",
};

const STATUS_COLOR: Record<string, string> = {
  online:  "text-emerald-500",
  away:    "text-amber-400",
  offline: "text-foreground/35",
};

const ACTIONS = [
  { icon: <Phone  size={16} />, label: "Gọi thoại"  },
  { icon: <Video  size={16} />, label: "Video call"  },
  { icon: <Search size={16} />, label: "Tìm kiếm"   },
];

export default function ChatAreaHeader({
  partner,
  isTyping,
  infoOpen,
  onToggleInfo,
}: ChatAreaHeaderProps) {
  return (
    <div
      className="
        shrink-0 h-[58px] px-5
        flex items-center justify-between
        bg-card border-b border-border
      "
    >
      {/* Left: avatar + name + status */}
      <div className="flex items-center gap-3">
        <ChatAvatar
          initial={partner.avatarInitial}
          gradient={partner.avatarGradient}
          size={38}
          radius={9999}
          status={partner.status}
        />
        <div>
          <p className="text-[14.5px] font-semibold text-foreground">
            {partner.displayName}
          </p>
          <p
            className={cn(
              "text-[11px] mt-0.5",
              isTyping ? "text-primary" : STATUS_COLOR[partner.status]
            )}
          >
            {isTyping ? "Đang nhập..." : STATUS_LABEL[partner.status]}
          </p>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-1.5">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            title={action.label}
            className="
              h-9 w-9 flex items-center justify-center rounded-lg
              border border-border bg-transparent
              text-foreground/45 hover:text-primary hover:border-primary/50 hover:bg-primary/8
              transition-all duration-150
            "
          >
            {action.icon}
          </button>
        ))}

        {/* Info toggle */}
        <button
          title="Thông tin"
          onClick={onToggleInfo}
          className={cn(
            "h-9 w-9 flex items-center justify-center rounded-lg",
            "border transition-all duration-150",
            infoOpen
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-transparent text-foreground/45 hover:text-primary hover:border-primary/50 hover:bg-primary/8"
          )}
        >
          <Info size={16} />
        </button>
      </div>
    </div>
  );
}
