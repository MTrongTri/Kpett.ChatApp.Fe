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
    <button className="group hover:bg-background/80 flex w-full cursor-pointer flex-col items-center gap-1 rounded-2xl border-none bg-transparent px-2 py-3 transition-all md:px-4">
      <span className="text-foreground group-hover:text-primary text-xl font-bold tracking-tight transition-colors md:text-[22px]">
        {formatCompactNumber(value)}
      </span>
      <span className="text-foreground/50 text-[10px] font-medium tracking-wider uppercase md:text-[11px]">
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
    <div className="mx-auto max-w-4xl px-5 md:px-7">
      {/* Name & role */}
      <div className="mb-4 space-y-1.5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight md:text-[28px]">
            {profile.displayName}
          </h1>

          {profile.isVerified && (
            <span className="bg-primary text-primary-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow-sm">
              <Check size={12} className="shrink-0" />
            </span>
          )}
        </div>

        <p className="text-foreground/50 flex justify-center text-sm font-medium">
          @{profile.username} {profile.location && <>· {profile.cocupation}</>}
        </p>
      </div>

      {/* Meta row */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
        {profile.location && (
          <span className="text-foreground/60 flex items-center gap-1.5 text-[13px] font-medium">
            <MapPin size={14} className="text-foreground/40 shrink-0" />
            {profile.location}
          </span>
        )}
        <span className="text-foreground/60 flex items-center gap-1.5 text-[13px] font-medium">
          <Calendar size={14} className="text-foreground/40 shrink-0" />
          Tham gia{" "}
          {formatRelativeTime(profile.createdAt, {
            style: "absolute",
            showTime: false,
          })}
        </span>
        {profile?.socialMedia?.website && (
          <a
            href="#"
            className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-[13px] font-medium transition-colors"
          >
            <Link2 size={14} className="shrink-0" />
            {profile.socialMedia.website}
          </a>
        )}
      </div>

      {profile.biography && (
        <div className="mb-6 flex justify-center px-4">
          <p className="text-foreground/70 max-w-2xl text-center text-[14px] leading-relaxed whitespace-pre-wrap">
            {profile.biography}
          </p>
        </div>
      )}

      {/* ── ACTION BUTTONS ── */}
      <div className="flex items-center justify-center gap-3 pb-2">
        {profile.viewerContext.isOwner ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-foreground border-border hover:bg-muted h-10 cursor-pointer gap-2 rounded-full px-6! text-[12px] font-bold tracking-wide uppercase transition-all"
            >
              <Pencil size={14} />
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-foreground border-border hover:bg-muted h-10 cursor-pointer gap-2 rounded-full px-6! text-[12px] font-bold tracking-wide uppercase transition-all"
            >
              <Share2 size={14} />
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
                "h-10 cursor-pointer gap-2 rounded-full px-6! text-[12px] font-bold tracking-wide uppercase shadow-sm transition-all duration-200 hover:scale-105",
                following
                  ? "border-border text-foreground bg-muted hover:border-destructive hover:bg-destructive/10 hover:text-destructive border"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {following ? (
                <>
                  <UserMinus size={14} />
                  Hủy kết bạn
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Thêm bạn bè
                </>
              )}
            </Button>

            {/* Message */}
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-muted h-10 cursor-pointer gap-2 rounded-full px-6! text-[12px] font-bold tracking-wide uppercase transition-all"
            >
              <MessageSquare size={14} />
              Nhắn tin
            </Button>

            {/* More dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border hover:bg-muted h-10 w-10 rounded-full transition-all"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border text-card-foreground w-48 rounded-2xl p-1 shadow-lg"
              >
                <DropdownMenuItem className="hover:bg-muted focus:bg-muted cursor-pointer gap-2.5 rounded-xl p-2.5 text-sm font-medium">
                  <Copy size={14} className="text-foreground/60" /> Sao chép
                  liên kết
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-muted focus:bg-muted cursor-pointer gap-2.5 rounded-xl p-2.5 text-sm font-medium">
                  <Share2 size={14} className="text-foreground/60" /> Chia sẻ
                  trang cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-muted focus:bg-muted cursor-pointer gap-2.5 rounded-xl p-2.5 text-sm font-medium">
                  <BellOff size={14} className="text-foreground/60" /> Tắt thông
                  báo
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border my-1" />
                <DropdownMenuItem className="hover:bg-muted focus:bg-muted cursor-pointer gap-2.5 rounded-xl p-2.5 text-sm font-medium">
                  <UserMinus size={14} className="text-foreground/60" /> Chặn
                  người dùng
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2.5 rounded-xl p-2.5 text-sm font-medium">
                  <Flag size={14} /> Báo cáo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {/* Stats row - Styled as a floating card */}
      <div className="bg-muted/40 border-border/50 mx-auto my-7 flex max-w-[90%] items-center justify-between rounded-3xl border p-2 shadow-sm backdrop-blur-sm md:max-w-[70%]">
        {[
          { value: profile.stats.posts, label: "Bài viết" },
          { value: profile.stats.friends, label: "Bạn bè" },
          { value: profile.stats.followers, label: "Theo dõi" },
          { value: profile.stats.following, label: "Đang theo dõi" },
        ].map((s) => (
          <div key={s.label} className="flex-1">
            <StatButton value={s.value} label={s.label} />
          </div>
        ))}
      </div>

      <Separator className="bg-border opacity-70" />
    </div>
  );
}
