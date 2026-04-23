"use client";

import useSWR from "swr";
import { getPostById } from "@/services/post.service";
import { Post } from "@/types/post";

export function usePostDetail(postId: string | null, initialPost: Post | null) {
    const { data, isLoading, error } = useSWR(
        postId && !initialPost ? ["post-detail", postId] : null,
        ([_, id]) => getPostById(id).then(res => res.data)
    );

    return {
        post: initialPost || data,
        isPostLoading: !initialPost && isLoading,
        error,
    };
}