import { formatCompactNumber } from "@/lib/format-number-utils";
import { cn } from "@/lib/utils";
import { PostThumbnail } from "@/types/post";
import { Clapperboard, Heart, MessageCircle, Pin, AlignLeft, PlayCircle } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";


// Cập nhật interface theo cấu trúc mới
interface ProfilePostItemProps {
  post: PostThumbnail & {
    content?: string;
  };
  onClick: (postId: string) => void;
}

export default function ProfilePostItem({
  post,
  onClick,
}: ProfilePostItemProps) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = post.mediaThumbnail?.type.toLocaleLowerCase() === "video";
  const mediaUrl = post.mediaThumbnail?.url;

  // Xử lý logic play/pause video mượt mà khi hover
  useEffect(() => {
    if (isVideo && mediaUrl && videoRef.current) {
      if (hovered) {
        // Thêm catch để tránh lỗi DOM Exception khi user di chuột quá nhanh
        videoRef.current.play().catch(() => { });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [hovered, isVideo, mediaUrl]);

  return (
    <div
      onClick={() => onClick(post.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl border transition-all duration-200",
        hovered
          ? "border-primary/50 -translate-y-0.5 shadow-lg shadow-black/20 dark:shadow-black/50"
          : "border-border"
      )}
    >
      {/* 1. HIỂN THỊ VIDEO PREVIEW KHI HOVER */}
      {isVideo && mediaUrl && (
        <video
          ref={videoRef}
          src={mediaUrl}
          muted
          loop
          playsInline
          className={cn(
            "absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-300",
            hovered ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* 2. HIỂN THỊ THUMBNAIL (IMAGE/VIDEO) HOẶC FALLBACK */}
      <div
        className={cn(
          "absolute inset-0 z-0 h-full w-full transition-opacity duration-300",
          // Ẩn thumbnail tĩnh đi khi đang hover và có video để phát
          hovered && isVideo && mediaUrl ? "opacity-0" : "opacity-100"
        )}
      >
        {post.mediaThumbnail ? (
          // NẾU CÓ MEDIA: Kiểm tra xem đó là ảnh hay video
          post.mediaThumbnail.type.toLocaleLowerCase() === "image" ? (
            <Image
              src={mediaUrl!}
              alt={post.content?.slice(0, 50) || "Post thumbnail"}
              fill
              className="object-cover"
            />
          ) : (
            // Nếu là Video: Dùng trick lấy frame 0.1s làm ảnh tĩnh thay vì tải ảnh riêng
            <video
              src={`${mediaUrl}#t=0.1`}
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )
        ) : (
          // NẾU KHÔNG CÓ MEDIA (Fallback cho Text-only hoặc bài bị lỗi dữ liệu)
          <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-secondary/50 to-muted p-4 text-center dark:from-zinc-800 dark:to-zinc-900">
            {post.content ? (
              // Fallback cho bài viết chỉ có chữ
              <p className="line-clamp-4 text-xs font-medium text-muted-foreground sm:text-sm md:text-base">
                {post.content}
              </p>
            ) : (
              // Fallback cuối cùng nếu rỗng tuếch
              <AlignLeft className="h-10 w-10 text-muted-foreground/50 sm:h-12 sm:w-12" strokeWidth={1.5} />
            )}
          </div>
        )}
      </div>

      {/* 3. KHU VỰC BADGES (Góc trái trên) */}
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        {post.viewerContext?.isPinned && (
          <span className="text-primary flex h-6 w-6 items-center justify-center rounded-md bg-black/55 backdrop-blur-sm">
            <Pin size={11} />
          </span>
        )}
        {/* Hiển thị icon Clapperboard nếu nhận diện media đó là Video */}
        {isVideo && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-white/80 backdrop-blur-sm">
            <Clapperboard size={11} />
          </span>
        )}
      </div>

      {/* 4. KHU VỰC METRICS KHI HOVER */}
      <div
        className={cn(
          "absolute inset-0 z-10 flex items-center justify-center gap-5 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0"
        )}
      >
        {[
          {
            id: "likes",
            icon: <Heart className="h-5 w-5 fill-white text-white" />,
            value: formatCompactNumber(post.metrics?.likeCount || 0),
          },
          {
            id: "comments",
            icon: <MessageCircle className="h-5 w-5 fill-white text-white" />,
            value: formatCompactNumber(post.metrics?.commentCount || 0),
          },
        ].map((stat) => (
          <div
            key={stat.id}
            className="flex items-center gap-1.5 text-sm font-bold text-white drop-shadow-md"
          >
            <span>{stat.icon}</span>
            <span>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}