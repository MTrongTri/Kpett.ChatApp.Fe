"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/post";
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Flag,
  Heart,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Play,
  UserMinus
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { UserAvatar } from "@/components/user/user-avatar";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { Media } from "@/types/media";
import Link from "next/link";
import PostContent from "./post-content";

// ── POST CARD ────────────────────────────────────────────────────────
interface PostCardProps {
  post: Post;
  onOpenPostLightBox: (
    postId: string,
    initPost: Post,
    targetSroll: string,
  ) => void;
  openMediaLightBox: (media: Media[], currentIndex: number) => void;
}

export default function PostCard({
  post,
  onOpenPostLightBox,
  openMediaLightBox,
}: PostCardProps) {
  const [liked, setLiked] = useState(post.viewerContext.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.metrics.likeCount);

  const [saved, setSaved] = useState(post.viewerContext.isSaved ?? false);

  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  const handleLike = () => {
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    setLiked(!liked);
  };

  return (
    <article className="border-border bg-card rounded-xl border transition-all duration-200">
      {/* ── HEADER ── */}
      <div className="flex items-start gap-3 p-4 pb-0">
        {/* Avatar */}
        <div>
          <Link href={post.author.username}>
            <UserAvatar user={post.author} className="h-10 w-10" />
          </Link>
        </div>

        {/* Meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-card-foreground decoration-primary cursor-pointer text-[13.5px] font-semibold">
              <Link href={post.author.username}>{post.author.displayName}</Link>
            </span>
            {post.author.isVerified && (
              <CheckCircle2 size={14} className="text-primary shrink-0" />
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="font-roboto text-foreground/40 text-[11px]">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>
        </div>

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/40 hover:text-foreground hover:bg-foreground/8 h-8 w-8 shrink-0 rounded-lg"
            >
              <MoreHorizontal size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card border-border text-card-foreground w-44 rounded-lg text-sm"
          >
            <DropdownMenuItem className="hover:text-primary focus:text-primary cursor-pointer gap-2">
              <Link2 size={13} /> Sao chép liên kết
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2">
              <EyeOff size={13} /> Ẩn bài viết này
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2">
              <UserMinus size={13} /> Bỏ theo dõi
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer gap-2">
              <Flag size={13} /> Báo cáo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── TITLE & BODY ── */}
      <div className="px-4 pt-3 pb-3">
        {post.title && (
          <h2 className="text-card-foreground decoration-primary mb-1.5 cursor-pointer text-[18px] leading-snug font-bold tracking-tight decoration-2 underline-offset-2">
            {post.title}
          </h2>
        )}

        {<PostContent content={post.content} tags={post.hashtags} />}
      </div>

      {/* ── IMAGE / MEDIA ── */}
      {post.media && post.media.length > 0 && (
        <div className="mx-4 mb-3">
          <div className="border-border group relative h-100 w-full overflow-hidden rounded-xl border">
            <Swiper
              modules={[Navigation, Pagination]}
              pagination={{ clickable: true }}
              navigation={{
                prevEl: prevEl,
                nextEl: nextEl,
              }}
              onBeforeInit={(swiper) => {
                if (
                  swiper.params.navigation &&
                  typeof swiper.params.navigation !== "boolean"
                ) {
                  swiper.params.navigation.prevEl = prevEl;
                  swiper.params.navigation.nextEl = nextEl;
                }
              }}
              className="h-full w-full"
            >
              {post.media.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="relative h-full w-full bg-black/5">
                    {item.type.toLocaleLowerCase() === "image" ? (
                      <Image
                        src={item.url}
                        alt=""
                        fill
                        className="object-cover cursor-pointer"
                        onClick={() => openMediaLightBox(post.media, index)}
                      />
                    ) : (
                      <div
                        className="group/video relative h-full w-full cursor-pointer"
                        onClick={() => openMediaLightBox(post.media, index)}
                      >
                        <video
                          src={item.url}
                          className="h-full w-full object-cover"
                          preload="metadata"
                        />
                        {/* Overlay làm tối nhẹ và Nút Play */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all group-hover/video:bg-black/25">
                          <Play className="h-14 w-14 text-white opacity-90 drop-shadow-lg transition-transform duration-200 group-hover/video:scale-110" />
                        </div>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom button Previous/ Next */}
            {post.media.length > 1 && (
              <>
                <button
                  ref={(node) => setPrevEl(node)}
                  className="absolute top-1/2 left-3 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/70 p-1.5 shadow-md transition-all hover:bg-white disabled:hidden md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5 text-black" />
                </button>

                <button
                  ref={(node) => setNextEl(node)}
                  className="absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/70 p-1.5 shadow-md transition-all hover:bg-white disabled:hidden md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5 text-black" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* ── ACTIONS ── */}
      <div className="flex items-center gap-1 px-3 py-2.5">
        {/* Like */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn(
            "font-roboto h-8 cursor-pointer gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold",
            "transition-all duration-150",
            liked
              ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/15 hover:text-rose-400"
              : "text-foreground/50 hover:text-foreground hover:bg-foreground/8",
          )}
        >
          <Heart
            size={14}
            className={cn("transition-transform", liked && "scale-110")}
            fill={liked ? "currentColor" : "none"}
          />
          {likeCount < 10000 ? (
            <span>{likeCount.toLocaleString("vi-VN")}</span>
          ) : (
            <span>{formatCompactNumber(likeCount)}</span>
          )}
        </Button>

        {/* Comment */}
        <Button
          variant="ghost"
          size="sm"
          className="font-roboto text-foreground/50 hover:text-foreground hover:bg-foreground/8 h-8 cursor-pointer gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold"
          onClick={() => onOpenPostLightBox(post.id, post, "comment-list-area")}
        >
          <MessageCircle size={14} />
          <span>{post.metrics.commentCount}</span>
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
              : "text-foreground/40 hover:text-foreground hover:bg-foreground/8",
          )}
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        </Button>
      </div>
    </article>
  );
}