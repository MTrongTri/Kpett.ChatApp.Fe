"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import Image from "next/image";

interface ProfileCoverProps {
  cover: string | null;
  decorations?: { emoji: string; className: string }[];
  isOwner?: boolean;
}

const DEFAULT_DECORATIONS = [
  {
    emoji: "🌿",
    className:
      "absolute top-8 right-[12%] text-6xl opacity-10 rotate-12 select-none pointer-events-none",
  },
  {
    emoji: "📷",
    className:
      "absolute bottom-5 right-[28%] text-4xl opacity-8 -rotate-8 select-none pointer-events-none",
  },
];

export default function ProfileCover({
  cover,
  decorations = DEFAULT_DECORATIONS,
  isOwner = false,
}: ProfileCoverProps) {
  const defaultGradientClass =
    "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500";

  return (
    <div className="bg-muted relative h-52 w-full shrink-0 overflow-hidden md:h-80">
      {cover ? (
        <>
          <Image
            src={cover}
            alt="Profile Cover"
            className="object-cover"
            fill
          />
          <div className="absolute inset-0 bg-black/20" />
        </>
      ) : (
        <div className={cn("absolute inset-0", defaultGradientClass)} />
      )}

      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.07)_0%,transparent_65%)]" />

      {!cover &&
        decorations.map((d, i) => (
          <span key={i} className={d.className}>
            {d.emoji}
          </span>
        ))}

      {isOwner && (
        <Button
          size="sm"
          variant="outline"
          className="absolute right-3 bottom-3 z-10 h-8 gap-1.5 border-white/20 bg-black/40 text-[10px] tracking-wider text-white/70 uppercase backdrop-blur-sm hover:border-white/40 hover:bg-black/60 hover:text-white"
        >
          <Camera size={12} />
          Đổi ảnh bìa
        </Button>
      )}
    </div>
  );
}
