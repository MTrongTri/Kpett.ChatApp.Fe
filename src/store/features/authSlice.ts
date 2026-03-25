import { Token } from "@/types/auth";
import { UserLoginResponse } from "@/types/user-login-response";
import { BaseUser } from "@/types/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: BaseUser | null;
  isLoggedIn: boolean;
  isProfileCompleted: boolean;
}

const initialState: AuthState = {
  user: null,
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
        user: BaseUser;
        isLogedIn: boolean;
        isProfileCompleted: boolean;
      }>,
    ) => {
      state.user = action.payload.user;
      state.isLoggedIn = true;
      state.isProfileCompleted = action.payload.isProfileCompleted;
    },
    completedProfile: (state) => {
      state.isProfileCompleted = true;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.isProfileCompleted = false;
    },
  },
});

export const { setCredentials, completedProfile, logout } = authSlice.actions;
export default authSlice.reducer;
