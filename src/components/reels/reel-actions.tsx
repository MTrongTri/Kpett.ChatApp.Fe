"use client";

import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { Post } from "@/types/post";
import { useCheckSaved, useSavePost, useUnsavePost } from "@/hooks/post/use-save-post";
import { toast } from "sonner";

interface ReelActionsProps {
  reel: Post;
  liked: boolean;
  likeCount: number;
  onLikeToggle: () => void;
  onCommentClick: () => void;
  isOverlay?: boolean;
}

export default function ReelActions({
  reel,
  liked,
  likeCount,
  onLikeToggle,
  onCommentClick,
  isOverlay = false,
}: ReelActionsProps) {
  const { data: isSaved } = useCheckSaved(reel.id);
  const { mutate: doSave, isPending: isSaving } = useSavePost(reel.id);
  const { mutate: doUnsave, isPending: isUnsaving } = useUnsavePost(reel.id);

  const saved = isSaved ?? false;
  const saving = isSaving || isUnsaving;

  const handleSaveToggle = () => {
    if (saving) return;
    if (saved) {
      doUnsave();
      toast.success("Đã bỏ lưu Reel");
    } else {
      doSave();
      toast.success("Đã lưu Reel vào mục Đã lưu");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${reel.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reel của ${reel.author?.displayName || "Kpett"}`,
          text: reel.content || "Xem Reel trên Kpett ChatApp",
          url,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Đã sao chép liên kết vào bộ nhớ tạm");
    } catch {
      toast.error("Không thể sao chép liên kết");
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3.5 sm:gap-4", isOverlay && "gap-3")}>
      {/* Nút Like */}
      <button
        type="button"
        onClick={onLikeToggle}
        className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none select-none"
        title="Thích"
      >
        <div
          className={cn(
            "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-200 shadow-md",
            liked
              ? "bg-rose-500/25 text-rose-500 hover:bg-rose-500/35 scale-105"
              : "bg-white/15 text-white backdrop-blur-md hover:bg-white/25 hover:scale-105 active:scale-95"
          )}
        >
          <Heart
            className={cn(
              "h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200",
              liked ? "fill-rose-500 scale-110" : "group-hover:scale-110"
            )}
          />
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-white drop-shadow-md">
          {formatCompactNumber(likeCount)}
        </span>
      </button>

      {/* Nút Bình luận */}
      <button
        type="button"
        onClick={onCommentClick}
        className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none select-none"
        title="Bình luận"
      >
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-105 active:scale-95 shadow-md">
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-200" />
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-white drop-shadow-md">
          {formatCompactNumber(reel.metrics?.commentCount ?? 0)}
        </span>
      </button>

      {/* Nút Lưu / Bookmark */}
      <button
        type="button"
        onClick={handleSaveToggle}
        disabled={saving}
        className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none disabled:opacity-60 select-none"
        title={saved ? "Bỏ lưu" : "Lưu"}
      >
        <div
          className={cn(
            "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-200 shadow-md",
            saved
              ? "bg-amber-500/25 text-amber-400 hover:bg-amber-500/35 scale-105"
              : "bg-white/15 text-white backdrop-blur-md hover:bg-white/25 hover:scale-105 active:scale-95"
          )}
        >
          <Bookmark
            className={cn(
              "h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200",
              saved ? "fill-amber-400 scale-110" : "group-hover:scale-110"
            )}
          />
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-white drop-shadow-md">
          {saved ? "Đã lưu" : "Lưu"}
        </span>
      </button>

      {/* Nút Chia sẻ */}
      <button
        type="button"
        onClick={handleShare}
        className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none select-none"
        title="Chia sẻ"
      >
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-105 active:scale-95 shadow-md">
          <Share2 className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-200" />
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-white drop-shadow-md">
          Chia sẻ
        </span>
      </button>
    </div>
  );
}
