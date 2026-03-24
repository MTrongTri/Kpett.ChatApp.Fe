import { MOCK_USER_PROFILES } from "@/data/user";
import { ApiResponse } from "@/types/api";
import { CheckUsernameResponse } from "@/types/response/user/check-username-response";
import { UserProfile } from "@/types/user";
import http from "./http";

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
