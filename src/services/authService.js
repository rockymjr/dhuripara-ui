import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/admin/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('username', response.data.username);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!(token && token.trim().length > 0);
  },

  getUsername: () => {
    return localStorage.getItem('username');
  },

  clearAuth: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
  }
};