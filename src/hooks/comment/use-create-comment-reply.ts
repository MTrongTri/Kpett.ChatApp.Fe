import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addComment } from "@/services/comment.service";
import { Comment } from "@/types/comment";
import { ApiResponse } from "@/types/common/api";
import { toast } from "sonner";

interface UseCreateReplyProps {
    postId: string;
    commentId: string;
    submitParentId: string;
    onReplySuccess?: (newReply: Comment, isDirectChild: boolean) => void;
}

export const useCreateCommentReply = ({
    postId,
    commentId,
    submitParentId,
    onReplySuccess,
}: UseCreateReplyProps) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<Comment, ApiResponse, string>({
        mutationFn: (content: string) => addComment(postId, content, submitParentId),
        onSuccess: (response) => {
            if (response) {
                const newReply = response;
                const isDirectChild = commentId === submitParentId;

                // Tự động fetch lại danh sách replies của nhánh bình luận hiện tại
                // Dùng exact: false (mặc định) sẽ làm mới tất cả các page của danh sách replies này
                queryClient.invalidateQueries({
                    queryKey: ["replies", postId, submitParentId]
                });

                // Làm mới luôn danh sách comment gốc để cập nhật lại số lượng replyCount
                queryClient.invalidateQueries({
                    queryKey: ["comments", postId]
                });

                // Trả kết quả về cho UI Component (như clear form, đóng input...)
                if (onReplySuccess) {
                    onReplySuccess(newReply, isDirectChild);
                }
            } else {
                toast.error("Có lỗi xảy ra khi gửi phản hồi");
            }
        },
        onError: (error) => {
            console.error("Lỗi khi gửi reply:", error);
            if (error.statusCode < 500) {
                toast.error(error.message || "Không thể gửi phản hồi.");
            }
        }
    });

    const handleReplySubmit = async (content: string) => {
        await mutation.mutateAsync(content);
    };

    return { handleReplySubmit };
};