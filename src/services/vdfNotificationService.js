// src/services/vdfNotificationService.js
import api from './api';

export const vdfNotificationService = {
  // Get all notifications for current user
  getNotifications: async () => {
    const response = await api.get('/member/vdf/notifications');
    return response.data;
  },

  // Get unread notifications
  getUnreadNotifications: async () => {
    const response = await api.get('/member/vdf/notifications/unread');
    return response.data;
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/member/vdf/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/member/vdf/notifications/read-all');
    return response.data;
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/member/vdf/notifications/${notificationId}`);
    return response.data;
  }
};

