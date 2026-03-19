"use client";

import { PostThumbnail } from "@/types/post";
import { useState } from "react";
import ProfileLightbox from "./profile-light-box";
import ProfilePostItem from "./profile-post-item";

interface ProfilePostsProps {
  posts: PostThumbnail[];
}

export default function ProfilePosts({ posts }: ProfilePostsProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  if (posts.length === 0) {
    return (
      <div className="text-foreground/30 flex flex-col items-center gap-3 py-20">
        <span className="text-5xl">📷</span>
        <p className="text-[11px] tracking-[0.12em] uppercase">
          Chưa có bài viết nào
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {posts.map((post) => (
          <ProfilePostItem
            key={post.id}
            post={post}
            setSelectedPostId={setSelectedPostId}
          />
        ))}
      </div>

      <ProfileLightbox
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </>
  );
}
