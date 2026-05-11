"use client";
import { useQuery } from "@tanstack/react-query";
import { getPostById } from "@/services/post.service";
import { Post } from "@/types/post";

export function usePostDetail(postId: string | null, initialPost: Post | null) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["post-detail", postId],
        queryFn: () => getPostById(postId!),
        enabled: !!postId,
        initialData: initialPost || undefined,
    });

    return {
        post: data,
        isPostLoading: isLoading && !initialPost,
        error,
    };
}