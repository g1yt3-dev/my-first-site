
import { create } from 'zustand';
import { authService } from '../services/auth';
import { api } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  initAuth: () => {
    const token = api.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        set({ user: { username: payload.sub, email: payload.email } });
      } catch {
        // Token 无效，清除
        authService.logout();
      }
    }
  },

  register: async (registerData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(registerData);
      const user = response.data?.user || { username: registerData.username, email: registerData.email };
      set({ user, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  login: async (loginData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(loginData);
      const user = response.data?.user || { username: loginData.username };
      set({ user, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
