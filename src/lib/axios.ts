import { setAccessToken } from '@/store/features/auth-slice';
import { persistor, store } from '@/store/store';
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
const normalizeError = (err: unknown): ApiResponse => {
    const responseData = axios.isAxiosError(err) ? err.response?.data : undefined;
    const statusCode = axios.isAxiosError(err) ? err.response?.status : undefined;
    const errorMessage = err instanceof Error ? err.message : undefined;
    const errorCode = axios.isAxiosError(err) ? err.code : undefined;

    // Nếu là lỗi do Backend trả về đúng format ApiResponse
    if (responseData && typeof responseData === 'object') {
        return responseData as ApiResponse;
    }

    // Nếu lỗi do đứt mạng (Network Error), Timeout, hoặc CORS
    const isNetworkError = errorMessage === 'Network Error';
    const isTimeout = errorCode === 'ECONNABORTED';

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
        statusCode: statusCode || 500,
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

let refreshPromise: Promise<string> | null = null;

export const restoreAccessTokenFromCookie = async (): Promise<string> => {
    const res = await axios.get('/api/auth/session', {
        withCredentials: true,
    });

    const accessToken = res.data.data.accessToken;
    if (!accessToken) {
        throw new Error('No access token in session');
    }
    store.dispatch(setAccessToken(accessToken));
    return accessToken;
};

export const refreshToken = async (): Promise<string> => {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = new Promise(async (resolve, reject) => {
        try {
            const res = await axios.post('/api/auth/refresh', null, {
                withCredentials: true,
            });

            const newAccessToken = res.data.data.accessToken;
            store.dispatch(setAccessToken(newAccessToken));
            resolve(newAccessToken);
        } catch (error) {
            persistor.purge();
            sessionStorage.clearSession();
            window.location.href = '/login';
            console.error(error)
            reject(error);
        } finally {
            refreshPromise = null;
        }
    });

    return refreshPromise;
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

            try {
                const newAccessToken = await refreshToken();
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return http(originalRequest);
            } catch (refreshError) {
                return Promise.reject(normalizeError(refreshError));
            }
        }

        return Promise.reject(normalizeError(err));
    },
);

authHttp.interceptors.response.use(
    (res: AxiosResponse) => res,
    (err) => Promise.reject(normalizeError(err)),
);

export default http;
