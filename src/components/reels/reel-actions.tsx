"use client";

import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Send, ChevronDown, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { UserAvatar } from "@/components/user/user-avatar";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/post";
import { addReaction, removeReaction } from "@/services/post.service";
import { toast } from "sonner";

interface ReelActionsProps {
  reel: Post;
  onCommentClick: () => void;
  onUserClick: () => void;
}

export default function ReelActions({ reel, onCommentClick, onUserClick }: ReelActionsProps) {
  const [liked, setLiked] = useState(reel.viewerContext?.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(reel.metrics?.likeCount ?? 0);

  const handleLike = async () => {
    const prev = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
    try {
      if (prev) {
        await removeReaction(reel.id);
      } else {
        await addReaction(reel.id, 1);
      }
    } catch {
      setLiked(prev);
      setLikeCount(prevCount);
      toast.error("Không thể thực hiện tương tác");
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-12">
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onUserClick} className="shrink-0">
              <UserAvatar
                user={{
                  id: reel.author?.id ?? "",
                  username: reel.author?.username,
                  displayName: reel.author?.displayName,
                  avatarUrl: reel.author?.avatarUrl,
                }}
                className="h-10 w-10 ring-2 ring-white/50"
              />
            </button>
            <div className="min-w-0">
              <button
                onClick={onUserClick}
                className="text-sm font-bold text-white truncate block hover:underline"
              >
                {reel.author?.displayName ?? reel.author?.username ?? "Unknown"}
              </button>
              {reel.content && (
                <p className="text-xs text-white/80 line-clamp-2 mt-0.5">{reel.content}</p>
              )}
            </div>
          </div>
          {reel.content && (
            <button
              onClick={onCommentClick}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Xem {formatCompactNumber(reel.metrics?.commentCount ?? 0)} bình luận
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-5">
          <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
            <div
              className={cn(
                "rounded-full p-2.5 transition-all",
                liked
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-white/10 text-white group-hover:bg-white/20"
              )}
            >
              <Heart
                className={cn("h-6 w-6 transition-all", liked && "fill-rose-400 scale-110")}
              />
            </div>
            <span className="text-[11px] font-semibold text-white">{formatCompactNumber(likeCount)}</span>
          </button>

          <button onClick={onCommentClick} className="flex flex-col items-center gap-1 group">
            <div className="rounded-full bg-white/10 p-2.5 text-white transition-all group-hover:bg-white/20">
              <MessageCircle className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-semibold text-white">
              {formatCompactNumber(reel.metrics?.commentCount ?? 0)}
            </span>
          </button>

          <button className="flex flex-col items-center gap-1 group">
            <div className="rounded-full bg-white/10 p-2.5 text-white transition-all group-hover:bg-white/20">
              <Send className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-semibold text-white">Share</span>
          </button>

          <button className="flex flex-col items-center gap-1 group">
            <div className="rounded-full bg-white/10 p-2.5 text-white transition-all group-hover:bg-white/20">
              <Bookmark className="h-6 w-6" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
