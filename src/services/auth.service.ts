import { ApiResponse } from "@/types/api";
import { LoginRequest, LoginResponse } from "@/types/auth";
import http from "./http";

export const login = (loginRequest: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return http.post('auth/login', loginRequest);
}

const authService = {
    login
}
export default authService;