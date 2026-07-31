// services/comment.service.ts
import http from "@/lib/axios";
import { Comment } from "@/types/comment";
import { PaginatedData } from "@/types/common/api";

export const addComment = async (
  postId: string,
  content: string,
  parentCommentId: string | null = null,
): Promise<Comment> => {
  const response = await http.post(`/comments/posts/${postId}`, {
    content,
    parentCommentId
  });
  return response.data;
};

export const updateComment = async (
  commentId: string,
  newContent: string
): Promise<Comment> => {
  const response = await http.put(`/comments/${commentId}`, {
    content: newContent
  });
  return response.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await http.delete(`/comments/${commentId}`);
};

export const likeComment = async (commentId: string): Promise<void> => {
    await http.put(`/comments/${commentId}/likes`);
};

export const unlikeComment = async (commentId: string): Promise<void> => {
    await http.delete(`/comments/${commentId}/likes`);
};

export const getCommentsByPostId = async (
  postId: string,
  parentCommentId: string | null,
  cursor: string | null = null,
  limit: number = 10,
): Promise<PaginatedData<Comment>> => {
  const response = await http.get(`/comments/posts/${postId}`, {
    params: {
      parentCommentId,
      cursor,
      limit
    }
  });
  return response.data;
};