import api from './api';

export interface UserProfile {
  user_id: number;
  role_id: number;
  role_name: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export const authService = {
  // Đăng ký tài khoản hội viên
  register: async (data: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }): Promise<AuthResponse> => {
    const res: any = await api.post('/auth/register', data);
    if (res.data?.token) {
      localStorage.setItem('pethub_token', res.data.token);
      localStorage.setItem('pethub_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  // Đăng nhập tài khoản
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res: any = await api.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('pethub_token', res.data.token);
      localStorage.setItem('pethub_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  // Lấy thông tin cá nhân hiện tại
  getProfile: async (): Promise<UserProfile> => {
    const res: any = await api.get('/auth/profile');
    if (res.data) {
      localStorage.setItem('pethub_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res: any = await api.put('/auth/profile', data);
    if (res.data) {
      localStorage.setItem('pethub_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  // Đổi mật khẩu
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Tái cấp Access Token mới từ HttpOnly Cookie Refresh Token
  refreshToken: async (): Promise<string | null> => {
    try {
      const res: any = await api.post('/auth/refresh-token');
      if (res.data?.accessToken) {
        localStorage.setItem('pethub_token', res.data.accessToken);
        return res.data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Đăng xuất (xóa Token cục bộ và xóa Cookie HttpOnly phía server)
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout server notification error:', e);
    }
    localStorage.removeItem('pethub_token');
    localStorage.removeItem('pethub_user');
  },

  // Kiểm tra trạng thái đăng nhập
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('pethub_token');
  },

  // Lấy thông tin user đã lưu
  getCurrentUser: (): UserProfile | null => {
    const saved = localStorage.getItem('pethub_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },
};

export default authService;
