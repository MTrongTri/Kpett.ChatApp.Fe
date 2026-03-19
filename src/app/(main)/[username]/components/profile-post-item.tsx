import { formatCompactNumber } from "@/lib/format-number-utils";
import { cn } from "@/lib/utils";
import { PostThumbnail } from "@/types/post";
import { Clapperboard, Heart, MessageCircle, Pin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProfilePostItemProps {
  post: PostThumbnail;
  setSelectedPostId: (postId: string) => void;
}

export default function ProfilePostItem({
  post,
  setSelectedPostId,
}: ProfilePostItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => setSelectedPostId(post.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl border transition-all duration-200",
        hovered
          ? "border-primary/50 -translate-y-0.5 shadow-lg shadow-black/20 dark:shadow-black/50"
          : "border-border",
      )}
    >
      <Image src={post.thumbnailUrl} alt="" fill className="object-cover" />

      <div className="absolute top-2 left-2 z-10 flex gap-1">
        {post.viewerContext.isPinned && (
          <span className="text-primary flex h-6 w-6 items-center justify-center rounded-md bg-black/55 backdrop-blur-sm">
            <Pin size={11} />
          </span>
        )}
        {post.type === "video" && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-white/80 backdrop-blur-sm">
            <Clapperboard size={11} />
          </span>
        )}
      </div>

      <div
        className={cn(
          "absolute inset-0 z-10 flex items-center justify-center gap-5 bg-black/55 backdrop-blur-[1px] transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0",
        )}
      >
        {[
          {
            id: "likes",
            icon: <Heart className="h-5 w-5 fill-white" />,
            value: formatCompactNumber(post.metrics.likeCount),
          },
          {
            id: "comments",
            icon: <MessageCircle className="h-5 w-5 fill-white" />,
            value: formatCompactNumber(post.metrics.commentCount),
          },
        ].map((stat) => (
          <div
            key={stat.id}
            className="flex items-center gap-1.5 text-sm font-bold text-white"
          >
            <span>{stat.icon}</span>
            <span>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
