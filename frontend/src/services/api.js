import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Khởi tạo instance Axios dùng chung
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor xử lý Request trước khi gửi
api.interceptors.request.use(
  (config) => {
    // Có thể bổ sung Authorization header (JWT token) tại đây khi cần
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor chuẩn hóa dữ liệu Response trả về
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "Không thể kết nối đến máy chủ",
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };
    return Promise.reject(customError);
  },
);

export default api;
