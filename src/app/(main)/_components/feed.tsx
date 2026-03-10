"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import PostCard from "./post-card";
import type { Post } from "@/types/post";

// ── MOCK DATA ────────────────────────────────────────────────────────
const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author: {
      id: "u1",
      username: "minh.photography",
      displayName: "Minh",
      avatarInitial: "M",
      avatarGradient: "from-pink-500 to-rose-500",
      isVerified: true,
      isOnline: true,
    },
    title: "Hà Nội lúc hoàng hôn — khi thành phố khoác lên mình sắc vàng",
    body: "Phố cổ Hà Nội vào buổi chiều tà có một thứ ánh sáng không nơi nào có được. Những tia nắng cuối ngày xuyên qua kẽ lá, đổ bóng dài trên những con phố hẹp...",
    tags: ["hanoilife", "streetphotography", "sunset"],
    category: "city",
    imageEmoji: "🌇",
    imageBg: "from-rose-950 via-orange-900 to-amber-700",
    imageAspect: "wide",
    likeCount: 1248,
    commentCount: 84,
    repostCount: 32,
    isLiked: true,
    isSaved: false,
    createdAt: "14:32 · 01/03/2026",
  },
  {
    id: "2",
    author: {
      id: "u2",
      username: "nam.design",
      displayName: "Nam",
      avatarInitial: "N",
      avatarGradient: "from-violet-500 to-purple-500",
      isOnline: false,
    },
    title: "Bạn thích giao diện tối hay sáng cho ứng dụng hàng ngày?",
    body: "Đang làm dự án cá nhân, cần ý kiến của mọi người về UX. Dark mode hay Light mode hợp hơn với ứng dụng sinh hoạt hàng ngày?",
    tags: ["uxdesign", "darkmode", "poll"],
    category: "design",
    likeCount: 512,
    commentCount: 67,
    repostCount: 18,
    isLiked: false,
    isSaved: true,
    createdAt: "12:10 · 01/03/2026",
    poll: {
      totalVotes: 324,
      daysLeft: 2,
      options: [
        { id: "p1", emoji: "🌑", label: "Dark Mode",  percentage: 62, barColor: "bg-primary"   },
        { id: "p2", emoji: "☀️", label: "Light Mode", percentage: 38, barColor: "bg-sky-400"   },
      ],
    },
  },
  {
    id: "3",
    author: {
      id: "u3",
      username: "hung.travel",
      displayName: "Hùng",
      avatarInitial: "H",
      avatarGradient: "from-emerald-400 to-teal-400",
      isVerified: true,
      isOnline: true,
    },
    title: "Đà Lạt 5 giờ sáng — sương mù, yên lặng và một tách cà phê",
    body: "Không có gì tuyệt vời hơn là thức dậy sớm ở Đà Lạt. Cả thung lũng chìm trong sương, không khí lạnh cắt da... đây là lý do mình luôn quay lại nơi này.",
    tags: ["dalat", "travel", "nature"],
    category: "nature",
    imageEmoji: "🌿",
    imageBg: "from-emerald-950 via-teal-900 to-cyan-800",
    imageAspect: "square",
    likeCount: 3512,
    commentCount: 142,
    repostCount: 89,
    isLiked: false,
    isSaved: false,
    createdAt: "09:05 · 01/03/2026",
  },
  {
    id: "4",
    author: {
      id: "u4",
      username: "anh_thu99",
      displayName: "Anh Thư",
      avatarInitial: "A",
      avatarGradient: "from-rose-400 to-pink-400",
      isOnline: false,
    },
    title: "Phở gà lúc 7 giờ sáng — bình yên không thể tả",
    body: "Quán nhỏ góc phố, đôi đũa gỗ, tô phở bốc khói nghi ngút. Sài Gòn buổi sáng sớm có một thứ năng lượng khác, nhẹ nhàng và chân thật hơn.",
    tags: ["pho", "saigonfood", "morningvibes"],
    category: "food",
    imageEmoji: "🍜",
    imageBg: "from-amber-950 via-orange-900 to-yellow-800",
    imageAspect: "wide",
    likeCount: 891,
    commentCount: 56,
    repostCount: 24,
    isLiked: false,
    isSaved: false,
    createdAt: "07:22 · 01/03/2026",
  },
  {
    id: "5",
    author: {
      id: "u5",
      username: "linh_art",
      displayName: "Linh",
      avatarInitial: "L",
      avatarGradient: "from-sky-400 to-cyan-400",
      isVerified: false,
      isOnline: false,
    },
    title: "Bộ tranh minh họa mới — lấy cảm hứng từ kiến trúc Hội An",
    body: "Sau 3 tháng làm việc, mình đã hoàn thành bộ 12 bức minh họa về phố cổ Hội An. Mỗi bức là một góc nhìn khác nhau, từ ban mai đến đêm đèn lồng.",
    tags: ["illustration", "hoian", "artprocess"],
    category: "art",
    imageEmoji: "🎨",
    imageBg: "from-sky-950 via-blue-900 to-indigo-800",
    imageAspect: "wide",
    likeCount: 2104,
    commentCount: 198,
    repostCount: 115,
    isLiked: false,
    isSaved: false,
    createdAt: "Hôm qua · 22:18",
  },
];

type SortOption = "for-you" | "latest" | "popular";

// ── FEED HEADER (home-only → same file) ─────────────────────────────
interface FeedHeaderProps {
  postCount: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

function FeedHeader({ postCount, sort, onSortChange }: FeedHeaderProps) {
  const sorts: { key: SortOption; label: string }[] = [
    { key: "for-you",  label: "For You"  },
    { key: "latest",   label: "Mới nhất" },
    { key: "popular",  label: "Phổ biến" },
  ];

  return (
    <div className="flex items-center justify-end mb-4">
      <div className="flex gap-2">
        {sorts.map((s) => (
          <button
            key={s.key}
            onClick={() => onSortChange(s.key)}
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.08em]",
              "px-2.5 py-1.5 rounded-md border transition-all duration-150",
              sort === s.key
                ? "text-primary border-primary/50 bg-primary/8"
                : "text-foreground/40 border-border hover:text-foreground/70 hover:border-foreground/30"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function Feed() {
  const [sort, setSort] = useState<SortOption>("for-you");

  const sorted = [...MOCK_POSTS].sort((a, b) => {
    if (sort === "latest")  return 0; // keep original (newest first)
    if (sort === "popular") return b.likeCount - a.likeCount;
    return 0; // for-you: default order
  });

  return (
    <section className="">
      <FeedHeader
        postCount={248}
        sort={sort}
        onSortChange={setSort}
      />

      <div className="space-y-4">
        {sorted.map((post, i) => (
          <div
            key={post.id}
            className="animate-in fade-in slide-in-from-bottom-3 duration-300"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
          >
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* Load more */}
      <div className="mt-6 flex justify-center">
        <button
          className="
            text-[11px] uppercase tracking-widest
            text-foreground/30 hover:text-primary
            border border-border hover:border-primary/50
            rounded-lg px-5 py-2.5
            transition-all duration-150
          "
        >
          Tải thêm bài viết
        </button>
      </div>
    </section>
  );
}