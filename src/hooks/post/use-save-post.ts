"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savePost, unsavePost, checkSaved } from "@/services/post.service";
import { toast } from "sonner";

export function useCheckSaved(postId: string) {
  return useQuery({
    queryKey: ["saved", postId],
    queryFn: () => checkSaved(postId),
    enabled: !!postId,
    staleTime: 30_000,
  });
}

export function useSavePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => savePost(postId),
    onSuccess: () => {
      queryClient.setQueryData(["saved", postId], true);
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      toast.success("Đã lưu bài viết");
    },
    onError: () => {
      toast.error("Không thể lưu bài viết");
    },
  });
}

export function useUnsavePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unsavePost(postId),
    onSuccess: () => {
      queryClient.setQueryData(["saved", postId], false);
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      toast.success("Đã bỏ lưu bài viết");
    },
    onError: () => {
      toast.error("Không thể bỏ lưu bài viết");
    },
  });
}
