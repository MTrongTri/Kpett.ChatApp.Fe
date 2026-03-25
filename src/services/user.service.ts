import { MOCK_USER_PROFILES } from "@/data/user";
import { ApiResponse } from "@/types/common/api";
import {
  CheckUsernameResponse,
  UserLoginResponse,
  UserProfile,
  UserStatsResponse,
} from "@/types/user";
import http from "./http";

export const getProfileUser = async (
  username: string,
): Promise<ApiResponse<UserProfile>> => {
  return http.get(`users/profile/${username}`);
};

export const getUserMentions = async (
  displayName: string,
): Promise<ApiResponse<UserProfile[]>> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  let data = [];

  if (!displayName.trim()) {
    data = MOCK_USER_PROFILES.slice(0, 5);
  } else {
    data = MOCK_USER_PROFILES.filter(
      (u) =>
        u.displayName.toLowerCase().includes(displayName.toLowerCase()) ||
        u.username.toLowerCase().includes(displayName.toLowerCase()),
    ).slice(0, 5);
  }

  return {
    isSuccess: true,
    message: "Tải bài viết thành công",
    statusCode: 200,
    data: data,
  };
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

export const getMyStats = async (): Promise<ApiResponse<UserStatsResponse>> => {
  return http.get("users/me/stats");
};
