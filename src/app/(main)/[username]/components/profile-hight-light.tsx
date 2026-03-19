"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { PostThumbnail } from "@/types/post";

interface ProfileHighlightsProps {
  highlights: PostThumbnail[];
  isOwner?: boolean;
}

function HighlightItem({ highlight }: { highlight: PostThumbnail }) {
  return (
    <div className="group flex shrink-0 cursor-pointer flex-col items-center gap-2.5">
      <div
        className={cn(
          "relative h-16.5 w-16.5 rounded-[18px]",
          "flex items-center justify-center bg-linear-to-br text-[28px]",
          "border border-white/10",
          "transition-all duration-200",
          "group-hover:-translate-y-1 group-hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)]",
        )}
      >
        <Image src={highlight.thumbnailUrl} alt="" fill />
      </div>
    </div>
  );
}

export default function ProfileHighlights({
  highlights,
  isOwner = false,
}: ProfileHighlightsProps) {
  if (highlights.length === 0) return null;

  return (
    <div className="px-5 pt-5 md:px-7">
      {/* Label row */}
      <div className="mb-3.5 flex items-center justify-between">
        <p className="text-foreground/30 text-[10px] font-semibold tracking-[0.15em] uppercase">
          Nổi bật
        </p>
        {isOwner && (
          <button className="text-primary/70 hover:text-primary text-[10px] tracking-wider uppercase transition-colors">
            + Thêm
          </button>
        )}
      </div>

      {/* Horizontal scroll */}
      <div
        className="-mx-1 flex gap-4.5 overflow-x-auto px-1 pb-5"
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
