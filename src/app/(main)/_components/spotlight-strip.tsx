"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { SpotlightUser } from "@/types/post";

// ── MOCK DATA ────────────────────────────────────────────────────────
const SPOTLIGHT_USERS: SpotlightUser[] = [
  {
    id: "1",
    username: "minh.photo",
    avatarInitial: "M",
    avatarGradient: "from-pink-500 to-rose-500",
    bgEmoji: "🌆",
    bgGradient: "from-pink-900 via-rose-700 to-orange-600",
    seen: false,
  },
  {
    id: "2",
    username: "hung.travel",
    avatarInitial: "H",
    avatarGradient: "from-emerald-400 to-teal-400",
    bgEmoji: "🌿",
    bgGradient: "from-emerald-900 via-teal-700 to-cyan-600",
    seen: false,
  },
  {
    id: "3",
    username: "linh_art",
    avatarInitial: "L",
    avatarGradient: "from-sky-400 to-cyan-400",
    bgEmoji: "🎨",
    bgGradient: "from-sky-900 via-blue-700 to-indigo-600",
    seen: true,
  },
  {
    id: "4",
    username: "anh_thu99",
    avatarInitial: "A",
    avatarGradient: "from-rose-400 to-pink-400",
    bgEmoji: "☀️",
    bgGradient: "from-amber-800 via-orange-600 to-yellow-500",
    seen: true,
  },
  {
    id: "5",
    username: "nam.design",
    avatarInitial: "N",
    avatarGradient: "from-violet-500 to-purple-500",
    bgEmoji: "🖥️",
    bgGradient: "from-violet-900 via-purple-700 to-fuchsia-600",
    seen: true,
  },
  {
    id: "6",
    username: "khanh.moto",
    avatarInitial: "K",
    avatarGradient: "from-orange-400 to-yellow-400",
    bgEmoji: "🏍️",
    bgGradient: "from-orange-900 via-amber-700 to-yellow-500",
    seen: false,
  },
  {
    id: "7",
    username: "van.foodie",
    avatarInitial: "V",
    avatarGradient: "from-lime-400 to-green-500",
    bgEmoji: "🍜",
    bgGradient: "from-lime-900 via-green-700 to-teal-600",
    seen: true,
  },
];

// ── SUB-COMPONENTS ───────────────────────────────────────────────────

/** The "Add Story" button */
function AddStoryItem() {
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
      <div
        className="
          h-[110px] w-[80px] rounded-xl
          border-2 border-dashed border-border
          flex flex-col items-center justify-center gap-2
          transition-colors duration-150
          group-hover:border-primary/60
        "
      >
        <div className="
          h-8 w-8 rounded-full bg-primary/15 border border-primary/30
          flex items-center justify-center
          group-hover:bg-primary/25 transition-colors
        ">
          <Plus size={16} className="text-primary" />
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-foreground/40 max-w-[80px] text-center leading-tight">
        Thêm Story
      </span>
    </div>
  );
}

/** Individual spotlight/story card */
function SpotlightItem({ user }: { user: SpotlightUser }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
      <div
        className={cn(
          "relative h-[110px] w-[80px] rounded-xl overflow-hidden",
          "border transition-all duration-200",
          "group-hover:shadow-lg group-hover:shadow-black/20",
          user.seen
            ? "border-border group-hover:border-foreground/30"
            : "border-primary/60 shadow-[0_0_0_1px] shadow-primary/20 group-hover:border-primary"
        )}
      >
        {/* Background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b flex items-center justify-center text-4xl",
            user.bgGradient
          )}
        >
          {user.bgEmoji}
        </div>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Avatar badge */}
        <div
          className={cn(
            "absolute bottom-2 left-1/2 -translate-x-1/2",
            "h-7 w-7 rounded-full border-2 flex items-center justify-center",
            "bg-gradient-to-br font-bold text-[11px] text-white",
            user.avatarGradient,
            user.seen ? "border-foreground/40" : "border-primary"
          )}
        >
          {user.avatarInitial}
        </div>

        {/* Unseen indicator */}
        {!user.seen && (
          <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        )}
      </div>

      <span className="text-[10px] uppercase tracking-wider text-foreground/50 max-w-[80px] text-center truncate leading-tight">
        {user.username}
      </span>
    </div>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function SpotlightStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 mb-4">
      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1"
        style={{ scrollbarWidth: "none" }}
      >
        <AddStoryItem />
        {SPOTLIGHT_USERS.map((user) => (
          <SpotlightItem key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}