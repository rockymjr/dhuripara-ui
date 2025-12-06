import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    // Check for admin token first
    let token = localStorage.getItem('authToken');
    
    // If no admin token, check for member/operator token
    if (!token) {
      token = localStorage.getItem('memberToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect on login endpoints - let them handle the error
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (!isLoginRequest) {
        // Clear both tokens on 401 (for expired sessions)
        localStorage.removeItem('authToken');
        localStorage.removeItem('memberToken');
        localStorage.removeItem('memberId');
        localStorage.removeItem('memberName');
        localStorage.removeItem('isOperator');
        
        // Redirect based on which token was being used
        const wasOperator = localStorage.getItem('isOperator') === 'true';
        if (wasOperator) {
          window.location.href = '/login';
        } else {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;