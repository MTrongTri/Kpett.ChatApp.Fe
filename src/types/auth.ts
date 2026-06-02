import { UserLoginResponse } from "./user";

// Token
export interface Token {
  accessToken: string;
  refreshToken: string;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
  deviceToken?: string;
  deviceType?: string;
}

export interface LoginResponse {
  user: UserLoginResponse;
  token: Token;
}

// Register
export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
}

export interface ForgotPasswordRequest {
	email: string;
}

export interface ResetPasswordRequest {
	email: string;
	otp: string;
	newPassword: string;
}
