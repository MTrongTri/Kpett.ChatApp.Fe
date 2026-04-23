import { getFriendsWithFilter } from "@/services/friend.service";
import { deletePost } from "@/services/post.service";
import { openPostEditorModal } from "@/store/features/modal-slice";
import { Post } from "@/types/post";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

export const usePostActions = (post: Post | null, onClose: () => void) => {
    const dispatch = useDispatch();

    const handleEditClick = () => {
        if (post) {
            dispatch(openPostEditorModal({ mode: "edit", postId: post.id }));
        }
    };

    const handleDelete = async () => {
        try {
            if (post) {
                await deletePost(post.id);
                toast.success("Xóa thành công");
                onClose();
                return;
            }
            toast.error("Đã có lỗi xảy ra");
        } catch {
            toast.error("Đã có lỗi xảy ra");
        }
    };

    const fetchMentions = async (query: string) => {
        try {
            const response = await getFriendsWithFilter({ search: query, cursor: null, limit: 20 });
            return response.isSuccess && response.data ? response.data.items : [];
        } catch (error) {
            console.error("Lỗi tải mention:", error);
            return [];
        }
    };

    return {
        handleEditClick,
        handleDelete,
        fetchMentions
    };
};