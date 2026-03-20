import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);
}

interface PostActionsProps {
  metrics: {
    likeCount: number;
    commentCount: number;
  };
}

export function PostActions({ metrics }: PostActionsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="my-3 flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLiked((p) => !p)}
        className={cn(
          "h-8 cursor-pointer gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold",
          "transition-all duration-150",
          liked
            ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/15"
            : "text-foreground/50 hover:text-foreground hover:bg-foreground/8",
        )}
      >
        <Heart size={14} fill={liked ? "currentColor" : "none"} />
        {fmt(metrics.likeCount + (liked ? 1 : 0))}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/50 hover:text-foreground hover:bg-foreground/8 h-8 gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold"
      >
        <MessageCircle size={14} />
        {metrics.commentCount}
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
        <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
      </Button>
    </div>
  );
}
