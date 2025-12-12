import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { useLanguage } from '../../context/LanguageContext';
import Loader from '../common/Loader';
import StyledTable from '../common/StyledTable';
import { formatDate } from '../../utils/dateFormatter';
import { LogOut, RefreshCw, Monitor, Smartphone, Tablet, Globe, Trash2 } from 'lucide-react';

const SessionManagement = () => {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSessions();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      setRefreshing(true);
      const data = await adminService.getAllActiveSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      alert('Failed to load sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminService.getSessionStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleForceLogout = async (sessionId) => {
    if (!window.confirm('Are you sure you want to force logout this session?')) {
      return;
    }
    try {
      await adminService.forceLogoutSession(sessionId);
      alert('Session logged out successfully');
      fetchSessions();
      fetchStats();
    } catch (error) {
      console.error('Error force logging out:', error);
      alert('Failed to force logout session');
    }
  };

  const handleForceLogoutAllForUser = async (userId, userType) => {
    if (!window.confirm('Are you sure you want to force logout all sessions for this user?')) {
      return;
    }
    try {
      await adminService.forceLogoutAllForUser(userId, userType);
      alert('All sessions logged out successfully');
      fetchSessions();
      fetchStats();
    } catch (error) {
      console.error('Error force logging out:', error);
      alert('Failed to force logout sessions');
    }
  };

  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo) return <Monitor size={16} />;
    const device = deviceInfo.toLowerCase();
    if (device.includes('mobile')) return <Smartphone size={16} />;
    if (device.includes('tablet')) return <Tablet size={16} />;
    return <Monitor size={16} />;
  };

  const getTimeAgo = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) return <Loader message={t('loading') || 'Loading sessions...'} />;

  // Group sessions by user
  const sessionsByUser = {};
  sessions.forEach(session => {
    const key = `${session.userType}_${session.userId}`;
    if (!sessionsByUser[key]) {
      sessionsByUser[key] = {
        userId: session.userId,
        userType: session.userType,
        username: session.username,
        sessions: []
      };
    }
    sessionsByUser[key].sessions.push(session);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Active Sessions</h2>
        <button
          onClick={fetchSessions}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Active Admin Sessions</div>
            <div className="text-2xl font-bold text-blue-600">{stats.activeAdminSessions || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Active Member Sessions</div>
            <div className="text-2xl font-bold text-green-600">{stats.activeMemberSessions || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Active Sessions</div>
            <div className="text-2xl font-bold text-purple-600">{stats.totalActiveSessions || 0}</div>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow">
        <StyledTable
          renderHeader={() => (
            <>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Device</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">IP Address</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Login Time</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Last Activity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Sessions</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Actions</th>
            </>
          )}
        >
          {Object.keys(sessionsByUser).length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No active sessions</td>
            </tr>
          ) : (
            Object.values(sessionsByUser).map((userGroup, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {userGroup.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    userGroup.userType === 'ADMIN' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {userGroup.userType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(userGroup.sessions[0]?.deviceInfo)}
                    <span>{userGroup.sessions[0]?.deviceInfo || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                  {userGroup.sessions[0]?.ipAddress || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(userGroup.sessions[0]?.loginTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getTimeAgo(userGroup.sessions[0]?.lastActivity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {userGroup.sessions.length} device{userGroup.sessions.length > 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {userGroup.sessions.length > 1 && (
                      <button
                        onClick={() => handleForceLogoutAllForUser(userGroup.userId, userGroup.userType)}
                        className="text-red-600 hover:text-red-900"
                        title="Logout all sessions"
                      >
                        <LogOut size={18} />
                      </button>
                    )}
                    {userGroup.sessions.map((session, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleForceLogout(session.id)}
                        className="text-orange-600 hover:text-orange-900"
                        title={`Logout ${session.deviceInfo || 'device'}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))
          )}
        </StyledTable>
      </div>

      {/* Detailed Sessions Modal/Expandable */}
      {Object.values(sessionsByUser).map((userGroup, idx) => (
        userGroup.sessions.length > 1 && (
          <div key={idx} className="mt-4 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{userGroup.username} - All Sessions ({userGroup.sessions.length})</h3>
            <div className="space-y-2">
              {userGroup.sessions.map((session, sIdx) => (
                <div key={sIdx} className="bg-white rounded p-3 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    {getDeviceIcon(session.deviceInfo)}
                    <div>
                      <div className="text-sm font-medium">{session.deviceInfo || 'Unknown Device'}</div>
                      <div className="text-xs text-gray-500">
                        IP: {session.ipAddress} | Login: {formatDate(session.loginTime)} | Last: {getTimeAgo(session.lastActivity)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleForceLogout(session.id)}
                    className="text-red-600 hover:text-red-900 px-2 py-1 rounded"
                    title="Logout this session"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default SessionManagement;

