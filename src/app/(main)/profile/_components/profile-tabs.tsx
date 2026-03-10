"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutGrid, Clapperboard, Bookmark, Tag } from "lucide-react";
import type { UserProfile, ProfileTab, GridPost } from "@/types/profile";
import { MOCK_COMMENTS, MOCK_GRID_POSTS } from "../_data/data";
import ProfileLightbox from "./profile-light-box";
import ProfileGrid from "./profile-grid";

// ── TAB CONFIG ────────────────────────────────────────────────────────
const TABS: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { key: "posts", label: "Bài viết", icon: <LayoutGrid size={13} /> },
  { key: "reels", label: "Reels", icon: <Clapperboard size={13} /> },
  { key: "saved", label: "Đã lưu", icon: <Bookmark size={13} /> },
];

// ── EMPTY STATE ───────────────────────────────────────────────────────
function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="py-20 flex flex-col items-center gap-4 text-foreground/30">
      <div
        className="h-16 w-16 rounded-2xl bg-foreground/5 border border-border
                      flex items-center justify-center"
      >
        {icon}
      </div>
      <p className="text-[11px] uppercase tracking-[0.12em]">{message}</p>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────
interface ProfileTabsProps {
  author: UserProfile;
  isOwner?: boolean;
}

export default function ProfileTabs({
  author,
  isOwner = false,
}: ProfileTabsProps) {
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Derive post sets per tab
  const tabData: Record<ProfileTab, GridPost[]> = {
    posts: MOCK_GRID_POSTS,
    reels: MOCK_GRID_POSTS.filter((p) => p.isVideo),
    saved: isOwner ? MOCK_GRID_POSTS.slice(1, 7) : [],
    tagged: MOCK_GRID_POSTS.filter((_, i) => i % 3 === 0),
  };

  const currentPosts = tabData[tab];

  return (
    <>
      {/* ── TAB BAR ── */}
      <div className="flex justify-center border-b border-border mx-5 md:mx-7 mt-4">
        {TABS.map((t) => {
          // Hide "saved" for non-owners
          if (t.key === "saved" && !isOwner) return null;

          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex items-center justify-center gap-2 px-4 md:px-5 py-3.5",
                "text-[11px] font-bold uppercase",
                "border-none bg-transparent cursor-pointer transition-colors duration-150",
                active
                  ? "text-primary"
                  : "text-foreground/40 hover:text-foreground/65",
              )}
            >
              {t.icon}
              {t.label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── GRID AREA ── */}
      <div className="px-5 md:px-7 pt-5 pb-10">
        {tab === "saved" && !isOwner ? (
          <EmptyState
            icon={<Bookmark size={28} />}
            message="Nội dung riêng tư"
          />
        ) : tab === "reels" && currentPosts.length === 0 ? (
          <EmptyState
            icon={<Clapperboard size={28} />}
            message="Chưa có Reels nào"
          />
        ) : (
          <ProfileGrid posts={currentPosts} onOpen={setLightbox} />
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      <ProfileLightbox
        posts={currentPosts}
        comments={MOCK_COMMENTS}
        author={author}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
      />
    </>
  );
}
