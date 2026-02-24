import axios, { AxiosResponse } from 'axios'

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  //withCredentials: true,
})

// REQUEST INTERCEPTOR
http.interceptors.request.use(
  (config) => {
    // Lấy token
    const token = typeof window !== 'undefined' ? localStorage.getItem('access-token') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

// RESPONSE INTERCEPTOR
http.interceptors.response.use(
  (res: AxiosResponse) => res.data,
  err => Promise.reject(err.response?.data || err)
)

export default http
