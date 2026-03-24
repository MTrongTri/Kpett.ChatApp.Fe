import { ApiResponse } from "@/types/api";
import { LoginRequest, LoginResponse } from "@/types/auth";
import http from "./http";

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
