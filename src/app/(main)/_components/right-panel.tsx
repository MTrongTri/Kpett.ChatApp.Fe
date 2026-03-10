"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Check, Heart, MessageCircle, Plus, Repeat2, UserPlus } from "lucide-react";
import type { SuggestedUser, ActivityItem } from "@/types/post";

// ── MOCK DATA ────────────────────────────────────────────────────────
const SUGGESTED_USERS: SuggestedUser[] = [
  { id: "1", username: "linh_art",    reason: "Bạn của minh.photo",     avatarInitial: "L", avatarGradient: "from-sky-400 to-cyan-400"        },
  { id: "2", username: "khanh.moto",  reason: "Được gợi ý cho bạn",     avatarInitial: "K", avatarGradient: "from-orange-400 to-yellow-400"   },
  { id: "3", username: "van.foodie",  reason: "Theo dõi hung.travel",   avatarInitial: "V", avatarGradient: "from-emerald-400 to-teal-300"    },
  { id: "4", username: "phuong_k",    reason: "Được gợi ý cho bạn",     avatarInitial: "P", avatarGradient: "from-rose-400 to-pink-400"       },
  { id: "5", username: "bao.street",  reason: "Bạn của nam.design",     avatarInitial: "B", avatarGradient: "from-violet-500 to-purple-500"   },
];

const ACTIVITY: ActivityItem[] = [
  { 
    id: "1", 
    icon: Heart, 
    html: "<strong>minh.photo</strong> đã thích bài viết của bạn", 
    time: "5 phút trước",
    iconColor: "text-red-500"
  },
  { 
    id: "2", 
    icon: MessageCircle, 
    html: "<strong>hung.travel</strong> bình luận: <em>\"Quá đẹp!\"</em>", 
    time: "28 phút trước",
    iconColor: "text-blue-500"
  },
  { 
    id: "3", 
    icon: UserPlus, 
    html: "<strong>nam.design</strong> bắt đầu theo dõi bạn", 
    time: "1 giờ trước",
    iconColor: "text-green-500"
  },
  { 
    id: "4", 
    icon: Repeat2, 
    html: "<strong>anh_thu99</strong> đã chia sẻ bài viết của bạn", 
    time: "2 giờ trước",
    iconColor: "text-emerald-500"
  },
  { 
    id: "5", 
    icon: Heart, 
    html: "<strong>linh_art</strong> và <strong>14 người khác</strong> thích ảnh", 
    time: "3 giờ trước",
    iconColor: "text-red-500"
  },
];

const FOOTER_LINKS = [
  "Giới thiệu", "Điều khoản", "Riêng tư",
  "Ngôn ngữ", "API", "Hỗ trợ",
];

// ── SUB-COMPONENTS ───────────────────────────────────────────────────

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <p className="text-sm font-semibold text-foreground">
        {children}
      </p>
    </div>
  );
}

function SuggestionsCard() {
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-6">
      {SUGGESTED_USERS.map((user, i) => {
        const isFollowing = followed.has(user.id);
        return (
          <div key={user.id}>
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center",
                  "bg-gradient-to-br font-bold text-sm text-white",
                  user.avatarGradient
                )}
              >
                {user.avatarInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-card-foreground leading-tight truncate">
                  {user.username}
                </p>
                <p className="text-[11px] text-foreground/40 mt-0.5 truncate">
                  {user.reason}
                </p>
              </div>
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={() => toggle(user.id)}
                className={cn(
                  "h-7 px-3 text-[10px] font-semibold tracking-wider uppercase rounded-md flex-shrink-0",
                  "transition-all duration-150",
                  isFollowing
                    ? "border-border text-foreground/60 hover:border-destructive hover:text-destructive"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
                )}
              >
                {isFollowing ? (
                  <><Check size={10} className="mr-1" />Following</>
                ) : (
                  <><Plus size={10} className="mr-1" />Follow</>
                )}
              </Button>
            </div>
            {/* {i < SUGGESTED_USERS.length - 1 && (
              <Separator className="my-2.5 bg-border" />
            )} */}
          </div>
        );
      })}
    </div>
  );
}

function ActivityCard() {
  return (
    <div className="rounded-xl border border-border bg-card">
      {ACTIVITY.map((item) => (
        <div key={item.id} className="flex gap-3 px-4 py-3">
          <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[13px] flex-shrink-0 mt-0.5 ${item.iconColor || "text-foreground"}`}>
            {<item.icon />}
          </div>
          <div>
            <p
              className="text-[12.5px] leading-[1.5] text-foreground/70
                         [&_strong]:font-semibold [&_strong]:text-foreground
                         [&_em]:not-italic [&_em]:text-foreground/60"
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
            <p className="text-[10px] text-foreground/30 mt-1">
              {item.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FooterLinks() {
  return (
    <div className="px-1">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {FOOTER_LINKS.map((link) => (
          <button
            key={link}
            className="text-[10px] text-foreground/25 hover:text-foreground/50 transition-colors"
          >
            {link}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-foreground/20 mt-2">
        © 2026 VŌID by tuan.dev
      </p>
    </div>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function RightPanel() {
  return (
    <aside className="sticky top-[58px] h-[calc(100vh-58px)]">
      <ScrollArea className="h-full overscroll-contain">
        <div className="px-3 py-5 space-y-5 max-w-75">
          <div>
            <PanelLabel>Gợi ý theo dõi</PanelLabel>
            <SuggestionsCard />
          </div>

          <div>
            <PanelLabel>Hoạt động gần đây</PanelLabel>
            <ActivityCard />
          </div>

          <FooterLinks />
        </div>
      </ScrollArea>
    </aside>
  );
}