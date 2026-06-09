"use client";

import { openPostLightBox } from "@/store/features/modal-slice";
import { PostThumbnail } from "@/types/post";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import ProfilePostItem from "./profile-post-item";

interface ProfilePostsProps {
  posts: PostThumbnail[];
}

export default function ProfilePosts({ posts }: ProfilePostsProps) {

  const dispatch = useDispatch();
  const router = useRouter();

  const handleOpenPost = (postId: string) => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      router.push(`/post/${postId}`);
      return;
    }

    dispatch(openPostLightBox({ postId }));
  };

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
            onClick={() => handleOpenPost(post.id)}
          />
        ))}
      </div>
    </>
  );
}
