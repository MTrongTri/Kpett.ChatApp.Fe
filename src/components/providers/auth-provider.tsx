'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { setAccessToken, logout as logoutAction, setCredentials } from '@/store/features/auth-slice';
import axios from 'axios';
import { sessionStorage } from '@/lib/cookie-storage-utils';
import Logo from '../layouts/main/logo';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { BaseUser } from '@/types/user';
import Cookies from 'js-cookie'; // Thêm js-cookie nếu bạn dùng nó như file SignalR

interface AuthContextType {
    isLoading: boolean;
    isAuthenticated: boolean;
    accessToken: string | null;
    user: BaseUser | null;
    login: (token: string, userData: BaseUser, isProfileCompleted: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { accessToken, user, isLoggedIn } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(() => {
        if (typeof window !== 'undefined') {
            const hasSession = Cookies.get('isLoggedIn') === 'true';
            return hasSession;
        }
        return false;
    });

    const logout = useCallback(() => {
        dispatch(logoutAction());
        sessionStorage.clearSession();
    }, [dispatch]);

    const login = useCallback((token: string, userData: BaseUser, isProfileCompleted: boolean) => {
        dispatch(setCredentials({
            user: userData,
            accessToken: token,
            isProfileCompleted
        }));

        sessionStorage.setSession({ isProfileCompleted: isProfileCompleted });
    }, [dispatch]);

    useEffect(() => {
        const initializeAuth = async () => {
            if (!isLoggedIn) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.post(
                    '/api/auth/refresh',
                    null,
                    { withCredentials: true }
                );
                const newAccessToken = response.data.data.accessToken;
                dispatch(setAccessToken(newAccessToken));
            } catch (error) {
                console.error("Auth Init Error:", error);
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, [isLoggedIn, dispatch, logout]);

    const value = useMemo(() => ({
        isLoading,
        isAuthenticated: !!accessToken,
        accessToken,
        user,
        login,
        logout
    }), [isLoading, accessToken, user, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {isLoading ? (
                <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
                    <Logo className="text-5xl mb-4 animate-pulse" />
                    <div className="flex space-x-2">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary"></span>
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
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};