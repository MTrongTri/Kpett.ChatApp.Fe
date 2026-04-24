"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { useCreateComment } from "@/hooks/comment/use-create-comment";
import { usePostComments } from "@/hooks/post/use-post-comments";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { Post } from "@/types/post";

import { CommentInput } from "@/components/comment/comment-input";
import { CommentItemSkeleton } from "@/components/comment/comment-item-skeleton";
import { CommentList } from "@/components/comment/comment-list";
import { BaseUser } from "@/types/user";

import { Button } from "@/components/ui/button";
import { closePostLightBox } from "@/store/features/modal-slice";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useAuth } from "@/components/providers/auth-provider";
import { usePostMenuActions } from "@/hooks/post/use-post-menu-actions";

interface PostCommentSectionProps {
    post: Post;
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    autoScrollTarget: string | null;
}

export default function PostCommentSection({
    post,
    scrollContainerRef,
    autoScrollTarget,
}: PostCommentSectionProps) {
    const dispatch = useDispatch();
    const router = useRouter();

    const { user: currentUser } = useAuth();

    // Quản lý State của Comments
    const {
        comments,
        isCommentsLoading,
        isLoadingMore,
        hasMore,
        commentsError,
        loadMoreComments,
        mutateComments,
    } = usePostComments({ postId: post.id, limit: 12 });

    // Logic Infinite Scroll
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        rootMargin: "100px",
    });

    useEffect(() => {
        // Không trigger load more nếu đang có lỗi
        if (inView && hasMore && !isLoadingMore && !commentsError) {
            loadMoreComments();
        }
    }, [inView, hasMore, isLoadingMore, commentsError, loadMoreComments]);

    // Logic Auto-scroll tới một comment cụ thể (nếu có)
    useEffect(() => {
        if (autoScrollTarget && !isCommentsLoading && !commentsError) {
            const timer = setTimeout(() => {
                const target = document.getElementById(autoScrollTarget);
                if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [autoScrollTarget, isCommentsLoading, commentsError]);

    // Logic Xử lý Mentions và Thêm Comment
    const { fetchMentions } = usePostMenuActions(post);
    const debouncedFetchMentions = useDebounceCallback(fetchMentions, 300);

    const { handleAddComment } = useCreateComment({
        post,
        localMutate: mutateComments,
        onSuccess: () => {
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                        top: scrollContainerRef.current.scrollHeight,
                        behavior: "smooth",
                    });
                }
            }, 150);
        },
    });

    return (
        <>
            {/* KHU VỰC HIỂN THỊ BÌNH LUẬN */}
            <div className="px-3 flex-1 flex flex-col">
                <p id="comment-list-area" className="text-foreground/60 mb-3 text-[12px] font-semibold">
                    {post.metrics.commentCount} Bình luận
                </p>

                {/* XỬ LÝ TRẠNG THÁI LỖI TOÀN BỘ */}
                {commentsError && comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
                        <div className="bg-destructive/10 text-destructive flex h-12 w-12 items-center justify-center rounded-full mb-3">
                            <AlertCircle size={24} />
                        </div>
                        <p className="text-foreground text-sm font-semibold mb-1">
                            Không thể tải bình luận
                        </p>
                        <p className="text-muted-foreground text-xs mb-4 max-w-62.5">
                            Đã xảy ra lỗi kết nối mạng hoặc lỗi máy chủ. Vui lòng thử lại.
                        </p>
                    </div>
                ) : (
                    <div>
                        {isCommentsLoading && comments.length === 0 ? (
                            <>
                                <CommentItemSkeleton />
                                <CommentItemSkeleton />
                                <CommentItemSkeleton />
                            </>
                        ) : (
                            <CommentList postId={post.id} comments={comments} />
                        )}
                    </div>
                )}
            </div>

            {/* XỬ LÝ TRẠNG THÁI LỖI KHI LOAD MORE */}
            {commentsError && comments.length > 0 && (
                <div className="flex flex-col items-center justify-center py-4 px-3 text-center border-t border-border/30 mt-2">
                    <p className="text-muted-foreground text-xs mb-2">
                        Lỗi tải thêm bình luận.
                    </p>
                </div>
            )}

            {/* SKELETON KHI LOAD MORE */}
            {hasMore && isLoadingMore && !commentsError && (
                <div className="mt-3 space-y-3 px-3">
                    <CommentItemSkeleton />
                    <CommentItemSkeleton />
                </div>
            )}

            {/* ĐIỂM CHẠM LOAD MORE CHO OBSERVER */}
            {hasMore && !commentsError && (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                    {!isLoadingMore && (
                        <span className="text-muted-foreground text-xs">Cuộn để xem thêm</span>
                    )}
                </div>
            )}

            {/* THÔNG BÁO HẾT BÌNH LUẬN */}
            {!hasMore && comments.length > 0 && !commentsError && (
                <p className="text-muted-foreground/50 py-4 text-center text-xs">
                    Đã tải hết bình luận
                </p>
            )}

            {/* KHUNG NHẬP BÌNH LUẬN HOẶC YÊU CẦU ĐĂNG NHẬP */}
            {currentUser ? (
                <div className="border-border/50 sticky bottom-0 bg-card border-t px-4 pt-4 pb-4 mt-auto z-10">
                    <CommentInput
                        author={currentUser}
                        fetchMentions={debouncedFetchMentions}
                        onSubmit={handleAddComment}
                    />
                </div>
            ) : (
                <div className="border-border/50 sticky bottom-0 bg-card border-t px-4 py-4 mt-auto z-10">
                    <div className="bg-primary/5 border-primary/15 flex flex-col items-center justify-between gap-3 rounded-xl border p-3 sm:flex-row sm:px-4">
                        <div className="flex items-center gap-3 text-center sm:text-left">
                            <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <p className="text-foreground text-sm font-semibold">Tham gia cuộc trò chuyện</p>
                                <p className="text-muted-foreground text-xs">Chia sẻ góc nhìn của bạn với mọi người.</p>
                            </div>
                        </div>
                        <Button
                            className="bg-primary text-primary-foreground hover:opacity-90 flex w-full items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold transition-opacity sm:w-auto"
                            onClick={() => {
                                router.push("/login");
                                dispatch(closePostLightBox());
                            }}
                        >
                            Đăng nhập ngay
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}