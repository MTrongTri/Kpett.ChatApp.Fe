import { BaseUser } from '@/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: BaseUser | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isProfileCompleted: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoggedIn: false,
  isProfileCompleted: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: BaseUser;
        accessToken: string | null;
        isProfileCompleted: boolean;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isLoggedIn = true;
      state.isProfileCompleted = action.payload.isProfileCompleted;
    },

    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },

    completedProfile: (state) => {
      state.isProfileCompleted = true;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      state.isProfileCompleted = false;
    },
  },
});

export const { setCredentials, setAccessToken, completedProfile, logout } =
  authSlice.actions;
export default authSlice.reducer;