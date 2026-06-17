import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateComment, deleteComment } from "@/services/comment.service";
import { Comment } from "@/types/comment";

interface UseManageCommentProps {
    postId: string;
    commentId: string;
    onSuccess?: (updatedComment?: Comment) => void;
    onDeleteSuccess?: () => void;
}

export const useManageComment = ({ postId, commentId, onSuccess, onDeleteSuccess }: UseManageCommentProps) => {
    const queryClient = useQueryClient();

    const mutationUpdate = useMutation({
        mutationFn: (newContent: string) => updateComment(commentId, newContent),
        onSuccess: (response) => {
            if (response) {
                // Invalidate để tự đồng bộ lại ngầm cả danh sách comment & replies
                queryClient.invalidateQueries({ queryKey: ["comments", postId] });
                queryClient.invalidateQueries({ queryKey: ["replies", postId] });
                if (onSuccess) onSuccess(response);
            } else {
                toast.error("Không thể cập nhật bình luận");
            }
        }
    });

    const mutationDelete = useMutation({
        mutationFn: () => deleteComment(commentId),
        onSuccess: (response) => {
            if (response) {
                queryClient.invalidateQueries({ queryKey: ["comments", postId] });
                queryClient.invalidateQueries({ queryKey: ["replies", postId] });
                if (onDeleteSuccess) onDeleteSuccess();
            } else {
                toast.error("Không thể xóa bình luận");
            }
        }
    });

    const handleEditSubmit = async (newContent: string) => {
        await mutationUpdate.mutateAsync(newContent);
    }

    const handleDeleteSubmit = async () => {
        await mutationDelete.mutateAsync();
    }

    return { handleEditSubmit, handleDeleteSubmit };
};