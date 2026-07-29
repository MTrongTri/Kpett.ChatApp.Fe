"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { useReelsFeed } from "@/hooks/post/use-reels-feed";
import ReelPlayer from "@/components/reels/reel-player";
import ReelActions from "@/components/reels/reel-actions";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/post";
import { useInView } from "react-intersection-observer";

export default function ReelsPage() {
  const router = useRouter();
  const { reels, isLoadingInitialData, isLoadingMore, hasMore, loadMore } = useReelsFeed();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const isScrolling = useRef(false);

  const { ref: sentinelRef, inView: sentinelInView } = useInView();

  useEffect(() => {
    if (sentinelInView && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [sentinelInView, hasMore, isLoadingMore, loadMore]);

  const scrollToReel = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const reelEl = container.children[index] as HTMLElement;
    if (reelEl) {
      reelEl.scrollIntoView({ behavior: "smooth" });
      setActiveIndex(index);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrolling.current) return;
      const children = Array.from(container.children) as HTMLElement[];
      const center = container.scrollTop + container.clientHeight / 2;
      let newIndex = 0;
      for (let i = 0; i < children.length; i++) {
        const el = children[i];
        const elTop = el.offsetTop;
        const elBottom = elTop + el.clientHeight;
        if (center >= elTop && center <= elBottom) {
          newIndex = i;
          break;
        }
      }
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeIndex]);

  const goToCreateReel = useCallback(() => {
    router.push("/reels/create");
  }, [router]);

  if (isLoadingInitialData) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-black px-6 text-center">
        <div className="rounded-full bg-white/10 p-6">
          <Plus className="h-12 w-12 text-white/60" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-white">Chưa có Reels nào</h1>
        <p className="max-w-xs text-sm text-white/60">
          Hãy là người đầu tiên tạo video ngắn và chia sẻ khoảnh khắc của bạn với cộng đồng.
        </p>
        <Button
          onClick={goToCreateReel}
          className="rounded-full bg-white px-8 py-6 text-base font-bold text-black hover:bg-white/90"
        >
          <Plus className="mr-2 h-5 w-5" />
          Tạo Reel
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
          <div ref={sentinelRef} className="flex h-20 items-center justify-center bg-black">
            <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          </div>
        )}
      </div>

      <Button
        onClick={goToCreateReel}
        size="icon"
        className="fixed right-4 top-20 z-50 h-12 w-12 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
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
  const videoUrl = reel.media?.[0]?.url ?? "";
  const thumbnailUrl = reel.media?.[0]?.thumbnailUrl;

  return (
    <div className="relative h-full w-full snap-start snap-always bg-black">
      <ReelPlayer
        src={videoUrl}
        isActive={isActive}
        thumbnailUrl={thumbnailUrl}
      />
      <ReelActions
        reel={reel}
        onCommentClick={onCommentClick}
        onUserClick={onUserClick}
      />
    </div>
  );
}
