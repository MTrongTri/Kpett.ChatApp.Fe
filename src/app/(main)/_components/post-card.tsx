"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  MoreHorizontal,
  BadgeCheck,
  Link2,
  Flag,
  UserMinus,
  EyeOff,
} from "lucide-react";
import type { Post, Poll, PostCategory } from "@/types/post";

// ── CATEGORY CONFIG ──────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<
  PostCategory,
  { label: string; className: string }
> = {
  city:    { label: "City",    className: "border-sky-400/60   text-sky-400   bg-sky-400/8"    },
  nature:  { label: "Nature",  className: "border-emerald-400/60 text-emerald-400 bg-emerald-400/8" },
  food:    { label: "Food",    className: "border-orange-400/60 text-orange-400 bg-orange-400/8" },
  art:     { label: "Art",     className: "border-violet-400/60 text-violet-400 bg-violet-400/8" },
  design:  { label: "Design",  className: "border-purple-400/60 text-purple-400 bg-purple-400/8" },
  tech:    { label: "Tech",    className: "border-cyan-400/60  text-cyan-400  bg-cyan-400/8"   },
  travel:  { label: "Travel",  className: "border-rose-400/60  text-rose-400  bg-rose-400/8"   },
};

// ── POLL BLOCK (used only in PostCard → same file) ───────────────────
interface PollBlockProps {
  poll: Poll;
}

