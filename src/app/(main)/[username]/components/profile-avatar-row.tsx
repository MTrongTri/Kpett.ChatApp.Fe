"use client";

import { UserAvatar } from "@/components/user/user-avatar";
import { UserProfile } from "@/types/user";

interface ProfileAvatarRowProps {
  profile: UserProfile;
  isOwner?: boolean;
}

export default function ProfileAvatarRow({
  profile,
  isOwner = false,
}: ProfileAvatarRowProps) {
  return (
    <div className="relative z-10 -mt-12 mb-5 flex items-end justify-center px-5 md:-mt-14 md:px-7">
      {/* ── AVATAR ── */}
      <UserAvatar
        user={profile}
        isShowDotOnline={true}
        className="h-24 w-24"
        initialClassName="text-3xl"
        dotClassName="h-5 w-5 bottom-1 right-2"
      />
    </div>
  );
}
