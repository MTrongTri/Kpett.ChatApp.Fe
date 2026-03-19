"use client";

import { MOCK_POSTS } from "@/data/post";
import { cn } from "@/lib/utils";
import { useState } from "react";
import PostCard from "./post-card";

type SortOption = "for-you" | "latest" | "popular";

// ── FEED HEADER (home-only → same file) ─────────────────────────────
interface FeedHeaderProps {
  postCount: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

function FeedHeader({ postCount, sort, onSortChange }: FeedHeaderProps) {
  const sorts: { key: SortOption; label: string }[] = [
    { key: "for-you", label: "For You" },
    { key: "latest", label: "Mới nhất" },
    { key: "popular", label: "Phổ biến" },
  ];

  return (
    <div className="mb-4 flex items-center justify-end">
      <div className="flex gap-2">
        {sorts.map((s) => (
          <button
            key={s.key}
            onClick={() => onSortChange(s.key)}
            className={cn(
              "text-[10px] font-semibold tracking-[0.08em] uppercase",
              "rounded-md border px-2.5 py-1.5 transition-all duration-150",
              sort === s.key
                ? "text-primary border-primary/50 bg-primary/8"
                : "text-foreground/40 border-border hover:text-foreground/70 hover:border-foreground/30",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function Feed() {
  const [sort, setSort] = useState<SortOption>("for-you");

  const sorted = [...MOCK_POSTS].sort((a, b) => {
    if (sort === "latest") return 0;
    if (sort === "popular") return b.metrics.likeCount - a.metrics.likeCount;
    return 0;
  });

  return (
    <section className="">
      <FeedHeader postCount={248} sort={sort} onSortChange={setSort} />

      <div className="space-y-4">
        {sorted.map((post, i) => (
          <div
            key={post.id}
            className="animate-in fade-in slide-in-from-bottom-3 duration-300"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
          >
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* Load more */}
      <div className="mt-6 flex justify-center">
        <button className="text-foreground/30 hover:text-primary border-border hover:border-primary/50 rounded-lg border px-5 py-2.5 text-[11px] tracking-widest uppercase transition-all duration-150">
          Tải thêm bài viết
        </button>
      </div>
    </section>
  );
}
