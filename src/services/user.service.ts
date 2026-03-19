import { MOCK_USER_PROFILES } from "@/data/user";
import { ApiResponse } from "@/types/api";
import { UserProfile } from "@/types/user";

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
    return: true,
    message: "Tải bài viết thành công",
    statusCode: 200,
    data: data,
  };
};
