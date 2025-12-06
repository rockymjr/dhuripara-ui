import api from './api';

export const publicService = {
  getSummary: async () => {
    const response = await api.get('/public/summary');
    return response.data;
  },

  getDeposits: async (page = 0, size = 10) => {
    const response = await api.get(`/public/deposits?page=${page}&size=${size}`);
    return response.data;
  },

  getLoans: async (page = 0, size = 10) => {
    const response = await api.get(`/public/loans?page=${page}&size=${size}`);
    return response.data;
  }
};