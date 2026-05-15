import { CommentInput } from "@/components/comment/comment-input";
import { CommentItemSkeleton } from "@/components/comment/comment-item-skeleton";
import { CommentList } from "@/components/comment/comment-list";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import useCreateComment from "@/hooks/comment/use-create-comment";
import { usePostComments } from "@/hooks/post/use-post-comments";
import { usePostMenuActions } from "@/hooks/post/use-post-menu-actions";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { Post } from "@/types/post";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function PostDetailComments({ post }: { post: Post }) {
    const { user: currentUser } = useAuth();

    const {
        comments,
        isCommentsLoading,
        isLoadingMore,
        hasMore,
        commentsError,
        loadMoreComments,
    } = usePostComments({ postId: post.id, limit: 12 });

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        rootMargin: "160px",
    });

    useEffect(() => {
        if (inView && hasMore && !isLoadingMore && !commentsError) {
            loadMoreComments();
        }
    }, [inView, hasMore, isLoadingMore, commentsError, loadMoreComments]);

    const { fetchMentions } = usePostMenuActions(post);
    const debouncedFetchMentions = useDebounceCallback(fetchMentions, 300);

    const { handleAddComment, isPending } = useCreateComment({
        post,
        onSuccess: () => {
            requestAnimationFrame(() => {
                document
                    .getElementById("comment-list-area")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        },
    });

    return (
        <section className="px-4 py-5">
            <div
                id="comment-list-area"
                className="mb-4 flex items-center justify-between gap-3"
            >
                <div>
                    <h2 className="text-card-foreground text-sm font-semibold">
                        Bình luận
                    </h2>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                        Tham gia thảo luận cùng cộng đồng.
                    </p>
                </div>

                {post && (
                    <span className="text-muted-foreground bg-muted rounded-full px-2.5 py-1 text-[11px] font-semibold">
                        {post.metrics.commentCount.toLocaleString("vi-VN")}
                    </span>
                )}
            </div>

            <div className="block max-h-[56vh] overflow-y-auto pr-1">
                {commentsError && comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="bg-destructive/10 text-destructive mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                            <AlertCircle size={24} />
                        </div>
                        <p className="text-foreground mb-1 text-sm font-semibold">
                            Không thể tải bình luận
                        </p>
                        <p className="text-muted-foreground max-w-80 text-xs leading-relaxed">
                            Đã xảy ra lỗi kết nối hoặc lỗi máy chủ. Vui lòng thử lại sau.
                        </p>
                    </div>
                ) : (
                    <div>
                        {isCommentsLoading && comments.length === 0 ? (
                            <div className="space-y-3">
                                <CommentItemSkeleton />
                                <CommentItemSkeleton />
                                <CommentItemSkeleton />
                            </div>
                        ) : (
                            <CommentList postId={post.id} comments={comments} />
                        )}
                    </div>
                )}

                {hasMore && isLoadingMore && !commentsError && (
                    <div className="mt-4 space-y-3">
                        <CommentItemSkeleton />
                        <CommentItemSkeleton />
                    </div>
                )}

                {hasMore && !commentsError && (
                    <div ref={loadMoreRef} className="flex justify-center py-4">
                        {isLoadingMore ? (
                            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                        ) : (
                            <span className="text-muted-foreground text-xs">
                                Cuộn để xem thêm
                            </span>
                        )}
                    </div>
                )}

                {!hasMore && comments.length > 0 && !commentsError && (
                    <p className="text-muted-foreground/50 py-4 text-center text-xs">
                        Đã tải hết bình luận
                    </p>
                )}
            </div>

            <div className="mt-5 pt-4">
                {currentUser ? (
                    <>
                        <CommentInput
                            author={currentUser}
                            fetchMentions={debouncedFetchMentions}
                            onSubmit={handleAddComment}
                        />
                        {isPending && (
                            <p className="text-muted-foreground mt-2 text-xs">
                                Đang gửi bình luận...
                            </p>
                        )}
                    </>
                ) : (
                    <div className="bg-primary/5 border-primary/15 flex flex-col items-center justify-between gap-3 rounded-xl border p-3 text-center sm:flex-row sm:px-4 sm:text-left">
                        <div>
                            <p className="text-foreground text-sm font-semibold">
                                Tham gia cuộc trò chuyện
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Đăng nhập để chia sẻ góc nhìn của bạn.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="w-full rounded-lg font-semibold sm:w-auto"
                        >
                            <Link href="/login">Đăng nhập</Link>
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}