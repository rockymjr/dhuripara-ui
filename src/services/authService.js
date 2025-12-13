import api from './api';

export const authService = {
  // Accept phone and pin for unified admin/operator/member login
  // Admin login: accept phone + password OR phone + pin (but we prefer password for ADMIN role)
  login: async (phone, pin, password) => {
    const body = { phone };
    if (password) body.password = password;
    if (pin) body.pin = pin;
    const response = await api.post('/admin/auth/login', body);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      // memberName is returned by MemberAuthResponse
      localStorage.setItem('username', response.data.memberName || response.data.username);
      // also set memberId and role for admin session
      if (response.data.memberId) localStorage.setItem('memberId', response.data.memberId);
      if (response.data.role) localStorage.setItem('userRole', response.data.role);
      if (typeof response.data.isOperator !== 'undefined') localStorage.setItem('isOperator', response.data.isOperator);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('memberId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isOperator');
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