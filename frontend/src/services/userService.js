import api from "./api";

/**
 * UserService (Tầng Service trên Frontend)
 * Chịu trách nhiệm gọi API liên quan tới User từ Backend
 */
export const userService = {
  // Lấy toàn bộ danh sách users
  getAll: async () => {
    const response = await api.get("/users");
    return response.data || [];
  },

  // Lấy chi tiết user theo ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Tạo user mới
  create: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Cập nhật thông tin user
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Xóa user
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Kiểm tra tình trạng backend API
  checkHealth: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};

export default userService;
