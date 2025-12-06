// src/services/vdfService.js
import api from './api';

export const vdfService = {
  // ==================== Family Configuration ====================
  
  getAllFamilies: async (activeOnly = false) => {
    const response = await api.get(`/admin/vdf/families?activeOnly=${activeOnly}`);
    return response.data;
  },

  createFamilyConfig: async (data) => {
    const response = await api.post('/admin/vdf/families', data);
    return response.data;
  },

  updateFamilyConfig: async (id, data) => {
    const response = await api.put(`/admin/vdf/families/${id}`, data);
    return response.data;
  },

  // ==================== Contributions ====================
  
  recordContribution: async (data) => {
    const response = await api.post('/admin/vdf/contributions', data);
    return response.data;
  },

  getFamilyContributions: async (familyConfigId, year) => {
    const response = await api.get(
      `/admin/vdf/contributions/family/${familyConfigId}?year=${year || new Date().getFullYear()}`
    );
    return response.data;
  },

  getMonthlyContributionMatrix: async (year) => {
    const response = await api.get(
      `/admin/vdf/contributions/monthly-matrix?year=${year || new Date().getFullYear()}`
    );
    return response.data;
  },

  // ==================== Expenses ====================
  
  createExpense: async (data) => {
    const response = await api.post('/admin/vdf/expenses', data);
    return response.data;
  },

  getAllExpenses: async (page = 0, size = 20) => {
    const response = await api.get(`/admin/vdf/expenses?page=${page}&size=${size}`);
    return response.data;
  },

  getExpensesByCategory: async (categoryId) => {
    const response = await api.get(`/admin/vdf/expenses/category/${categoryId}`);
    return response.data;
  },

  getExpenseCategories: async () => {
    const response = await api.get('/admin/vdf/expense-categories');
    return response.data;
  },

  // ==================== Reports & Summary ====================
  
  getSummary: async () => {
    const response = await api.get('/admin/vdf/summary');
    return response.data;
  },

  getMonthlyReport: async (year) => {
    const response = await api.get(
      `/admin/vdf/reports/monthly?year=${year || new Date().getFullYear()}`
    );
    return response.data;
  },

  // ==================== Public APIs ====================
  
  getPublicSummary: async () => {
    const response = await api.get('/public/vdf/summary');
    return response.data;
  },

  getPublicExpenses: async (page = 0, size = 20) => {
    const response = await api.get(`/public/vdf/expenses?page=${page}&size=${size}`);
    return response.data;
  },

  getPublicMonthlyMatrix: async (year) => {
    const response = await api.get(
      `/public/vdf/contributions/monthly-matrix?year=${year || new Date().getFullYear()}`
    );
    return response.data;
  },

  // ==================== Member APIs ====================
  
  getMyContributions: async (year) => {
    const response = await api.get(
      `/member/vdf/my-contributions?year=${year || new Date().getFullYear()}`
    );
    return response.data;
  },

  getMyStatus: async () => {
    const response = await api.get('/member/vdf/my-status');
    return response.data;
  },
};