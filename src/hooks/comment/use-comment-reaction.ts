import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeComment, unlikeComment } from "@/services/comment.service";
import { Comment } from "@/types/comment";

export const useCommentReaction = (postId: string) => {
    const queryClient = useQueryClient();

    const invalidateRelated = (commentId: string) => {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        queryClient.invalidateQueries({ queryKey: ["replies", postId, commentId] });
    };

    const mutationLike = useMutation({
        mutationFn: likeComment,
        onSuccess: (_data, commentId) => invalidateRelated(commentId),
    });

    const mutationUnlike = useMutation({
        mutationFn: unlikeComment,
        onSuccess: (_data, commentId) => invalidateRelated(commentId),
    });

    const toggleLike = (comment: Comment) => {
        const mutation = comment.viewerContext.isLiked ? mutationUnlike : mutationLike;
        mutation.mutate(comment.id);
    };

    return { toggleLike };
};
