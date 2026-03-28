"use client"; // Bắt buộc nếu dùng Next.js App Router
import { Post } from "@/types/post";
import { useState } from "react";

interface PostContentProps {
  post: Post;
}

export default function PostContent({ post }: PostContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const MAX_LENGTH = 150;

  const isLongContent = post.content?.length > MAX_LENGTH;

  return (
    <div className="text-foreground/65 text-[13.5px] leading-relaxed">
      <div
        className={`wrap-break-word whitespace-pre-wrap ${
          !isExpanded && isLongContent ? "line-clamp-4" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="mt-1">
        {post.hashtags?.map((tag) => (
          <span
            key={tag}
            className="text-primary/80 hover:text-primary mr-2 inline-block cursor-pointer font-medium"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 3. Nút Xem thêm / Thu gọn */}
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
