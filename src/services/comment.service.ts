import { MOCK_COMMENT } from "@/data/comment";
import { Comment } from "@/types/comment";
import { ApiResponse, PaginatedData } from "@/types/common/api";
import http from "./http";

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