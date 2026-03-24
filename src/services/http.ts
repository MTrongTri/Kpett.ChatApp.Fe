import { tokenStorage } from "@/lib/cookie-storage-utils";
import { logout } from "@/store/features/authSlice";
import { store } from "@/store/store";
import axios, { AxiosResponse } from "axios";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// ─── Request Interceptor ───────────────────────────────────────
http.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

// ─── Response Interceptor ─────────────────────────────────────
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

http.interceptors.response.use(
  (res: AxiosResponse) => res.data,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.data?.ErrorCode === "AUTH.ACCESS_TOKEN_INVALID" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Nếu đang refresh rồi thì cho request vào hàng chờ
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(http(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();

        if (!refreshToken) throw new Error("No refresh token");

        // Gọi API refresh token
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          { refreshToken },
        );

        // Lưu token mới vào cookie
        tokenStorage.save(data.data.accessToken, data.data.refreshToken);

        // Gọi lại API lấy thông tin user mới nhất
        // const { data: userData } = await axios.get(
        //   `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        //   { headers: { Authorization: `Bearer ${data.accessToken}` } },
        // );

        // Dispatch lại → redux-persist reset cookie thêm 7 ngày
        // store.dispatch(
        //   setCredentials({
        //     user: userData,
        //     token: data,
        //     isProfileCompleted: userData.isProfileCompleted,
        //   }),
        // );

        // Cho các request đang chờ tiếp tục với token mới
        pendingRequests.forEach((cb) => cb(data.accessToken));
        pendingRequests = [];

        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        // Refresh token hết hạn → buộc logout
        pendingRequests = [];
        tokenStorage.clear();
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err.response?.data || err);
  },
);

export default http;
