import { MOCK_USER_PROFILES } from "@/data/user";
import http from "@/lib/axios";
import { ApiResponse } from "@/types/common/api";
import {
  CheckUsernameResponse,
  UserLoginResponse,
  UserProfile,
  UserStatsResponse,
} from "@/types/user";

export const getProfileUser = async (
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

export const getMyStats = async (): Promise<ApiResponse<UserStatsResponse>> => {
  return http.get("users/me/stats");
};
