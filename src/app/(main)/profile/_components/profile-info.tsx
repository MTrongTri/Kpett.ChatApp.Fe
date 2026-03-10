"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { BadgeCheck, MapPin, Calendar, Link2 } from "lucide-react";
import type { UserProfile } from "@/types/profile";

// ── FORMAT HELPER ─────────────────────────────────────────────────────
function fmtCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "k";
  return n.toString();
}

// ── STAT BUTTON ───────────────────────────────────────────────────────
function StatButton({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
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
}

export default function ProfileInfo({ profile }: ProfileInfoProps) {
  return (
    <div className="px-5 md:px-7">
      {/* Name & role */}
      <div className="mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1
            className="text-[24px] font-bold leading-tight text-foreground"
          >
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

          {profile.isFollowingBack && (
            <span
              className="text-[10px] uppercase tracking-[0.1em]
                         text-foreground/40 border border-border
                         rounded-md px-2 py-0.5"
            >
              Theo dõi lại bạn
            </span>
          )}
        </div>

        <p className="text-[12px] text-foreground/40 mt-1.5">
          @{profile.username} · {profile.role}
        </p>
      </div>

      {/* Bio */}
      <p className="text-[14.5px] leading-[1.75] text-foreground/65 mb-3.5 whitespace-pre-line max-w-[560px]">
        {profile.bio}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3.5">
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

      {/* Social chips */}
      {/* {profile.socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {profile.socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              className="
                flex items-center gap-1.5
                text-[11px] text-foreground/55
                border border-border bg-card
                rounded-[9px] px-3 py-[5px]
                hover:text-primary hover:border-primary/50 hover:bg-primary/5
                transition-all duration-150
                no-underline
              "
            >
              <span>{link.icon}</span>
              {link.label}
            </a>
          ))}
        </div>
      )} */}

      {/* Stats row */}
      <div className="flex items-center -mx-2 mb-5">
        {[
          { value: profile.stats.posts,     label: "Bài viết"  },
          { value: profile.stats.followers, label: "Theo dõi"  },
          { value: profile.stats.following, label: "Đang theo" },
          { value: profile.stats.likes,     label: "Lượt thích"},
        ].map((s, i, arr) => (
          <div key={s.label} className="flex items-center">
            <StatButton value={s.value} label={s.label} />
            {i < arr.length - 1 && (
              <div className="w-px h-8 bg-border flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      <Separator className="bg-border" />
    </div>
  );
}