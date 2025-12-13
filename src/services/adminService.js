import api from './api';

export const adminService = {
  // Members
  getAllMembers: async (search = '') => {
    const response = await api.get(`/admin/members${search ? `?search=${search}` : ''}`);
    return response.data;
  },

  getMemberById: async (id) => {
    const response = await api.get(`/admin/members/${id}`);
    return response.data;
  },

  createMember: async (memberData) => {
    const response = await api.post('/admin/members', memberData);
    return response.data;
  },

  updateMember: async (id, memberData) => {
    const response = await api.put(`/admin/members/${id}`, memberData);
    return response.data;
  },

  deactivateMember: async (id) => {
    const response = await api.delete(`/admin/members/${id}`);
    return response.data;
  },

  // NEW: Unblock member
  unblockMember: async (id) => {
    const response = await api.put(`/admin/members/${id}/unblock`);
    return response.data;
  },

  // Deposits
  getAllDeposits: async (status = 'ACTIVE', page = 0, size = 10) => {
    const response = await api.get(`/admin/deposits?status=${status}&page=${page}&size=${size}`);
    return response.data;
  },

  getDepositById: async (id) => {
    const response = await api.get(`/admin/deposits/${id}`);
    return response.data;
  },

  createDeposit: async (depositData) => {
    const response = await api.post('/admin/deposits', depositData);
    return response.data;
  },

  updateDeposit: async (id, depositData) => {
    const response = await api.put(`/admin/deposits/${id}`, depositData);
    return response.data;
  },

  returnDeposit: async (depositId, returnDate) => {
    const response = await api.put(`/admin/deposits/${depositId}/return`, { returnDate });
    return response.data;
  },

  // Loans
  getAllLoans: async (status = 'ACTIVE', page = 0, size = 10) => {
    const response = await api.get(`/admin/loans?status=${status}&page=${page}&size=${size}`);
    return response.data;
  },

  getLoanById: async (id) => {
    const response = await api.get(`/admin/loans/${id}`);
    return response.data;
  },

  createLoan: async (loanData) => {
    const response = await api.post('/admin/loans', loanData);
    return response.data;
  },

  updateLoan: async (id, loanData) => {
    const response = await api.put(`/admin/loans/${id}`, loanData);
    return response.data;
  },

  addLoanPayment: async (loanId, paymentData) => {
    const response = await api.post(`/admin/loans/${loanId}/payments`, paymentData);
    return response.data;
  },

  getLoanPaymentHistory: async (loanId) => {
    const response = await api.get(`/admin/loans/${loanId}/payments`);
    return response.data;
  },

  closeLoan: async (loanId, closureData) => {
    const response = await api.put(`/admin/loans/${loanId}/close`, closureData);
    return response.data;
  },

  // Reports
  getMemberStatement: async (memberId, year) => {
    const response = await api.get(`/admin/reports/members/${memberId}/statement${year ? `?year=${year}` : ''}`);
    return response.data;
  },

  getYearlySettlement: async (year) => {
    const response = await api.get(`/admin/reports/yearly-settlement${year ? `?year=${year}` : ''}`);
    return response.data;
  },

  // Session Management
  getAllActiveSessions: async () => {
    const response = await api.get('/admin/sessions');
    return response.data;
  },

  getSessionsForUser: async (userId, userType) => {
    const response = await api.get(`/admin/sessions/user/${userId}?userType=${userType}`);
    return response.data;
  },

  getSessionStats: async () => {
    const response = await api.get('/admin/sessions/stats');
    return response.data;
  },

  forceLogoutSession: async (sessionId) => {
    const response = await api.delete(`/admin/sessions/${sessionId}`);
    return response.data;
  },

  forceLogoutByToken: async (token) => {
    const response = await api.delete(`/admin/sessions/token/${token}`);
    return response.data;
  },

  forceLogoutAllForUser: async (userId, userType) => {
    const response = await api.delete(`/admin/sessions/user/${userId}?userType=${userType}`);
    return response.data;
  },

  // Document Management
  getDocumentCategories: async () => {
    const response = await api.get('/admin/documents/categories');
    return response.data;
  },

  uploadDocument: async (memberId, documentCategoryId, file, notes) => {
    const formData = new FormData();
    formData.append('memberId', memberId);
    formData.append('documentCategoryId', documentCategoryId);
    formData.append('file', file);
    if (notes) {
      formData.append('notes', notes);
    }
    const response = await api.post('/admin/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMemberDocuments: async (memberId) => {
    const response = await api.get(`/admin/documents/member/${memberId}`);
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await api.delete(`/admin/documents/${documentId}`);
    return response.data;
  }
};