"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Music2,
  Plus,
} from "lucide-react";
import { useReelsFeed } from "@/hooks/post/use-reels-feed";
import ReelPlayer from "@/components/reels/reel-player";
import ReelActions from "@/components/reels/reel-actions";
import { UserAvatar } from "@/components/user/user-avatar";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/post";
import { addReaction, removeReaction } from "@/services/post.service";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import Link from "next/link";

export default function ReelsPage() {
  const router = useRouter();
  const { reels, isLoadingInitialData, isLoadingMore, hasMore, loadMore } = useReelsFeed();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  const { ref: sentinelRef, inView: sentinelInView } = useInView();

  useEffect(() => {
    if (sentinelInView && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [sentinelInView, hasMore, isLoadingMore, loadMore]);

  const scrollToReel = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const children = Array.from(container.children).filter(
      (el) => el.getAttribute("data-reel-item") === "true"
    ) as HTMLElement[];
    const reelEl = children[index];
    if (reelEl) {
      reelEl.scrollIntoView({ behavior: "smooth" });
      setActiveIndex(index);
      activeIndexRef.current = index;
    }
  }, []);

  // Keyboard navigation for reels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        if (activeIndexRef.current < reels.length - 1) {
          scrollToReel(activeIndexRef.current + 1);
        }
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        if (activeIndexRef.current > 0) {
          scrollToReel(activeIndexRef.current - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reels.length, scrollToReel]);

  // Scroll listener to update active reel index
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0;
        const children = Array.from(container.children).filter(
          (el) => el.getAttribute("data-reel-item") === "true"
        ) as HTMLElement[];
        const center = container.scrollTop + container.clientHeight / 2;
        let newIndex = 0;
        for (let i = 0; i < children.length; i++) {
          const el = children[i];
          const rect = el.getBoundingClientRect();
          const elTop = container.scrollTop + rect.top;
          const elBottom = elTop + rect.height;
          if (center >= elTop && center <= elBottom) {
            newIndex = i;
            break;
          }
        }
        if (newIndex !== activeIndexRef.current) {
          activeIndexRef.current = newIndex;
          setActiveIndex(newIndex);
        }
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const goToCreateReel = useCallback(() => {
    router.push("/reels/create");
  }, [router]);

  if (isLoadingInitialData) {
    return (
      <div className="flex h-[calc(100dvh-58px)] items-center justify-center bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-white/70" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex h-[calc(100dvh-58px)] flex-col items-center justify-center gap-6 bg-neutral-950 px-6 text-center">
        <div className="rounded-full bg-white/10 p-6 shadow-inner">
          <Plus className="h-12 w-12 text-white/60" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Chưa có Reels nào</h1>
          <p className="max-w-xs text-sm text-white/60">
            Hãy là người đầu tiên tạo video ngắn và chia sẻ khoảnh khắc của bạn với cộng đồng.
          </p>
        </div>
        <Button
          onClick={goToCreateReel}
          className="rounded-full bg-white px-8 py-6 text-base font-bold text-black hover:bg-white/90 shadow-lg cursor-pointer"
        >
          <Plus className="mr-2 h-5 w-5" />
          Tạo Reel
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100dvh-58px)] w-full bg-neutral-950 overflow-hidden select-none">
      {/* Container cuộn dọc dạng snap */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", overscrollBehavior: "contain" }}
      >
        {reels.map((reel, index) => (
          <ReelItem
            key={reel.id}
            reel={reel}
            isActive={index === activeIndex}
            onCommentClick={() => router.push(`/post/${reel.id}`)}
            onUserClick={() => router.push(`/${reel.author?.username}`)}
          />
        ))}

        {hasMore && (
          <div ref={sentinelRef} className="flex h-20 items-center justify-center bg-neutral-950">
            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          </div>
        )}
      </div>

      {/* Floating Desktop Navigation Arrows */}
      <div className="hidden lg:flex flex-col gap-2 absolute right-8 top-1/2 -translate-y-1/2 z-40">
        <Button
          variant="ghost"
          size="icon"
          disabled={activeIndex === 0}
          onClick={() => scrollToReel(activeIndex - 1)}
          className="h-10 w-10 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/25 disabled:opacity-30 cursor-pointer shadow-lg"
          title="Reel trước (Phím mũi tên lên)"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={activeIndex === reels.length - 1 && !hasMore}
          onClick={() => scrollToReel(activeIndex + 1)}
          className="h-10 w-10 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/25 disabled:opacity-30 cursor-pointer shadow-lg"
          title="Reel tiếp theo (Phím mũi tên xuống)"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>

      {/* Nút Tạo Reel Nổi */}
      <Button
        onClick={goToCreateReel}
        size="icon"
        className="fixed right-4 top-20 z-50 h-12 w-12 rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 shadow-xl cursor-pointer"
        title="Tạo Reel mới"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

function ReelItem({
  reel,
  isActive,
  onCommentClick,
  onUserClick,
}: {
  reel: Post;
  isActive: boolean;
  onCommentClick: () => void;
  onUserClick: () => void;
}) {
  const [liked, setLiked] = useState(reel.viewerContext?.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(reel.metrics?.likeCount ?? 0);
  const [isExpanded, setIsExpanded] = useState(false);

  const videoUrl = reel.media?.[0]?.url ?? "";
  const thumbnailUrl = reel.media?.[0]?.thumbnailUrl;

  const handleLikeToggle = useCallback(async () => {
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
  }, [liked, likeCount, reel.id]);

  const handleDoubleTapLike = useCallback(() => {
    if (!liked) {
      handleLikeToggle();
    }
  }, [liked, handleLikeToggle]);

  return (
    <div
      data-reel-item="true"
      className="flex h-full w-full items-center justify-center snap-start snap-always py-1 sm:py-3 px-1 sm:px-4"
    >
      <div className="relative flex items-end justify-center gap-3 sm:gap-4.5 h-full max-h-[820px] w-full max-w-[min(100%,560px)]">
        {/* Khung Video Reel Card */}
        <div className="relative flex-1 h-full w-full rounded-none sm:rounded-2xl overflow-hidden bg-black shadow-2xl border-0 sm:border sm:border-white/10 flex items-center justify-center">
          <ReelPlayer
            src={videoUrl}
            isActive={isActive}
            thumbnailUrl={thumbnailUrl}
            onDoubleTapLike={handleDoubleTapLike}
          />

          {/* Lớp phủ Overlay Thông tin tác giả & Caption */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16 pr-14 sm:pr-4">
            {/* Thông tin tác giả */}
            <div className="pointer-events-auto flex items-center gap-3 mb-2.5">
              <button
                type="button"
                onClick={onUserClick}
                className="shrink-0 cursor-pointer transition-transform hover:scale-105"
              >
                <UserAvatar
                  user={{
                    id: reel.author?.id ?? "",
                    username: reel.author?.username,
                    displayName: reel.author?.displayName,
                    avatarUrl: reel.author?.avatarUrl,
                  }}
                  className="h-10 w-10 ring-2 ring-white/60 shadow-md"
                />
              </button>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/${reel.author?.username}`}
                  className="text-sm font-bold text-white truncate block hover:underline drop-shadow-md"
                >
                  {reel.author?.displayName || reel.author?.username || "Người dùng"}
                </Link>
                <span className="text-xs text-white/60 truncate block drop-shadow-sm">
                  @{reel.author?.username}
                </span>
              </div>
            </div>

            {/* Caption / Nội dung Reel */}
            {reel.content && (
              <div className="pointer-events-auto mb-2 text-xs sm:text-[13px] text-white/90 drop-shadow-md">
                <p className={isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"}>
                  {reel.content}
                </p>
                {reel.content.length > 80 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-white/70 hover:text-white font-semibold mt-0.5 text-xs cursor-pointer inline-block"
                  >
                    {isExpanded ? "Thu gọn" : "Xem thêm"}
                  </button>
                )}
              </div>
            )}

            {/* Nhạc nền / Audio Ticker */}
            <div className="flex items-center gap-2 text-xs text-white/70">
              <Music2 className="h-3.5 w-3.5 shrink-0 animate-pulse text-white/80" />
              <span className="truncate drop-shadow-sm font-medium">
                Âm thanh gốc - {reel.author?.displayName || "Kpett Sound"}
              </span>
            </div>
          </div>

          {/* Action Overlay trên Mobile (< sm) */}
          <div className="sm:hidden absolute right-2.5 bottom-16 z-30">
            <ReelActions
              reel={reel}
              liked={liked}
              likeCount={likeCount}
              onLikeToggle={handleLikeToggle}
              onCommentClick={onCommentClick}
              isOverlay
            />
          </div>
        </div>

        {/* Thanh Tác vụ Nổi bên cạnh Video trên Desktop/Tablet (sm+) */}
        <div className="hidden sm:flex flex-col items-center pb-2 z-20">
          <ReelActions
            reel={reel}
            liked={liked}
            likeCount={likeCount}
            onLikeToggle={handleLikeToggle}
            onCommentClick={onCommentClick}
          />
        </div>
      </div>
    </div>
  );
}
