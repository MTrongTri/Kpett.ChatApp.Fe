"use client";

import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/profile";

interface ProfileAvatarRowProps {
  profile: UserProfile;
  isOwner?: boolean;
}

export default function ProfileAvatarRow({
  profile,
  isOwner = false,
}: ProfileAvatarRowProps) {

  return (
    <div className="flex items-end justify-center -mt-12 md:-mt-14 mb-5 relative z-10 px-5 md:px-7">
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
            className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-[3px] border-background"
          />
        )}
      </div>
    </div>
  );
}