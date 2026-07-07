"use client";
import { Post } from "@/types/post";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PostContentProps {
  content: string;
  tags?: string[];
  isNsfw?: boolean;
  showNsfwContent?: boolean;
}

export default function PostContent({ content, tags, isNsfw, showNsfwContent }: PostContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const MAX_LENGTH = 150;

  const isLongContent = content?.length > MAX_LENGTH;

  return (
    <div className={cn("text-foreground/65 text-[13.5px] leading-relaxed", isNsfw && !showNsfwContent && "blur-sm select-none")}>
      <div
        className={`wrap-break-word whitespace-pre-wrap ${!isExpanded && isLongContent ? "line-clamp-4" : ""
          }`}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className="mt-1">
        {tags?.map((tag) => (
          <span
            key={tag}
            className="text-primary/80 hover:text-primary mr-2 inline-block cursor-pointer font-medium"
          >
            #{tag}
          </span>
        ))}
      </div>

      {isLongContent && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-foreground/60 mt-1 block cursor-pointer font-semibold"
        >
          {!isExpanded && "Xem thêm"}
        </button>
      )}
    </div>
  );
}
