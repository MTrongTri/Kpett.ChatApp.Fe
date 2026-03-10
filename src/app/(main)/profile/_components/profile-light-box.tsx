"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  BadgeCheck,
} from "lucide-react";
import type { GridPost, GridComment, UserProfile } from "@/types/profile";
import { Textarea } from "@/components/ui/textarea";

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);
}

interface ProfileLightboxProps {
  posts: GridPost[];
  comments: GridComment[];
  author: UserProfile;
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ProfileLightbox({
  posts,
  comments,
  author,
  index,
  onClose,
  onNavigate,
}: ProfileLightboxProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState("");

  const post = index !== null ? posts[index] : null;
  const canPrev = index !== null && index > 0;
  const canNext = index !== null && index < posts.length - 1;

  // Reset state when post changes
  useEffect(() => {
    setLiked(false);
    setSaved(false);
    setComment("");
  }, [index]);

  // Keyboard navigation
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!post) return;
      if (e.key === "ArrowLeft" && canPrev) onNavigate(index! - 1);
      if (e.key === "ArrowRight" && canNext) onNavigate(index! + 1);
      if (e.key === "Escape") onClose();
    },
    [post, canPrev, canNext, index, onNavigate, onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (index === null || !post) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="md:max-w-[940px] w-[95vw] py-9 gap-0 bg-card border-border rounded-2xl overflow-hidden"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          Bài viết của {author.username}
        </DialogTitle>

        <div className="">
          {/* ── INFO PANEL ── */}
          <div className="flex flex-col w-full">
            <div className="overflow-y-auto max-h-[92vh] md:max-h-[430px]">
              {/* Author row */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border flex-shrink-0">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex-shrink-0",
                    "bg-gradient-to-br flex items-center justify-center",
                    "font-bold text-sm text-white",
                    author.avatarGradient,
                  )}
                >
                  {author.avatarInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-card-foreground truncate">
                      {author.username}
                    </span>
                    {author.isVerified && (
                      <BadgeCheck
                        size={13}
                        className="text-primary flex-shrink-0"
                      />
                    )}
                  </div>
                  <p className="text-[10px] text-foreground/40 truncate">
                    {author.role.split("·")[0].trim()}
                  </p>
                </div>
                <button
                  className="text-[10px] font-semibold cursor-pointer uppercase text-primary hover:text-primary/75 transition-colors flex-shrink-0"
                >
                  Follow
                </button>
              </div>

              {/* Caption + Comments */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {/* Caption */}
                <p className="text-[13.5px] leading-relaxed text-foreground/65">
                  Khoảnh khắc <span className="text-xl">{post.emoji}</span>{" "}
                  không thể nào quên. Mỗi bức ảnh là một câu chuyện, một cảm xúc
                  của hành trình.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["travel", "vietnam", "photography", "nature"].map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] text-primary/75 hover:text-primary cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* ── IMAGE POST ── */}
                <div className="relative flex-1 md:flex-[1.2] overflow-hidden bg-black flex items-center justify-center">
                  <img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmlldG5hbXxlbnwwfHwwfHx8MA%3D%3D" alt="" />

                </div>

                {/* Buttons Actions */}
                <div className="flex items-center gap-1.5 mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLiked((p) => !p)}
                    className={cn(
                      "gap-1.5 h-8 px-2.5 rounded-lg text-[11px] font-semibold cursor-pointer",
                      "transition-all duration-150",
                      liked
                        ? "text-rose-500 bg-rose-500/10 hover:bg-rose-500/15"
                        : "text-foreground/50 hover:text-foreground hover:bg-foreground/8",
                    )}
                  >
                    <Heart size={14} fill={liked ? "currentColor" : "none"} />
                    {fmt(post.likeCount + (liked ? 1 : 0))}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-8 px-2.5 rounded-lg text-[11px] font-semibold
                             text-foreground/50 hover:text-foreground hover:bg-foreground/8"
                  >
                    <MessageCircle size={14} />
                    {post.commentCount}
                  </Button>

                  <div className="flex-1" />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSaved((p) => !p)}
                    className={cn(
                      "h-8 w-8 rounded-lg",
                      saved
                        ? "text-primary bg-primary/10 hover:bg-primary/15"
                        : "text-foreground/40 hover:text-foreground hover:bg-foreground/8",
                    )}
                  >
                    <Bookmark
                      size={14}
                      fill={saved ? "currentColor" : "none"}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-foreground/40
                             hover:text-primary hover:bg-primary/10"
                  >
                    <Share2 size={14} />
                  </Button>
                </div>

                {/* Comment count */}
                <p className="text-[12px] font-semibold text-foreground/60">
                  {post.commentCount} Bình luận
                </p>

                {/* Comments list */}
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.username} className="flex gap-2.5">
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full flex-shrink-0 mt-0.5",
                          "bg-gradient-to-br flex items-center justify-center",
                          "font-bold text-[11px] text-white",
                          c.avatarGradient,
                        )}
                      >
                        {c.avatarInitial}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <span className="text-[12.5px] font-semibold text-card-foreground">
                            {c.username}
                          </span>
                          <span className="text-[12.5px] text-foreground/60">
                            {c.text}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground/30 mt-1">
                          {c.time} trước ·{" "}
                          <button className="cursor-pointer hover:text-foreground/60 transition-colors">
                            Thích
                          </button>
                          {" · "}
                          <button className="cursor-pointer hover:text-foreground/60 transition-colors">
                            Trả lời
                          </button>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comment input */}
            <div className="border-t border-border/50 bg-transparent px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Avatar người dùng nhỏ gọn */}
                <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 border border-border/20">
                  <img
                    src="https://github.com/shadcn.png"
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Input Area */}
                <div className="flex-1 flex items-center relative">
                  <textarea
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    placeholder="Thêm bình luận..."
                    rows={1}
                    className="w-full resize-none bg-transparent py-1 pr-12 text-[14px] leading-5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none max-h-32"
                  />

                  {comment.trim() && (
                    <button
                      onClick={() => setComment("")}
                      className="text-[14px] font-semibold text-primary hover:text-primary/80 transition-colors active:opacity-50"
                    >
                      Đăng
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
