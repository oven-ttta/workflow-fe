import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from './types';
import Cookies from 'js-cookie';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      Cookies.set('token', response.data.token, { expires: 1 });
      Cookies.set('user', JSON.stringify(response.data), { expires: 1 });
    }
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      Cookies.set('token', response.data.token, { expires: 1 });
      Cookies.set('user', JSON.stringify(response.data), { expires: 1 });
    }
    return response.data;
  },

  logout() {
    Cookies.remove('token');
    Cookies.remove('user');
  },

  getCurrentUser(): AuthResponse | null {
    const userStr = Cookies.get('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('token');
  },

  getToken(): string | undefined {
    return Cookies.get('token');
  }
};
