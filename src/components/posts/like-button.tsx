"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ThumbsUp, Laugh, Frown, Angry, SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { addReaction, removeReaction } from "@/services/post.service";
import { useAuth } from "../providers/auth-provider";
import { toast } from "sonner";

export type ReactionType = 0 | 1 | 2 | 3 | 4 | 5;

interface ReactionConfig {
  type: ReactionType;
  emoji: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const REACTIONS: ReactionConfig[] = [
  { type: 0, emoji: "\u{1F44D}", label: "Th\u00edch", icon: <ThumbsUp size={14} />, color: "text-blue-500", bgColor: "bg-blue-500/10 hover:bg-blue-500/15" },
  { type: 1, emoji: "\u2764\uFE0F", label: "Y\u00eau th\u00edch", icon: <Heart size={14} />, color: "text-rose-500", bgColor: "bg-rose-500/10 hover:bg-rose-500/15" },
  { type: 2, emoji: "\u{1F602}", label: "Haha", icon: <Laugh size={14} />, color: "text-yellow-500", bgColor: "bg-yellow-500/10 hover:bg-yellow-500/15" },
  { type: 3, emoji: "\u{1F62E}", label: "Wow", icon: <SmilePlus size={14} />, color: "text-orange-500", bgColor: "bg-orange-500/10 hover:bg-orange-500/15" },
  { type: 4, emoji: "\u{1F622}", label: "Bu\u1ed3n", icon: <Frown size={14} />, color: "text-cyan-500", bgColor: "bg-cyan-500/10 hover:bg-cyan-500/15" },
  { type: 5, emoji: "\u{1F621}", label: "Ph\u1eabn n\u1ed9", icon: <Angry size={14} />, color: "text-red-600", bgColor: "bg-red-600/10 hover:bg-red-600/15" },
];

const FALLBACK_ICON = <Heart size={14} />;

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialReactionType?: number | null;
}

export default function LikeButton({
  postId,
  initialLiked,
  initialLikeCount,
  initialReactionType,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [reactionType, setReactionType] = useState<number | null>(initialReactionType ?? null);
  const [showPicker, setShowPicker] = useState(false);

  const { isAuthenticated } = useAuth();
  const pickerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const currentReaction = REACTIONS.find((r) => r.type === reactionType);

  const handleReaction = async (type: ReactionType) => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để tương tác với bài viết.");
      return;
    }

    const prevLiked = liked;
    const prevCount = likeCount;
    const prevReaction = reactionType;

    if (reactionType === type) {
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      setReactionType(null);
      try {
        await removeReaction(postId);
      } catch {
        setLiked(prevLiked);
        setLikeCount(prevCount);
        setReactionType(prevReaction);
      }
    } else {
      setLiked(true);
      setLikeCount((c) => (prevLiked ? c : c + 1));
      setReactionType(type);
      try {
        await addReaction(postId, type);
      } catch {
        setLiked(prevLiked);
        setLikeCount(prevCount);
        setReactionType(prevReaction);
      }
    }

    setShowPicker(false);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setShowPicker(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => setShowPicker(false), 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "font-roboto h-8 cursor-pointer gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition-all duration-150",
          liked && currentReaction
            ? `${currentReaction.bgColor} ${currentReaction.color}`
            : liked
              ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/15 hover:text-rose-400"
              : "text-foreground/50 hover:text-foreground hover:bg-foreground/8",
        )}
        onClick={() => {
          if (!isAuthenticated) {
            toast.warning("Vui lòng đăng nhập để tương tác với bài viết.");
            return;
          }
          setShowPicker((prev) => !prev);
        }}
      >
        <span className={cn("transition-transform", liked && "scale-110")}>
          {currentReaction ? currentReaction.emoji : FALLBACK_ICON}
        </span>
        {likeCount < 10000 ? (
          <span>{likeCount.toLocaleString("vi-VN")}</span>
        ) : (
          <span>{formatCompactNumber(likeCount)}</span>
        )}
      </Button>

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-2 shadow-lg">
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                onClick={() => handleReaction(r.type)}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-lg transition-all duration-150 hover:scale-125 hover:bg-foreground/5",
                  reactionType === r.type && "scale-110",
                )}
                title={r.label}
              >
                <span className="text-xl leading-none">{r.emoji}</span>
                <span className={cn("text-[9px] font-medium leading-none", reactionType === r.type ? r.color : "text-foreground/50")}>
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
