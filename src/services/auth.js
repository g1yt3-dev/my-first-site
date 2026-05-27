
import { api } from './api';

export const authService = {
  async register(registerData) {
    const response = await api.post('/auth/register', registerData);
    if (response.data?.token) {
      api.setToken(response.data.token);
    }
    return response;
  },

  async login(loginData) {
    const response = await api.post('/auth/login', loginData);
    if (response.data?.token) {
      api.setToken(response.data.token);
    }
    return response;
  },

  logout() {
    api.setToken(null);
  },

  isAuthenticated() {
    return !!api.getToken();
  },
};
