import http, { authHttp, refreshToken } from "@/lib/axios";
import { ForgotPasswordRequest, LoginRequest, LoginResponse, RegisterRequest, ResetPasswordRequest } from "@/types/auth";

/**
 * Đăng nhập hệ thống
 */
const login = async (loginRequest: LoginRequest): Promise<LoginResponse> => {
  const response = await authHttp.post("/login", loginRequest);
  return response.data;
};

/**
 * Đăng ký tài khoản mới
 */
const register = async (
  registerRequest: Omit<RegisterRequest, "username">,
): Promise<unknown> => {
  const response = await http.post("auth/register", registerRequest);
  return response.data;
};

/**
 * Đăng xuất và hủy token
 */
const logout = async (accessToken: string): Promise<{ success: boolean }> => {
  const response = await authHttp.post(
    "/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data;
};

/**
 * Làm mới Access Token bằng Refresh Token (HttpOnly Cookie)
 */
const refreshTokenMethod = async (): Promise<{
  data: { accessToken: string };
}> => {
  const token = await refreshToken();
  return { data: { accessToken: token } };
};

/**
 * Gửi email OTP để đặt lại mật khẩu
 */
const forgotPassword = async (
  forgotPasswordRequest: ForgotPasswordRequest,
): Promise<unknown> => {
  const response = await authHttp.post("/forgot-password", forgotPasswordRequest);
  return response.data;
};

/**
 * Đặt lại mật khẩu với OTP
 */
const resetPassword = async (
  resetPasswordRequest: ResetPasswordRequest,
): Promise<unknown> => {
  const response = await authHttp.post("/reset-password", resetPasswordRequest);
  return response.data;
};

const authService = {
  login,
  register,
  logout,
  refreshToken: refreshTokenMethod,
  forgotPassword,
  resetPassword,
};

export default authService;
