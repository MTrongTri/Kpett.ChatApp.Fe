import { logout, setAccessToken } from '@/store/features/auth-slice';
import { store } from '@/store/store';
import { sessionStorage } from '@/lib/cookie-storage-utils';
import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '@/types/common/api';

const http = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    withCredentials: true,
});

export const authHttp = axios.create({
    baseURL: '/api/auth',
    withCredentials: true,
});

// Chuẩn hóa lỗi
const normalizeError = (err: any): ApiResponse => {
    // Nếu là lỗi do Backend trả về đúng format ApiResponse
    if (err.response?.data && typeof err.response.data === 'object') {
        return err.response.data as ApiResponse;
    }

    // 2. Nếu lỗi do đứt mạng (Network Error), Timeout, hoặc CORS
    const isNetworkError = err.message === 'Network Error';
    const isTimeout = err.code === 'ECONNABORTED';

    let fallbackMessage = "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.";
    let fallbackErrorCode = "UNKNOWN_ERROR";

    if (isNetworkError) {
        fallbackMessage = "Không có kết nối mạng. Vui lòng kiểm tra lại internet.";
        fallbackErrorCode = "NETWORK_ERROR";
    } else if (isTimeout) {
        fallbackMessage = "Kết nối đến máy chủ quá hạn. Vui lòng thử lại.";
        fallbackErrorCode = "TIMEOUT_ERROR";
    }

    return {
        isSuccess: false,
        statusCode: err.response?.status || 500,
        message: fallbackMessage,
        errorCode: fallbackErrorCode,
        data: null
    };
};

// Request Interceptor
http.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (err) => Promise.reject(normalizeError(err)),
);

let isRefreshing = false;
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
    pendingRequests = [];
};

// Response Interceptor
http.interceptors.response.use(
    (res: AxiosResponse) => res.data,
    async (err) => {
        const originalRequest = err.config;
        const errorCode = err.response?.data?.errorCode;

        // Kiểm tra xem có phải lỗi Token hết hạn để thực hiện refresh không
        if (errorCode === 'AUTH.ACCESS_TOKEN_INVALID' && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingRequests.push({
                        resolve: (newToken: string) => {
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                            resolve(http(originalRequest));
                        },
                        reject: (error: any) => {
                            reject(normalizeError(error));
                        }
                    });
                });
            }

            isRefreshing = true;

            try {
                const res = await axios.post('/api/auth/refresh', null, {
                    withCredentials: true,
                });

                const newAccessToken = res.data.data.accessToken;
                store.dispatch(setAccessToken(newAccessToken));
                processQueue(null, newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return http(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                store.dispatch(logout());
                sessionStorage.clearSession();
                window.location.href = '/login';

                return Promise.reject(normalizeError(refreshError));
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(normalizeError(err));
    },
);

export default http;