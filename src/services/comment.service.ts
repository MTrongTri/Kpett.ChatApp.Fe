import { MOCK_COMMENT } from "@/data/comment";
import http from "@/lib/axios";
import { Comment } from "@/types/comment";
import { ApiResponse, PaginatedData } from "@/types/common/api";
import { string } from "zod";

export const addComment = async (
  postId: string,
  content: string,
  parentCommentId: string | null = null,
): Promise<ApiResponse<Comment>> => {
  return http.post(`/comments/posts/${postId}`, {
    content,
    parentCommentId
  })
};

export const updateComment = async (commentId: string, newContent: string): Promise<ApiResponse<Comment>> => {
  return http.put(`/comments/posts/${commentId}`, {
    content: newContent
  })
};

export const deleteComment = async (commentId: string): Promise<ApiResponse<Comment>> => {
  return http.delete(`/comments/posts/${commentId}`)
};

export const getCommentsByPostId = async (
  postId: string,
  parentCommentId: string | null,
  cursor: string | null = null,
  limit: number = 10,
): Promise<ApiResponse<PaginatedData<Comment>>> => {
  return http.get(`/comments/posts/${postId}`, {
    params: {
      parentCommentId,
      cursor,
      limit
    }
  })
};