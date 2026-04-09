// hooks/use-post-actions.ts
import { getFriendsWithFilter } from "@/services/friend.service";
import { deletePost } from "@/services/post.service";
import { useState } from "react";
import { toast } from "sonner";

export const usePostActions = (post: any, onClose: () => void) => {
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [postModalMode, setPostModalMode] = useState<"create" | "edit">("edit");
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    const handleEditClick = () => {
        if (post) {
            setPostModalMode("edit");
            setSelectedPostId(post.id);
            setIsPostModalOpen(true);
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
        isPostModalOpen,
        setIsPostModalOpen,
        postModalMode,
        selectedPostId,
        handleEditClick,
        handleDelete,
        fetchMentions
    };
};