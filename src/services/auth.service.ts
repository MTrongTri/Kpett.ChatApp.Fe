import { authHttp } from "@/lib/axios";
import { LoginRequest, LoginResponse } from "@/types/auth";
import { ApiResponse } from "@/types/common/api";
import axios from "axios";

const login = (
  loginRequest: LoginRequest,
): Promise<ApiResponse<LoginResponse>> => {
  return authHttp.post("/login", loginRequest);

};

const register = (
  registerRequest: LoginRequest,
): Promise<ApiResponse> => {
  return authHttp.post("/register", registerRequest);
};

const logout = (accessToken: string) => {
  return authHttp.post('/logout', {}, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

const refreshToken = () => {
  return axios.post('/api/auth/refresh', null, { withCredentials: true });
}

const authService = {
  login,
  register,
  logout,
  refreshToken
};
export default authService;
