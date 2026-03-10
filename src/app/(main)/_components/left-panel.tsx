"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { TrendingTag, OnlineFriend } from "@/types/post";

// ── MOCK DATA ────────────────────────────────────────────────────────
const CURRENT_USER = {
  username: "tuan.dev",
  displayName: "Tuấn Nguyễn",
  role: "Backend Dev",
  avatarGradient: "from-indigo-500 to-purple-600",
  initial: "T",
  posts: 248,
  followers: "4.2k",
  following: 891,
};

const TRENDING_TAGS: TrendingTag[] = [
  { rank: 1, name: "#dalat",       count: "12,840 bài viết", percentage: 92 },
  { rank: 2, name: "#streetlife",  count: "9,312 bài viết",  percentage: 74 },
  { rank: 3, name: "#foodvn",      count: "7,610 bài viết",  percentage: 61 },
  { rank: 4, name: "#devlife",     count: "5,204 bài viết",  percentage: 42 },
  { rank: 5, name: "#hanoi",       count: "4,080 bài viết",  percentage: 33 },
];

const ONLINE_FRIENDS: OnlineFriend[] = [
  { id: "1", username: "minh.photo",   status: "Đang hoạt động", isOnline: true,  avatarInitial: "M", avatarGradient: "from-pink-500 to-rose-500"    },
  { id: "2", username: "hung.travel",  status: "Đang hoạt động", isOnline: true,  avatarInitial: "H", avatarGradient: "from-emerald-400 to-teal-400"  },
  { id: "3", username: "linh_art",     status: "3 giờ trước",    isOnline: false, avatarInitial: "L", avatarGradient: "from-sky-400 to-cyan-400"      },
  { id: "4", username: "khanh.moto",   status: "1 ngày trước",   isOnline: false, avatarInitial: "K", avatarGradient: "from-orange-400 to-yellow-400" },
];

// ── SUB-COMPONENTS ───────────────────────────────────────────────────

function ProfileCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-1">
      {/* Top row */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "relative h-12 w-12 rounded-full flex-shrink-0",
            "bg-gradient-to-br flex items-center justify-center",
            "font-bold text-lg text-white",
            CURRENT_USER.avatarGradient
          )}
        >
          {CURRENT_USER.initial}
          {/* Online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground leading-tight">
            {CURRENT_USER.username}
          </p>
          <p className="text-[11px] text-foreground/40 mt-0.5">
            @{CURRENT_USER.displayName.toLowerCase().replace(" ", "")} · {CURRENT_USER.role}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1 pt-3 border-t border-border">
        {[
          { n: CURRENT_USER.posts,      l: "Bài viết" },
          { n: CURRENT_USER.followers,  l: "Theo dõi" },
          { n: CURRENT_USER.following,  l: "Đang theo" },
        ].map((s) => (
          <div key={s.l} className="text-center">
            <p className="text-[18px] font-bold leading-tight text-card-foreground">
              {s.n}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 mt-0.5">
              {s.l}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold text-foreground px-2.5 mt-5 mb-2.5 first:mt-0">
      {children}
    </p>
  );
}

function TrendingTags() {
  return (
    <div className="space-y-0.5">
      {TRENDING_TAGS.map((tag) => (
        <button
          key={tag.name}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left
                     hover:bg-foreground/5 transition-colors duration-150 group"
        >
          <span className="text-[11px] text-foreground/30 w-5 text-right flex-shrink-0">
            {String(tag.rank).padStart(2, "0")}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-primary group-hover:underline truncate">
              {tag.name}
            </p>
            <p className="text-[10px] text-foreground/40 mt-0.5">
              {tag.count}
            </p>
          </div>
          {/* Mini bar */}
          <div className="w-8 h-1 bg-border rounded-full overflow-hidden flex-shrink-0">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${tag.percentage}%` }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}

function OnlineFriends() {
  return (
    <div className="space-y-0.5">
      {ONLINE_FRIENDS.map((friend) => (
        <button
          key={friend.id}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg
                     hover:bg-foreground/5 transition-colors duration-150 text-left"
        >
          {/* Avatar with status dot */}
          <div
            className={cn(
              "relative h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center",
              "bg-gradient-to-br font-bold text-xs text-white",
              friend.avatarGradient
            )}
          >
            {friend.avatarInitial}
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card",
                friend.isOnline ? "bg-emerald-500" : "bg-foreground/25"
              )}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-card-foreground truncate leading-tight">
              {friend.username}
            </p>
            <p className={cn(
              "text-[10px] mt-0.5",
              friend.isOnline ? "text-emerald-500" : "text-foreground/40"
            )}>
              {friend.status}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function LeftPanel() {
  return (
    <aside className="sticky top-[58px] h-[calc(100vh-58px)]">
      <ScrollArea className="h-full">
        <div className="px-3 py-5">
          <ProfileCard />

          <PanelLabel>Trending #Tags</PanelLabel>
          <TrendingTags />

          <Separator className="my-4 bg-border" />

          <PanelLabel>Bạn bè Online</PanelLabel>
          <OnlineFriends />
        </div>
      </ScrollArea>
    </aside>
  );
}