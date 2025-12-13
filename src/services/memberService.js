import api from './api';

export const memberService = {
  login: async (phone, pin) => {
    const response = await api.post('/member/auth/login', { phone, pin });
    if (response.data.token) {
      localStorage.setItem('memberToken', response.data.token);
      localStorage.setItem('memberId', response.data.memberId);
      localStorage.setItem('memberName', response.data.memberName);
      localStorage.setItem('isOperator', response.data.isOperator || false);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('memberToken');
    localStorage.removeItem('memberId');
    localStorage.removeItem('memberName');
    localStorage.removeItem('isOperator');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('memberToken');
    return !!(token && token.trim().length > 0);
  },

  getMemberName: () => {
    return localStorage.getItem('memberName');
  },

  isOperator: () => {
    return localStorage.getItem('isOperator') === 'true';
  },

  clearAuth: () => {
    localStorage.removeItem('memberToken');
    localStorage.removeItem('memberId');
    localStorage.removeItem('memberName');
    localStorage.removeItem('isOperator');
  },

  getDashboard: async () => {
    const token = localStorage.getItem('memberToken');
    const response = await api.get('/member/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getVdfAccount: async () => {
    const token = localStorage.getItem('memberToken');
    const response = await api.get('/member/vdf/account', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  changePin: async (oldPin, newPin) => {
    const token = localStorage.getItem('memberToken');
    const response = await api.put('/member/change-pin',
      { oldPin, newPin },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  getFamilyDetails: async () => {
    const token = localStorage.getItem('memberToken');
    const response = await api.get('/member/family-details', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Documents
  getMyDocuments: async () => {
    const token = localStorage.getItem('memberToken');
    const response = await api.get('/member/documents/my-documents', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getFamilyDocuments: async () => {
    const token = localStorage.getItem('memberToken');
    const response = await api.get('/member/documents/family-documents', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  downloadDocument: async (documentId) => {
    const token = localStorage.getItem('memberToken');
    const response = await api.get(`/member/documents/${documentId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response.data;
  },

  getDocumentUrl: async (documentId) => {
    const token = localStorage.getItem('memberToken');
    const response = await api.get(`/member/documents/${documentId}/url`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};