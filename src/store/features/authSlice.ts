import { Token } from "@/types/auth";
import { UserLoginResponse } from "@/types/response/user/user-login-response";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: UserLoginResponse | null;
  token: Token | null;
  isLoggedIn: boolean;
  isProfileCompleted: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
  isProfileCompleted: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: UserLoginResponse;
        token: Token;
        isLogedIn: boolean;
        isProfileCompleted: boolean;
      }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.isProfileCompleted = action.payload.isProfileCompleted;
    },
    completedProfile: (state) => {
      state.isProfileCompleted = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.isProfileCompleted = false;
    },
  },
});

export const { setCredentials, completedProfile, logout } = authSlice.actions;
export default authSlice.reducer;
