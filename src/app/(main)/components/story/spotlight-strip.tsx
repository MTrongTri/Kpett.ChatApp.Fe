"use client";

import { Plus } from "lucide-react";
import { useRef } from "react";
import SpotlightItem from "./spotlight-item";

export interface SpotlightUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  seen?: boolean;
}

// ── MOCK DATA ────────────────────────────────────────────────────────
const SPOTLIGHT_USERS: SpotlightUser[] = [
  {
    id: "1",
    displayName: "Minh",
    avatarUrl: null,
    username: "minh.photo",
    seen: false,
  },
  {
    id: "2",
    username: "hung.travel",
    displayName: "Hung",
    avatarUrl: null,
    seen: false,
  },
  {
    id: "3",
    username: "linh_art",
    displayName: "Linh",
    avatarUrl: null,
    seen: true,
  },
  {
    id: "4",
    username: "anh_thu99",
    displayName: "Thu",
    avatarUrl: null,
    seen: true,
  },
  {
    id: "5",
    username: "nam.design",
    displayName: "Nam",
    avatarUrl: null,
    seen: true,
  },
  {
    id: "6",
    username: "khanh.moto",
    displayName: "Khanh",
    avatarUrl: null,
    seen: false,
  },
  {
    id: "7",
    username: "van.foodie",
    displayName: "Van",
    avatarUrl: null,
    seen: true,
  },
];

// ── SUB-COMPONENTS ───────────────────────────────────────────────────

/** The "Add Story" button */
function AddStoryItem() {
  return (
    <div className="group flex shrink-0 cursor-pointer flex-col items-center gap-2">
      <div className="border-border group-hover:border-primary/60 flex h-27.5 w-20 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors duration-150">
        <div className="bg-primary/15 border-primary/30 group-hover:bg-primary/25 flex h-8 w-8 items-center justify-center rounded-full border transition-colors">
          <Plus size={16} className="text-primary" />
        </div>
      </div>
      <span className="text-foreground/40 max-w-20 text-center text-[10px] leading-tight tracking-wider">
        Thêm Story
      </span>
    </div>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function SpotlightStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-border bg-card mb-4 hidden rounded-xl border px-4 py-4">
      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1"
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
