import { getFriendsWithFilter } from "@/services/friend.service";
import { deletePost } from "@/services/post.service";
import { closePostLightBox, openPostEditorModal } from "@/store/features/modal-slice";
import { PaginatedData } from "@/types/common/api";
import { Post } from "@/types/post";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

export const usePostMenuActions = (post: Post | null) => {
    const dispatch = useDispatch();

    const queryClient = useQueryClient();

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

                queryClient.setQueriesData<InfiniteData<PaginatedData<Post>>>(
                    { queryKey: ["posts-profile", post.author.id, post.type] },
                    (oldData) => {
                        if (!oldData) return oldData;

                        return {
                            ...oldData,
                            pages: oldData.pages.map((page) => ({
                                ...page,
                                items: page.items.filter((item) => item.id != post.id)
                            })),
                        };
                    }
                );

                dispatch(closePostLightBox());

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
            return response.items
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