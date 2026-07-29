import { PaginatedData } from "@/types/common/api";
import { CreatePostRequest, Post, PostThumbnail } from "@/types/post";
import { ProfileTab } from "@/hooks/post/use-profile-posts";
import http from "@/lib/axios";

export const getFeedHome = async (
  cursor: string | null = null,
  limit: number = 5,
): Promise<PaginatedData<Post>> => {
  const response = await http.get("/posts", {
    params: {
      cursor,
      limit,
    },
  });
  return response.data;
};

export const getReelsFeed = async (
  cursor: string | null = null,
  limit: number = 5,
): Promise<PaginatedData<Post>> => {
  const response = await http.get("/posts/reels", {
    params: {
      cursor,
      limit,
    },
  });
  return response.data;
};

export const getPostsByUserId = async (
  userId: string,
  tab: ProfileTab = "Post",
  cursor: string | null = null,
  limit: number = 6,
): Promise<PaginatedData<PostThumbnail>> => {
  const response = await http.get(`/posts/users/${userId}`, {
    params: {
      type: tab,
      cursor,
      limit
    }
  });
  return response.data;
};

export const getPostById = async (
  postId: string,
): Promise<Post> => {
  const response = await http.get(`/posts/${postId}`);
  return response.data;
};

export const createPost = async (data: CreatePostRequest): Promise<Post> => {
  const response = await http.post("/posts", data);
  return response.data;
};

export const updatePost = async (postId: string, data: CreatePostRequest): Promise<Post> => {
  const response = await http.put(`/posts/${postId}`, data);
  return response.data;
};

export const deletePost = async (postId: string): Promise<Post> => {
  const response = await http.delete(`/posts/${postId}`);
  return response.data;
};

export const addReaction = async (postId: string, reactionType: number = 1): Promise<void> => {
  await http.put(`/posts/${postId}/reactions`, {
    reactionType
  });
};

export const removeReaction = async (postId: string): Promise<void> => {
  await http.delete(`/posts/${postId}/reactions`);
};

export const savePost = async (postId: string): Promise<void> => {
  await http.post(`/savedposts/${postId}`);
};

export const unsavePost = async (postId: string): Promise<void> => {
  await http.delete(`/savedposts/${postId}`);
};

export const checkSaved = async (postId: string): Promise<boolean> => {
  const response = await http.get(`/savedposts/${postId}/check`);
  return response.data;
};

export const getSavedPosts = async (
  cursor: string | null = null,
  limit: number = 20,
): Promise<PaginatedData<PostThumbnail>> => {
  const response = await http.get("/savedposts", {
    params: { cursor, limit },
  });
  return response.data;
};
