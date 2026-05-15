"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  logout as logoutAction,
  setCredentials,
} from "@/store/features/auth-slice";
import { refreshToken } from "@/lib/axios";
import { sessionStorage } from "@/lib/cookie-storage-utils";
import Logo from "../layouts/main/logo";
import { useDispatch, useSelector } from "react-redux";
import { persistor, RootState } from "@/store/store";
import { BaseUser } from "@/types/user";
import Cookies from "js-cookie";

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  user: BaseUser | null;
  login: (
    token: string,
    userData: BaseUser,
    isProfileCompleted: boolean,
  ) => void;
  logout: (options?: LogoutOptions) => Promise<void>;
}

type LogoutOptions = {
  redirectTo?: string;
  replace?: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user, isLoggedIn } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const hasSession = Cookies.get("isLoggedIn") === "true";
      return hasSession;
    }
    return false;
  });

  const logout = useCallback(
    async ({ redirectTo, replace = true }: LogoutOptions = {}) => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
          credentials: "include",
        });
      } catch (error) {
        console.error("Logout API Error:", error);
      } finally {
        await persistor.purge();
        sessionStorage.clearSession();

        if (redirectTo && typeof window !== "undefined") {
          if (replace) {
            window.location.replace(redirectTo);
          } else {
            window.location.assign(redirectTo);
          }

          return;
        }

        dispatch(logoutAction());
      }
    },
    [accessToken, dispatch],
  );

  const login = useCallback(
    (token: string, userData: BaseUser, isProfileCompleted: boolean) => {
      dispatch(
        setCredentials({
          user: userData,
          accessToken: token,
          isProfileCompleted,
        }),
      );

      sessionStorage.setSession({ isProfileCompleted: isProfileCompleted });
    },
    [dispatch],
  );

  useEffect(() => {
    const initializeAuth = async () => {
      if (!isLoggedIn) {
        setIsLoading(false);
        return;
      }

      try {
        await refreshToken();
      } catch (error) {
        console.error("Auth Init Error:", error);
        await persistor.purge();
        sessionStorage.clearSession();
        window.location.href = "/login";
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isLoggedIn, dispatch]);

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated: !!accessToken,
      accessToken,
      user,
      login,
      logout,
    }),
    [isLoading, accessToken, user, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="bg-background flex h-screen w-full flex-col items-center justify-center">
          <Logo className="mb-4 animate-pulse text-5xl" />
          <div className="flex space-x-2">
            <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></span>
            <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></span>
            <span className="bg-primary h-2 w-2 animate-bounce rounded-full"></span>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
