import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Khởi tạo instance Axios dùng chung cho toàn bộ frontend PetHub
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Cho phép truyền và nhận Cookie HttpOnly (Refresh Token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor tự động gắn JWT Token vào mọi Request nếu đã đăng nhập
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pethub_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor chuẩn hóa dữ liệu Response trả về
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let msg = error.response?.data?.message;
    if (!msg) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        msg = 'Không thể kết nối đến máy chủ Backend (Port 5000). Vui lòng đảm bảo backend đang chạy.';
      } else {
        msg = error.message || 'Lỗi xử lý yêu cầu';
      }
    }
    const customError = {
      message: msg,
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };
    return Promise.reject(customError);
  }
);

export default api;
