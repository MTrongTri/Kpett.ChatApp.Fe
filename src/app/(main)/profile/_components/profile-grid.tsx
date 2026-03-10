"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Pin, Clapperboard } from "lucide-react";
import type { GridPost } from "@/types/profile";

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);
}

interface ProfileGridProps {
  posts:  GridPost[];
  onOpen: (index: number) => void;
}

function GridItem({
  post,
  index,
  onOpen,
}: {
  post:   GridPost;
  index:  number;
  onOpen: (i: number) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onOpen(index)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative aspect-square rounded-xl overflow-hidden cursor-pointer w-full",
        "border transition-all duration-200",
        hovered
          ? "border-primary/50 -translate-y-0.5 shadow-lg shadow-black/20 dark:shadow-black/50"
          : "border-border"
      )}
    >
      {/* Background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", post.bgGradient)} />

      {/* Emoji */}
      <div className="absolute inset-0 flex items-center justify-center text-[42px] select-none">
        {post.emoji}
      </div>

      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-1 z-10">
        {post.isPinned && (
          <span className="h-6 w-6 rounded-md bg-black/55 backdrop-blur-sm
                           flex items-center justify-center text-primary">
            <Pin size={11} />
          </span>
        )}
        {post.isVideo && (
          <span className="h-6 w-6 rounded-md bg-black/55 backdrop-blur-sm
                           flex items-center justify-center text-white/80">
            <Clapperboard size={11} />
          </span>
        )}
      </div>

      {/* Hover overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/55 backdrop-blur-[1px] z-10",
          "flex items-center justify-center gap-5",
          "transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0"
        )}
      >
        {[["♥", fmt(post.likeCount)], ["💬", String(post.commentCount)]].map(
          ([icon, val]) => (
            <div
              key={icon}
              className="flex items-center gap-1.5 text-white text-sm font-bold"
            >
              <span>{icon}</span>
              <span>{val}</span>
            </div>
          )
        )}
      </div>
    </button>
  );
}

export default function ProfileGrid({ posts, onOpen }: ProfileGridProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-foreground/30">
        <span className="text-5xl">📷</span>
        <p className="text-[11px] uppercase tracking-[0.12em]">
          Chưa có bài viết nào
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.map((post, i) => (
        <GridItem key={post.id} post={post} index={i} onOpen={onOpen} />
      ))}
    </div>
  );
}