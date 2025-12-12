// src/components/vdf/VdfNotifications.jsx
import React, { useState, useEffect } from 'react';
import { vdfNotificationService } from '../../services/vdfNotificationService';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import Loader from '../common/Loader';

const VdfNotifications = ({ onClose }) => {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await vdfNotificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      alert('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await vdfNotificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await vdfNotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    try {
      await vdfNotificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <Bell className="text-orange-600" size={24} />
            <h3 className="text-xl font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-orange-600 text-white text-sm rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Mark all as read"
              >
                <CheckCheck size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4">
          {loading ? (
            <Loader />
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition ${
                    notification.isRead
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {language === 'bn' && notification.titleBn
                            ? notification.titleBn
                            : notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {language === 'bn' && notification.messageBn
                          ? notification.messageBn
                          : notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-200 rounded">
                          {notification.type}
                        </span>
                        <span>
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded transition"
                          title="Mark as read"
                        >
                          <CheckCheck size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VdfNotifications;

