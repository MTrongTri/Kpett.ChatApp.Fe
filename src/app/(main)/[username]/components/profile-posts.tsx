"use client";

import { PostThumbnail } from "@/types/post";
import ProfilePostItem from "./profile-post-item";
import { usePostLightBox } from "@/hooks/use-post-light-box";
import PostLightbox from "@/components/posts/post-light-box/post-light-box";

interface ProfilePostsProps {
  posts: PostThumbnail[];
}

export default function ProfilePosts({ posts }: ProfilePostsProps) {
  // Trích xuất toàn bộ state và actions từ custom hook
  const {
    isOpen,
    isPostLoading,
    isCommentsLoading,
    post,
    comments,
    autoScrollTarget,
    isLoadingMore,
    hasMore,
    loadMoreComments,
    openModal,
    closeModal,
    mutateComments
  } = usePostLightBox();

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
        {posts.map((thumbnail) => (
          <ProfilePostItem
            key={thumbnail.id}
            post={thumbnail}
            onClick={() => openModal(thumbnail.id)}
          />
        ))}
      </div>

      {/* Chỉ render Lightbox khi isOpen = true để tối ưu hiệu suất */}
      {isOpen && (
        <PostLightbox
          isOpen={isOpen}
          onClose={closeModal}
          post={post}
          comments={comments}
          autoScrollTarget={autoScrollTarget}
          isPostLoading={isPostLoading}
          isCommentsLoading={isCommentsLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreComments}
          mutateComments={mutateComments}
        />
      )}
    </>
  );
}
