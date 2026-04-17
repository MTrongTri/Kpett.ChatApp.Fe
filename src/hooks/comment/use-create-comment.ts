import { addComment } from "@/services/comment.service";
import { toast } from "sonner";

interface UseCreateCommentProps {
    post: { id: string;[key: string]: any } | null;
    localMutate: any;
    onSuccess?: () => void;
}

export const useCreateComment = ({ post, localMutate, onSuccess }: UseCreateCommentProps) => {
    const handleAddComment = async (content: string) => {
        if (!post) {
            toast.error("Không tìm thấy bài viết");
            return;
        }

        const res = await addComment(post.id, content, null);

        if (res.isSuccess && res.data) {
            const newComment = res.data;

            // Cập nhật danh sách comment của bài viết
            localMutate((currentPages: any) => {
                if (!currentPages || currentPages.length === 0) {
                    return [{ data: { items: [newComment], pagination: { hasMore: false, nextCursor: null } } }];
                }
                const newPages = [...currentPages];
                const lastIdx = newPages.length - 1;
                newPages[lastIdx] = {
                    ...newPages[lastIdx],
                    data: {
                        ...newPages[lastIdx].data,
                        items: [...(newPages[lastIdx].data?.items || []), newComment],
                    },
                };
                return newPages;
            }, { revalidate: false });

            toast.success("Thêm bình luận thành công");

            if (onSuccess) onSuccess();
        } else {
            toast.error("Đã có lỗi xảy ra");
        }
    };

    return { handleAddComment };
};