import { useSWRConfig } from "swr";
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
    const { mutate: globalMutate } = useSWRConfig();

    const handleEditSubmit = async (newContent: string) => {
        const response = await updateComment(commentId, newContent);

        if (response.isSuccess && response.data) {
            const updatedComment = response.data;

            if (onSuccess) onSuccess(updatedComment);
            toast.success("Đã cập nhật bình luận");

            globalMutate(
                (key) => Array.isArray(key) && key[0] === "comments" && key[1] === postId,
                undefined,
                { revalidate: true }
            );
        } else {
            toast.error("Không thể cập nhật bình luận");
        }
    };

    const handleDeleteSubmit = async () => {
        const response = await deleteComment(commentId);

        if (response.isSuccess) {
            toast.success("Đã xóa bình luận");

            if (onDeleteSuccess) {
                onDeleteSuccess();
            }

            globalMutate(
                (key) => Array.isArray(key) && key[0] === "comments" && key[1] === postId,
                undefined,
                { revalidate: true }
            );
        } else {
            toast.error("Không thể xóa bình luận");
        }
    };

    return { handleEditSubmit, handleDeleteSubmit };
};