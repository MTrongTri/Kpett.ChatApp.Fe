"use client";
import { useQuery } from "@tanstack/react-query";
import { getPostById } from "@/services/post.service";
import { Post } from "@/types/post";

type UsePostDetailOptions = {
  refetchOnMount?: boolean;
  staleTime?: number;
};

export function usePostDetail(
  postId: string | null,
  initialPost: Post | null,
  options: UsePostDetailOptions = {},
) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["post-detail", postId],
    queryFn: () => getPostById(postId!),
    enabled: !!postId,
    initialData: initialPost || undefined,
    refetchOnMount: options.refetchOnMount,
    staleTime: options.staleTime,
  });

  return {
    post: data,
    isPostLoading: isLoading && !initialPost,
    error,
  };
}
