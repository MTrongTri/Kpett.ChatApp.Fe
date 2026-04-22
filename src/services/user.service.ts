import { MOCK_USER_PROFILES } from "@/data/user";
import http from "@/lib/axios";
import { ApiResponse } from "@/types/common/api";
import { Media } from "@/types/media";
import {
  CheckUsernameResponse,
  UserGeneralInfo,
  UserLoginResponse,
  UserProfile,
  UserWithStats,
} from "@/types/user";

export const getMyProfile = async (): Promise<ApiResponse<UserProfile>> => {
  return http.get("users/me");
};

export const getUserProfile = async (
  username: string,
): Promise<ApiResponse<UserProfile>> => {
  return http.get(`users/profile/${username}`);
};


export const checkUsername = async (
  username: string,
): Promise<ApiResponse<CheckUsernameResponse>> => {
  return http.get("users/check-username", {
    params: { username },
  });
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
}): Promise<ApiResponse<UserLoginResponse>> => {
  return http.post("users/account-setup", {
    username,
    displayName,
    biography,
    interests,
  });
};

export const getMyStats = async (): Promise<ApiResponse<UserWithStats>> => {
  return http.get("users/me/stats");
};

export const updateUserGeneralInfo = async (generalInfo: Partial<UserGeneralInfo>): Promise<ApiResponse<UserGeneralInfo>> => {
  return http.put("users/me", { ...generalInfo });
};

export const updateUserMedia = async (media: Media, mediaType: 'Avatar' | 'Cover') => {
  return await http.put(`users/me/media?mediaType=${mediaType}`, media);
};

export const deleteUserMediaPrimary = async (mediaType: 'Avatar' | 'Cover') => {
  return await http.delete(`users/me/media/primary?mediaType=${mediaType}`);
};