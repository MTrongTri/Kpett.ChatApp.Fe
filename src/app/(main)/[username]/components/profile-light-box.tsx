import { CommentInput } from "@/components/comment/comment-input";
import { CommentList } from "@/components/comment/comment-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/user/user-avatar";
import { MOCK_COMMENT } from "@/data/comment";
import { cn } from "@/lib/utils";
import { getPostById } from "@/services/post.service";
import {
  BadgeCheck,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import useSWR from "swr";

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);
}

interface ProfileLightboxProps {
  postId: string | null;
  onClose: () => void;
}

export default function ProfileLightbox({
  postId,
  onClose,
}: ProfileLightboxProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState("");

  // Bỏ useState của prevEl và nextEl đi cho code sạch hơn

  const { data, isLoading, isValidating, error } = useSWR(
    postId ? `post_detail_${postId}` : null,
    () => getPostById(postId!),
  );

  if (!postId) return null;

  if (!data?.data) {
    return null;
  }

  const post = data.data;
  const comments = MOCK_COMMENT.filter(
    (m) => m.postId === post.id && m.parentId == null,
  );

  const prevBtnId = `prev-btn-${post.id}`;
  const nextBtnId = `next-btn-${post.id}`;

  return (
    <Dialog open={!!postId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-card border-border flex max-h-[94vh] w-[92vw] flex-col gap-0 overflow-hidden rounded-lg md:max-w-[940px] md:rounded-2xl"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">
            Bài viết của {post.author.username}
          </DialogTitle>

          {/* Author row */}
          <div className="border-border flex shrink-0 items-center gap-2.5 border-b py-3">
            <UserAvatar user={post.author} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-card-foreground truncate text-[13px] font-semibold">
                  {post.author.username}
                </span>
                {post.author.isVerified && (
                  <BadgeCheck size={13} className="text-primary shrink-0" />
                )}
              </div>
            </div>
            <button className="text-primary hover:text-primary/75 shrink-0 cursor-pointer text-[10px] font-semibold uppercase transition-colors">
              Follow
            </button>
          </div>
        </DialogHeader>

        {/* ── INFO PANEL ── */}
        {/* Caption + Comments */}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
          {/* Caption */}
          <div>
            <p className="text-foreground/65 text-[13.5px] leading-relaxed">
              {post.content}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-primary/75 hover:text-primary cursor-pointer text-[11px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── IMAGE / MEDIA  ── */}
          {post.media && post.media.length > 0 && (
            <div className="w-full shrink-0">
              <div className="border-border group [&_.swiper-pagination-bullet-active]:bg-primary relative h-100 w-full overflow-hidden rounded-xl border">
                <Swiper
                  modules={[Navigation, Pagination]}
                  pagination={{ clickable: true }}
                  navigation={{
                    prevEl: `#${prevBtnId}`,
                    nextEl: `#${nextBtnId}`,
                  }}
                  className="h-full w-full"
                >
                  {post.media.map((item, index) => (
                    <SwiperSlide key={index}>
                      <div className="relative h-full w-full bg-black/5">
                        {item.type === "image" ? (
                          <Image
                            src={item.url}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <video
                            src={item.url}
                            controls
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom button Previous/ Next */}
                {post.media.length > 1 && (
                  <>
                    <button
                      id={prevBtnId}
                      className="absolute top-1/2 left-3 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/70 p-1.5 shadow-md transition-all hover:bg-white disabled:hidden md:opacity-0 md:group-hover:opacity-100"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-5 w-5 text-black" />
                    </button>

                    <button
                      id={nextBtnId}
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

          {/* Buttons Actions */}
          <div className="mb-3 flex items-center gap-1.5">
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
              {fmt(post.metrics.likeCount + (liked ? 1 : 0))}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/50 hover:text-foreground hover:bg-foreground/8 h-8 gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold"
            >
              <MessageCircle size={14} />
              {post.metrics.commentCount}
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

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/40 hover:text-primary hover:bg-primary/10 h-8 w-8 rounded-lg"
            >
              <Share2 size={14} />
            </Button>
          </div>

          {/* Comment count */}
          <p className="text-foreground/60 text-[12px] font-semibold">
            {post.metrics.commentCount} Bình luận
          </p>

          {/* Comments list */}
          <CommentList postId={post.id} comments={comments} />
        </div>

        {/* Comment input */}
        <CommentInput author={post.author} />
      </DialogContent>
    </Dialog>
  );
}
