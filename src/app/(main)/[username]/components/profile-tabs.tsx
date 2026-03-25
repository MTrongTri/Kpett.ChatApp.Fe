"use client";

import { useState, useEffect, useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

// Services & Types
import { getPostsByUsername } from "@/services/post.service";
import { UserProfile } from "@/types/user";
import { PostThumbnail } from "@/types/post";

// Components
import ProfilePosts from "./profile-posts";
import ProfilePostsSkeleton from "./profile-post-skeleton";

// Icons
import {
  Bookmark,
  Clapperboard,
  LayoutGrid,
  TriangleAlert,
  Loader2,
} from "lucide-react";
import { ApiResponse, PaginatedData } from "@/types/common/api";

export type ProfileTab = "posts" | "reels" | "saved";

const PAGE_SIZE = 3;

const TABS: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { key: "posts", label: "Bài viết", icon: <LayoutGrid size={13} /> },
  { key: "reels", label: "Reels", icon: <Clapperboard size={13} /> },
  { key: "saved", label: "Đã lưu", icon: <Bookmark size={13} /> },
];

type PostInfiniteKey = [string, string, ProfileTab, string | null];

const getKey = (
  pageIndex: number,
  previousPageData: ApiResponse<PaginatedData<PostThumbnail>> | null,
  username: string,
  tab: ProfileTab,
): PostInfiniteKey | null => {
  if (
    previousPageData &&
    (!previousPageData.data || !previousPageData.data.pagination.hasMore)
  ) {
    return null;
  }

  const cursor =
    pageIndex === 0
      ? null
      : (previousPageData?.data?.pagination.nextCursor ?? null);

  return ["profile-posts", username, tab, cursor];
};

// ── COMPONENT CHÍNH ────────────────────────────────────────────────
interface ProfileTabsProps {
  author: UserProfile;
}

export default function ProfileTabs({ author }: ProfileTabsProps) {
  const [tab, setTab] = useState<ProfileTab>("posts");

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const { data, size, setSize, error, isLoading, isValidating, mutate } =
    useSWRInfinite(
      (index, prev) => getKey(index, prev, author.username, tab),
      ([_, user, currentTab, cursor]: PostInfiniteKey) =>
        getPostsByUsername(user, currentTab, cursor, PAGE_SIZE),
      {
        revalidateOnFocus: true,
        shouldRetryOnError: false,
        persistSize: false,
      },
    );

  const allPosts = useMemo(() => {
    return data ? data.flatMap((page) => page.data?.items || []) : [];
  }, [data]);

  const hasMore = data
    ? data[data.length - 1]?.data?.pagination.hasMore
    : false;
  const isInitialLoading = isLoading && !data;

  useEffect(() => {
    if (inView && hasMore && !isValidating) {
      setSize(size + 1);
    }
  }, [inView, hasMore, isValidating, setSize, size]);

  const handleTabChange = (newTab: ProfileTab) => {
    if (tab !== newTab) {
      setTab(newTab);
    }
  };

  return (
    <div className="w-full">
      {/* ── TAB BAR ── */}
      <div className="border-border mx-5 mt-4 flex justify-center border-b md:mx-7">
        {TABS.map((t) => {
          // Chỉ chủ sở hữu mới thấy tab "Đã lưu"
          if (t.key === "saved" && !author.viewerContext.isOwner) return null;

          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={cn(
                "relative flex items-center justify-center gap-2 px-4 py-3.5 md:px-6",
                "text-[11px] font-bold uppercase transition-all duration-200",
                active
                  ? "text-primary"
                  : "text-foreground/40 hover:text-foreground/70",
              )}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {active && (
                <span className="bg-primary absolute right-0 bottom-[-1px] left-0 h-[2px] rounded-t-full shadow-[0_-2px_8px_rgba(var(--primary),0.4)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="px-5 pt-5 pb-10 md:px-7">
        {error ? (
          <div className="text-destructive flex flex-col items-center py-20">
            <TriangleAlert className="mb-2 opacity-50" size={40} />
            <p className="text-xs font-medium tracking-widest uppercase">
              Lỗi tải dữ liệu
            </p>
            <button
              onClick={() => mutate()}
              className="mt-4 text-[10px] uppercase underline"
            >
              Thử lại
            </button>
          </div>
        ) : isInitialLoading ? (
          <ProfilePostsSkeleton count={PAGE_SIZE} />
        ) : allPosts.length === 0 ? (
          <div className="text-foreground/30 flex flex-col items-center py-32">
            <div className="bg-foreground/5 ring-foreground/10 mb-4 rounded-full p-6 ring-1 ring-inset">
              {tab === "reels" ? (
                <Clapperboard size={32} />
              ) : (
                <LayoutGrid size={32} />
              )}
            </div>
            <p className="text-[11px] tracking-[0.2em] uppercase">
              Không có dữ liệu
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <ProfilePosts posts={allPosts} />

            {/* ── ĐIỂM KÍCH HOẠT LOAD MORE ── */}
            <div
              ref={ref}
              className="flex min-h-2.5 items-start justify-center"
            >
              {hasMore && (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="text-primary/40 animate-spin" size={24} />
                  <span className="text-foreground/30 text-[9px] tracking-tighter uppercase">
                    Đang tải thêm...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
