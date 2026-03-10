"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Link2,
  Pencil,
  Share2,
  UserCheck,
  UserPlus,
  MessageSquare,
  MoreHorizontal,
  Copy,
  BellOff,
  UserMinus,
  Flag,
} from "lucide-react";
import type { UserProfile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── FORMAT HELPER ─────────────────────────────────────────────────────
function fmtCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "k";
  return n.toString();
}

// ── STAT BUTTON ───────────────────────────────────────────────────────
function StatButton({ value, label }: { value: number; label: string }) {
  return (
    <button
      className="
        flex flex-col items-center gap-1 px-4 md:px-5 py-2 rounded-xl
        border-none bg-transparent cursor-pointer
        hover:bg-foreground/5 transition-colors group
      "
    >
      <span
        className="text-[22px] font-bold leading-none text-foreground
                   group-hover:text-primary transition-colors"
      >
        {fmtCount(value)}
      </span>
      <span className="text-[9px] tracking-[0.12em] text-foreground/40">
        {label}
      </span>
    </button>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
interface ProfileInfoProps {
  profile: UserProfile;
  isOwner: boolean;
}

export default function ProfileInfo({
  profile,
  isOwner = false,
}: ProfileInfoProps) {
  const [following, setFollowing] = useState(profile.isFollowing);

  return (
    <div className="px-5 md:px-7">
      {/* Name & role */}
      <div className="mb-3">
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          <h1 className="text-[24px] font-bold leading-tight text-foreground">
            {profile.displayName}
          </h1>

          {profile.isVerified && (
            <span
              className="w-5 h-5 rounded-full bg-primary flex-shrink-0
                         flex items-center justify-center text-[11px]
                         font-bold text-primary-foreground"
            >
              ✓
            </span>
          )}

        </div>

        <p className="text-[12px] flex justify-center text-foreground/40 mt-1.5">
          @{profile.username} · {profile.role}
        </p>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-3.5">
        <span className="flex items-center gap-1.5 text-[12px] text-foreground/45">
          <MapPin size={12} className="flex-shrink-0" />
          {profile.location}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-foreground/45">
          <Calendar size={12} className="flex-shrink-0" />
          Tham gia {profile.joinedAt}
        </span>
        {profile.website && (
          <a
            href="#"
            className="flex items-center gap-1.5 text-[12px]
                       text-primary/80 hover:text-primary transition-colors"
          >
            <Link2 size={12} className="flex-shrink-0" />
            {profile.website}
          </a>
        )}
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="flex items-center justify-center gap-2 pb-1">
        {isOwner ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-[11px] uppercase tracking-wider
                         border-border hover:border-primary/60 hover:text-primary"
            >
              <Pencil size={12} />
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-[11px] uppercase tracking-wider
                         border-border hover:border-primary/60 hover:text-primary"
            >
              <Share2 size={12} />
              Chia sẻ
            </Button>
          </>
        ) : (
          <>
            {/* Follow */}
            <Button
              size="sm"
              onClick={() => setFollowing((p) => !p)}
              className={cn(
                "h-9 px-4 gap-1.5 text-[11px] uppercase tracking-wider",
                "transition-all duration-150",
                following
                  ? "bg-transparent border border-border text-foreground/60 hover:border-destructive hover:text-destructive"
                  : "bg-primary/15 border border-primary text-primary hover:bg-primary/25",
              )}
            >
              {following ? (
                <>
                  <UserMinus size={13} />
                  Hủy kết bạn
                </>
              ) : (
                <>
                  <UserPlus size={13} />
                  Thêm bạn bè
                </>
              )}
            </Button>

            {/* Message */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 gap-1.5 text-[11px] uppercase tracking-wider
                         border-border hover:border-primary/60 hover:text-primary"
            >
              <MessageSquare size={13} />
              Nhắn tin
            </Button>

            {/* More dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg border-border hover:border-foreground/30"
                >
                  <MoreHorizontal size={15} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-card border-border text-card-foreground rounded-xl"
              >
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm hover:text-primary focus:text-primary">
                  <Copy size={13} /> Sao chép liên kết
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm hover:text-primary focus:text-primary">
                  <Share2 size={13} /> Chia sẻ trang cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm">
                  <BellOff size={13} /> Tắt thông báo
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm">
                  <UserMinus size={13} /> Chặn người dùng
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-destructive focus:text-destructive">
                  <Flag size={13} /> Báo cáo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-center -mx-2 my-5">
        {[
          { value: profile.stats.posts, label: "Bài viết" },
          { value: profile.stats.likes, label: "Bạn bè" },
          { value: profile.stats.followers, label: "Theo dõi" },
          { value: profile.stats.following, label: "Đang theo dõi" },
        ].map((s, i, arr) => (
          <div key={s.label} className="flex items-center">
            <StatButton value={s.value} label={s.label} />
            {i < arr.length - 1 && (
              <div className="w-px h-8 bg-border shrink-0" />
            )}
          </div>
        ))}
      </div>

      <Separator className="bg-border" />
    </div>
  );
}
