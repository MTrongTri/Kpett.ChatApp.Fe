import http from "@/lib/axios";
import { PaginatedData } from "@/types/common/api";
import { Media } from "@/types/media";
import {
  BaseUser,
  CheckUsernameResponse,
  UserGeneralInfo,
  UserLoginResponse,
  UserProfile,
  UserWithStats,
} from "@/types/user";

export const getMyProfile = async (): Promise<UserProfile> => {
  const res = await http.get("users/me");
  return res.data;
};

export const getUserProfile = async (
  username: string,
): Promise<UserProfile> => {
  const res = await http.get(`users/profile/${username}`);
  return res.data;
};


export const checkUsername = async (
  username: string,
): Promise<CheckUsernameResponse> => {
  const res = await http.get("users/check-username", {
    params: { username },
  });

  return res.data;
};

export const accountSetup = async ({
  username,
  displayName,
  biography,
  interests,
}: {
  username: string;
  displayName: string;
  biography: string;
  interests: string[];
}): Promise<UserLoginResponse> => {
  const res = await http.post("users/account-setup", {
    username,
    displayName,
    biography,
    interests,
  });

  return res.data;
};

export const getMyStats = async (): Promise<UserWithStats> => {
  const response = await http.get("users/me/stats");
  return response.data;
};

export const updateUserGeneralInfo = async (
  generalInfo: Partial<UserGeneralInfo>
): Promise<UserGeneralInfo> => {
  const response = await http.put("users/me", { ...generalInfo });
  return response.data;
};

export const updateUserMedia = async (media: Media, mediaType: 'Avatar' | 'Cover') => {
  const response = await http.put(`users/me/media?mediaType=${mediaType}`, media);
  return response.data;
};

export const deleteUserMediaPrimary = async (mediaType: 'Avatar' | 'Cover') => {
  const response = await http.delete(`users/me/media/primary?mediaType=${mediaType}`);
  return response.data;
};

export const searchUsers = async (
  keyword: string,
  limit: number = 20,
  cursor?: string
): Promise<PaginatedData<BaseUser>> => {
  const response = await http.get(`users/search`, {
    params: { keyword, limit, cursor },
  });
  return response.data;
}