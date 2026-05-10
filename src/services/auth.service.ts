import { authHttp, refreshToken } from "@/lib/axios";
import { LoginRequest, LoginResponse } from "@/types/auth";
import axios from "axios";

/**
 * Đăng nhập hệ thống
 */
const login = async (
  loginRequest: LoginRequest,
): Promise<LoginResponse> => {
  const response = await authHttp.post("/login", loginRequest);
  return response.data;
};

/**
 * Đăng ký tài khoản mới
 */
const register = async (
  registerRequest: LoginRequest,
): Promise<any> => {
  const response = await authHttp.post("/register", registerRequest);
  return response.data;
};

/**
 * Đăng xuất và hủy token
 */
const logout = async (accessToken: string): Promise<any> => {
  const response = await authHttp.post('/logout', {}, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
}

/**
 * Làm mới Access Token bằng Refresh Token (HttpOnly Cookie)
 */
const refreshTokenMethod = async (): Promise<any> => {
  const token = await refreshToken();
  return { data: { accessToken: token } };
}

const authService = {
  login,
  register,
  logout,
  refreshToken: refreshTokenMethod
};

export default authService;