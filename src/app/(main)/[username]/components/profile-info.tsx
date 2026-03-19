"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/user";
import {
  BellOff,
  Calendar,
  Check,
  Copy,
  Flag,
  Link2,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Share2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

// ── STAT BUTTON ───────────────────────────────────────────────────────
function StatButton({ value, label }: { value: number; label: string }) {
  return (
    <button className="hover:bg-foreground/5 group flex cursor-pointer flex-col items-center gap-1 rounded-xl border-none bg-transparent px-4 py-2 transition-colors md:px-5">
      <span className="text-foreground group-hover:text-primary text-[22px] leading-none font-bold transition-colors">
        {formatCompactNumber(value)}
      </span>
      <span className="text-foreground/40 text-[9px] tracking-[0.12em]">
        {label}
      </span>
    </button>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
interface ProfileInfoProps {
  profile: UserProfile;
}

export default function ProfileInfo({ profile }: ProfileInfoProps) {
  const [following, setFollowing] = useState(profile.viewerContext.isFriend);

  return (
    <div className="px-5 md:px-7">
      {/* Name & role */}
      <div className="mb-3">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <h1 className="text-foreground text-[24px] leading-tight font-bold">
            {profile.displayName}
          </h1>

          {profile.isVerified && (
            <span className="bg-primary text-primary-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
              <Check size={12} className="shrink-0" />
            </span>
          )}
        </div>

        <p className="text-foreground/40 mt-1.5 flex justify-center text-[12px]">
          @{profile.username} · {profile.role}
        </p>
      </div>

      {/* Meta row */}
      <div className="mb-3.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <span className="text-foreground/45 flex items-center gap-1.5 text-[12px]">
          <MapPin size={12} className="shrink-0" />
          {profile.location}
        </span>
        <span className="text-foreground/45 flex items-center gap-1.5 text-[12px]">
          <Calendar size={12} className="shrink-0" />
          Tham gia {formatRelativeTime(profile.joinedAt, { showTime: false })}
        </span>
        {profile.socialMedia.website && (
          <a
            href="#"
            className="text-primary/80 hover:text-primary flex items-center gap-1.5 text-[12px] transition-colors"
          >
            <Link2 size={12} className="shrink-0" />
            {profile.socialMedia.website}
          </a>
        )}
      </div>

      {profile.biography && (
        <div className="mb-3.5 flex justify-center">
          <p className="text-foreground/45 text-center text-[12px] whitespace-pre-wrap">
            {profile.biography}
          </p>
        </div>
      )}

      {/* ── ACTION BUTTONS ── */}
      <div className="flex items-center justify-center gap-2 pb-1">
        {profile.viewerContext.isOwner ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-foreground border-border hover:border-primary/60 hover:text-primary h-9 cursor-pointer gap-1.5 text-[11px] tracking-wider uppercase"
            >
              <Pencil size={12} />
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-foreground border-border hover:border-primary/60 hover:text-primary h-9 cursor-pointer gap-1.5 text-[11px] tracking-wider uppercase"
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
                "h-9 gap-1.5 px-4 text-[11px] tracking-wider uppercase",
                "transition-all duration-150",
                following
                  ? "border-border text-foreground/60 hover:border-destructive hover:text-destructive border bg-transparent"
                  : "bg-primary/15 border-primary text-primary hover:bg-primary/25 border",
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
              className="border-border hover:border-primary/60 hover:text-primary h-9 gap-1.5 px-3 text-[11px] tracking-wider uppercase"
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
                  className="border-border hover:border-foreground/30 h-9 w-9 rounded-lg"
                >
                  <MoreHorizontal size={15} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border text-card-foreground w-48 rounded-xl"
              >
                <DropdownMenuItem className="hover:text-primary focus:text-primary cursor-pointer gap-2 text-sm">
                  <Copy size={13} /> Sao chép liên kết
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:text-primary focus:text-primary cursor-pointer gap-2 text-sm">
                  <Share2 size={13} /> Chia sẻ trang cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 text-sm">
                  <BellOff size={13} /> Tắt thông báo
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="cursor-pointer gap-2 text-sm">
                  <UserMinus size={13} /> Chặn người dùng
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer gap-2 text-sm">
                  <Flag size={13} /> Báo cáo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {/* Stats row */}
      <div className="-mx-2 my-5 flex items-center justify-center">
        {[
          { value: profile.stats.posts, label: "Bài viết" },
          { value: profile.stats.friends, label: "Bạn bè" },
          { value: profile.stats.followers, label: "Theo dõi" },
          { value: profile.stats.following, label: "Đang theo dõi" },
        ].map((s, i, arr) => (
          <div key={s.label} className="flex items-center">
            <StatButton value={s.value} label={s.label} />
            {i < arr.length - 1 && (
              <div className="bg-border h-8 w-px shrink-0" />
            )}
          </div>
        ))}
      </div>

      <Separator className="bg-border" />
    </div>
  );
}
