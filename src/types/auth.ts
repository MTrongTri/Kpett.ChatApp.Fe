export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
  deviceToken?: string;
  deviceType?: string;
}

export interface LoginResponse {
  displayName: string | null;
  avatarUrl: string | null;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  issuedAt: string; 
  expiresAt: string;
}