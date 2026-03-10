"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { ProfileHighlight } from "@/types/profile";

interface ProfileHighlightsProps {
  highlights: ProfileHighlight[];
  isOwner?: boolean;
}

function HighlightItem({ highlight }: { highlight: ProfileHighlight }) {
  return (
    <div className="flex flex-col items-center gap-2.5 flex-shrink-0 cursor-pointer group">
      <div
        className={cn(
          "h-[66px] w-[66px] rounded-[18px]",
          "bg-gradient-to-br flex items-center justify-center text-[28px]",
          "border border-white/10",
          "transition-all duration-200",
          "group-hover:-translate-y-1 group-hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)]",
          highlight.bgGradient
        )}
      >
        {highlight.emoji}
      </div>
      <span
        className="text-[9px] uppercase tracking-[0.08em]
                   text-foreground/45 max-w-[66px] text-center
                   overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {highlight.title}
      </span>
    </div>
  );
}

export default function ProfileHighlights({
  highlights,
  isOwner = false,
}: ProfileHighlightsProps) {
  if (highlights.length === 0) return null;

  return (
    <div className="px-5 md:px-7 pt-5">
      {/* Label row */}
      <div className="flex items-center justify-between mb-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/30">
          Nổi bật
        </p>
        {isOwner && (
          <button className="text-[10px] text-primary/70 hover:text-primary transition-colors uppercase tracking-wider">
            + Thêm
          </button>
        )}
      </div>

      {/* Horizontal scroll */}
      <div
        className="flex gap-[18px] overflow-x-auto pb-5 -mx-1 px-1"
        style={{ scrollbarWidth: "none" }}
      >
        {highlights.map((h) => (
          <HighlightItem key={h.id} highlight={h} />
        ))}
      </div>

      <Separator className="bg-border" />
    </div>
  );
}