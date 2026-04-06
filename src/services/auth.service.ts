import { LoginRequest, LoginResponse } from "@/types/auth";
import http from "./http";
import { ApiResponse } from "@/types/common/api";
import Cookies from "js-cookie";
import { refresh } from "next/cache";

export const login = (
  loginRequest: LoginRequest,
): Promise<ApiResponse<LoginResponse>> => {
  return http.post("auth/login", loginRequest);
};

export const register = (
  registerRequest: LoginRequest,
): Promise<ApiResponse> => {
  return http.post("auth/register", registerRequest);
};

export const logout = () => {
  return http.post("auth/logout", {
    refreshToken: Cookies.get('refresh_token')
  })
}

const authService = {
  login,
  register,
};
export default authService;
