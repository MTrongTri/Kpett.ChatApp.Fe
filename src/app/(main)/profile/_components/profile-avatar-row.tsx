"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  UserCheck,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Share2,
  Copy,
  BellOff,
  UserMinus,
  Flag,
} from "lucide-react";
import type { UserProfile } from "@/types/profile";

interface ProfileAvatarRowProps {
  profile: UserProfile;
  isOwner?: boolean;
}

export default function ProfileAvatarRow({
  profile,
  isOwner = false,
}: ProfileAvatarRowProps) {
  const [following, setFollowing] = useState(profile.isFollowing);

  return (
    <div className="flex items-end justify-between -mt-12 md:-mt-14 mb-5 relative z-10 px-5 md:px-7">
      {/* ── AVATAR ── */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            "h-24 w-24 md:h-[100px] md:w-[100px] rounded-full",
            "bg-gradient-to-br flex items-center justify-center",
            "font-extrabold text-4xl text-white",
            "border-4 border-background",
            "shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
            profile.avatarGradient
          )}
        >
          {profile.avatarInitial}
        </div>

        {/* Online dot */}
        {profile.isOnline && (
          <span
            className="absolute bottom-1 right-1 h-5 w-5 rounded-full
                       bg-emerald-500 border-[3px] border-background"
          />
        )}
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="flex items-center gap-2 pb-1">
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
                  : "bg-primary/15 border border-primary text-primary hover:bg-primary/25"
              )}
            >
              {following
                ? <><UserCheck size={13} />Following</>
                : <><UserPlus  size={13} />Follow</>
              }
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
    </div>
  );
}