// lib/axios.ts
import { logout, setAccessToken } from '@/store/features/authSlice';
import { store } from '@/store/store';
import { sessionStorage } from '@/lib/cookie-storage-utils';
import axios, { AxiosResponse } from 'axios';

const http = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    withCredentials: true,
});

export const authHttp = axios.create({
    baseURL: '/api/auth',
    withCredentials: true,
});

// ─── Request Interceptor ───────────────────────────────────────
http.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (err) => Promise.reject(err),
);

let isRefreshing = false;
// Cập nhật lại kiểu dữ liệu của Queue: Lưu cả resolve và reject
let pendingRequests: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    pendingRequests.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    // Xóa hàng đợi
    pendingRequests = [];
};

http.interceptors.response.use(
    (res: AxiosResponse) => res.data,
    async (err) => {
        const originalRequest = err.config;
        const errorCode = err.response?.data?.ErrorCode;

        if (errorCode !== 'AUTH.ACCESS_TOKEN_INVALID' || originalRequest._retry) {
            return Promise.reject(err.response?.data || err);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingRequests.push({
                    resolve: (newToken: string) => {
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        resolve(http(originalRequest));
                    },
                    reject: (error: any) => {
                        reject(error);
                    }
                });
            });
        }

        // Bắt đầu lock cờ refresh
        isRefreshing = true;

        try {
            const res = await axios.post('/api/auth/refresh', null, {
                withCredentials: true,
            });

            const newAccessToken = res.data.data.accessToken;

            // Cập nhật Redux store
            store.dispatch(setAccessToken(newAccessToken));

            // Chạy lại toàn bộ request đang xếp hàng
            processQueue(null, newAccessToken);

            // Chạy lại request khởi xướng ban đầu
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return http(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError, null);

            store.dispatch(logout());
            sessionStorage.clearSession();
            window.location.href = '/login';

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export default http;