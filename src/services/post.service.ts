import { ApiResponse, PaginatedData } from "@/types/common/api";
import { CreatePostRequest, Post, PostThumbnail } from "@/types/post";
import { ProfileTab } from "@/hooks/post/use-profile-posts";
import http from "@/lib/axios";

export const getFeedHome = async (
  cursor: string | null = null,
  limit: number = 5,
): Promise<ApiResponse<PaginatedData<Post>>> => {
  return http.get("/posts", {
    params: {
      cursor,
      limit,
    },
  });
};

export const getPostsByUserId = async (
  userId: string,
  tab: ProfileTab = "Post",
  cursor: string | null = null,
  limit: number = 6,
): Promise<ApiResponse<PaginatedData<PostThumbnail>>> => {
  return http.get(`/posts/users/${userId}`, {
    params: {
      type: tab,
      cursor,
      limit
    }
  })
};

export const getPostById = async (
  postId: string,
): Promise<ApiResponse<Post>> => {
  return http.get(`/posts/${postId}`)
};

export const createPost = (data: CreatePostRequest): Promise<ApiResponse<Post>> => {
  return http.post("/posts", data);

}

export const updatePost = (postId: string, data: CreatePostRequest): Promise<ApiResponse<Post>> => {
  return http.put(`/posts/${postId}`, data);
}

export const deletePost = (postId: string): Promise<ApiResponse<Post>> => {
  return http.delete(`/posts/${postId}`);
}