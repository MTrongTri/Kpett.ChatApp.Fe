"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface ProfileCoverProps {
  /** Tailwind gradient classes, e.g. "from-emerald-950 via-teal-900 to-cyan-950" */
  gradient: string;
  /** Decorative emoji overlays matching the profile theme */
  decorations?: { emoji: string; className: string }[];
  isOwner?: boolean;
}

const DEFAULT_DECORATIONS = [
  { emoji: "🌿", className: "absolute top-8 right-[12%] text-6xl opacity-10 rotate-12 select-none pointer-events-none" },
  { emoji: "📷", className: "absolute bottom-5 right-[28%] text-4xl opacity-8 -rotate-8 select-none pointer-events-none" },
];

export default function ProfileCover({
  gradient,
  decorations = DEFAULT_DECORATIONS,
  isOwner = false,
}: ProfileCoverProps) {
  return (
    <div className="relative h-52 md:h-60 w-full overflow-hidden flex-shrink-0">
      {/* Gradient base */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />

      {/* Grid pattern overlay */}
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

      {/* Decorative emojis */}
      {decorations.map((d, i) => (
        <span key={i} className={d.className}>{d.emoji}</span>
      ))}

      {/* Edit cover button (owner only) */}
      {isOwner && (
        <Button
          size="sm"
          variant="outline"
          className="
            absolute bottom-3 right-3 h-8 gap-1.5
            text-[10px] uppercase tracking-wider
            bg-black/40 border-white/20 text-white/70
            hover:bg-black/60 hover:text-white hover:border-white/40
            backdrop-blur-sm
          "
        >
          <Camera size={12} />
          Đổi ảnh bìa
        </Button>
      )}
    </div>
  );
}