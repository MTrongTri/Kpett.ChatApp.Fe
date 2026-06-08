import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { addComment } from "@/services/comment.service";
import { toast } from "sonner";
import { ApiResponse, PaginatedData } from "@/types/common/api";
import { Comment } from "@/types/comment";
import { Post } from "@/types/post";

interface UseCreateCommentProps {
    post: Pick<Post, "id"> | null;
    onSuccess?: () => void;
}

export default function useCreateComment({ post, onSuccess }: UseCreateCommentProps) {
    const queryClient = useQueryClient();

    const { mutate: handleAddComment, isPending } = useMutation<Comment, ApiResponse, string>({
        mutationFn: (content: string) => {
            if (!post) throw new Error("Không tìm thấy bài viết");
            return addComment(post.id, content, null);
        },
        onSuccess: () => {
            const postId = post!.id;

            // Cập nhật cache cho Post Detail
            queryClient.setQueryData(["post-detail", postId], (oldData: Post | undefined) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    metrics: {
                        ...oldData.metrics,
                        commentCount: (oldData.metrics.commentCount || 0) + 1
                    },
                };
            });

            // Cập nhật cache cho các danh sách Infinite Query (Feed, Profile, Search...)
            queryClient.setQueriesData<InfiniteData<PaginatedData<Post>>>(
                { queryKey: ["feed"] },
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => ({
                            ...page,
                            items: page.items.map((item) =>
                                item.id === postId
                                    ? {
                                        ...item,
                                        metrics: {
                                            ...item.metrics,
                                            commentCount: (item.metrics.commentCount || 0) + 1
                                        }
                                    }
                                    : item
                            ),
                        })),
                    };
                }
            );

            // Vẫn nên invalidate list comment để hiển thị comment mới vừa thêm
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });

            toast.success("Thêm bình luận thành công");
            if (onSuccess) onSuccess();
        },
        onError: (error) => {
            if (error.statusCode < 500) {
                toast.error(error.message || "Không thể thêm bình luận.");
            }
        }
    });

    return { handleAddComment, isPending };
}