function PollBlock({ poll }: PollBlockProps) {
  const [voted, setVoted] = useState<string | null>(null);

  return (
    <div className="px-4 pb-3">
      <div className="space-y-2.5">
        {poll.options.map((opt) => {
          const isWinner =
            voted !== null &&
            opt.percentage ===
              Math.max(...poll.options.map((o) => o.percentage));

          return (
            <button
              key={opt.id}
              onClick={() => !voted && setVoted(opt.id)}
              className={cn(
                "w-full text-left group",
                voted ? "cursor-default" : "cursor-pointer"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-card-foreground">
                  {opt.emoji && <span className="mr-1.5">{opt.emoji}</span>}
                  {opt.label}
                </span>
                {voted && (
                  <span
                    className={cn(
                      "font-roboto text-[11px] font-semibold",
                      isWinner ? "text-primary" : "text-foreground/40"
                    )}
                  >
                    {opt.percentage}%
                  </span>
                )}
              </div>
              <div className="h-2 rounded-full bg-foreground/8 border border-border overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    opt.barColor ?? "bg-primary",
                    isWinner && "shadow-[0_0_8px] shadow-primary/40"
                  )}
                  style={{
                    width: voted ? `${opt.percentage}%` : "0%",
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <p className="font-roboto text-[10px] text-foreground/30 mt-3">
        {poll.totalVotes.toLocaleString("vi-VN")} lượt bình chọn ·{" "}
        {poll.daysLeft > 0 ? `Còn ${poll.daysLeft} ngày` : "Đã kết thúc"}
      </p>
    </div>
  );
}

// ── POST CARD ────────────────────────────────────────────────────────
interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [saved, setSaved] = useState(post.isSaved ?? false);

  const catConfig = CATEGORY_CONFIG[post.category];

  const handleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => c + (prev ? -1 : 1));
      return !prev;
    });
  };

  return (
    <article
      className="rounded-xl border border-border bg-card transition-all duration-200"
    >
      {/* ── HEADER ── */}
      <div className="flex items-start gap-3 p-4 pb-0">
        {/* Avatar */}
        <div
          className={cn(
            "h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center",
            "bg-gradient-to-br font-bold text-[15px] text-white cursor-pointer",
            "transition-opacity hover:opacity-80",
            post.author.avatarGradient
          )}
        >
          {post.author.avatarInitial}
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13.5px] font-semibold text-card-foreground cursor-pointer hover:underline decoration-primary">
              {post.author.username}
            </span>
            {post.author.isVerified && (
              <BadgeCheck size={14} className="text-primary flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="font-roboto text-[11px] text-foreground/40">
              {post.createdAt}
            </span>
            {/* Category badge */}
            <span
              className={cn(
                "font-roboto text-[9px] font-semibold uppercase tracking-wider",
                "px-1.5 py-0.5 rounded border",
                catConfig.className
              )}
            >
              {catConfig.label}
            </span>
          </div>
        </div>

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/8 flex-shrink-0"
            >
              <MoreHorizontal size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card border-border text-card-foreground text-sm rounded-lg w-44"
          >
            <DropdownMenuItem className="gap-2 cursor-pointer hover:text-primary focus:text-primary">
              <Link2 size={13} /> Sao chép liên kết
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <EyeOff size={13} /> Ẩn bài viết này
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <UserMinus size={13} /> Bỏ theo dõi
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <Flag size={13} /> Báo cáo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── TITLE & BODY ── */}
      <div className="px-4 pt-3 pb-3">
        <h2
          className="
            text-[18px] font-bold leading-snug tracking-tight
            text-card-foreground cursor-pointer mb-1.5
            decoration-primary decoration-2 underline-offset-2
          "        >
          {post.title}
        </h2>
        <p className="text-[13.5px] leading-relaxed text-foreground/65">
          {post.body}{" "}
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-primary/80 hover:text-primary cursor-pointer font-medium"
            >
              #{tag}{" "}
            </span>
          ))}
        </p>
      </div>

      {/* ── IMAGE (if present) ── */}
      {post.imageEmoji && (
        <div className="mx-4 mb-3">
          <div
            className={cn(
              "rounded-xl overflow-hidden border border-border",
              "flex items-center justify-center",
              post.imageAspect === "square" ? "aspect-square" : "aspect-video",
              "bg-gradient-to-br cursor-pointer",
              "group relative"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-90",
                post.imageBg ?? "from-zinc-800 to-zinc-900"
              )}
            />
            <span className="relative z-10 text-6xl select-none">{post.imageEmoji}</span>
            
          </div>
        </div>
      )}

      {/* ── POLL (if present) ── */}
      {post.poll && <PollBlock poll={post.poll} />}

      {/* ── ACTIONS ── */}
      <div className="flex items-center gap-1 px-3 py-2.5">

        {/* Like */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn(
            "gap-1.5 h-8 px-2.5 rounded-lg font-roboto text-[11px] font-semibold",
            "transition-all duration-150",
            liked
              ? "text-rose-500 bg-rose-500/10 hover:bg-rose-500/15 hover:text-rose-400"
              : "text-foreground/50 hover:text-foreground hover:bg-foreground/8"
          )}
        >
          <Heart
            size={14}
            className={cn("transition-transform", liked && "scale-110")}
            fill={liked ? "currentColor" : "none"}
          />
          <span>{likeCount.toLocaleString("vi-VN")}</span>
        </Button>

        {/* Comment */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-8 px-2.5 rounded-lg font-roboto text-[11px] font-semibold
                     text-foreground/50 hover:text-foreground hover:bg-foreground/8"
        >
          <MessageCircle size={14} />
          <span>{post.commentCount}</span>
        </Button>

        {/* Repost */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-8 px-2.5 rounded-lg font-roboto text-[11px] font-semibold
                     text-foreground/50 hover:text-emerald-500 hover:bg-emerald-500/8"
        >
          <Repeat2 size={14} />
          <span>{post.repostCount}</span>
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bookmark */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSaved((p) => !p)}
          className={cn(
            "h-8 w-8 rounded-lg",
            saved
              ? "text-primary bg-primary/10 hover:bg-primary/15"
              : "text-foreground/40 hover:text-foreground hover:bg-foreground/8"
          )}
        >
          <Bookmark
            size={14}
            fill={saved ? "currentColor" : "none"}
          />
        </Button>

        {/* Share */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-foreground/40
                     hover:text-primary hover:bg-primary/10"
        >
          <Share2 size={14} />
        </Button>
      </div>
    </article>
  );
}