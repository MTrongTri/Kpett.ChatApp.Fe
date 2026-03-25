import { LoginRequest, LoginResponse } from "@/types/auth";
import http from "./http";
import { ApiResponse } from "@/types/common/api";

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

const authService = {
  login,
  register,
};
export default authService;
