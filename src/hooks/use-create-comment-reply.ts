import { addComment } from "@/services/comment.service";
import { Comment } from "@/types/comment";
import { useCallback } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface UseCreateReplyProps {
    postId: string;
    commentId: string;
    submitParentId: string;
    localMutate: any;
    onReplySuccess?: (newReply: Comment, isDirectChild: boolean) => void;
}

export const useCreateCommentReply = ({
    postId,
    commentId,
    submitParentId,
    localMutate,
    onReplySuccess,
}: UseCreateReplyProps) => {
    const { mutate: globalMutate } = useSWRConfig();

    const updateLocalCache = useCallback((newReply: Comment) => {
        localMutate((currentPages: any) => {
            if (!currentPages || currentPages.length === 0) {
                return [{ data: { items: [newReply], pagination: { hasMore: false, nextCursor: null } } }];
            }
            const newPages = [...currentPages];
            const lastIdx = newPages.length - 1;
            newPages[lastIdx] = {
                ...newPages[lastIdx],
                data: {
                    ...newPages[lastIdx].data,
                    items: [...(newPages[lastIdx].data?.items || []), newReply],
                },
            };
            return newPages;
        }, { revalidate: false });
    }, [localMutate]);

    const handleReplySubmit = async (content: string) => {
        const response = await addComment(postId, content, submitParentId);

        if (response.isSuccess && response.data) {
            const newReply = response.data;
            const isDirectChild = commentId === submitParentId;

            // 1. Cập nhật Cache SWR
            if (isDirectChild) {
                updateLocalCache(newReply);
            }

            toast.success("Đã gửi câu trả lời");

            globalMutate(
                (key) => Array.isArray(key) && key[0] === "replies" && key[1] === postId,
                undefined,
                { revalidate: true }
            );

            //  Trả kết quả về cho UI Component tự xử lý đóng Form và thêm vào mảng tạm
            if (onReplySuccess) {
                onReplySuccess(newReply, isDirectChild);
            }
        } else {
            toast.error("Đã có lỗi xảy ra");
        }
    };

    return { handleReplySubmit, updateLocalCache };
};