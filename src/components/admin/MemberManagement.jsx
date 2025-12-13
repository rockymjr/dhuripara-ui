import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useLanguage } from '../../context/LanguageContext';
import { Search, UserPlus, Edit, Trash2, Unlock, Monitor, FileText } from 'lucide-react';
import Loader from '../common/Loader';
import MemberForm from './MemberForm';
import DocumentUpload from './DocumentUpload';
import { formatDate } from '../../utils/dateFormatter';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { useAuth } from '../../context/AuthContext';
import StyledTable from '../common/StyledTable';

const MemberManagement = () => {
  const { t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [selectedMemberForDocument, setSelectedMemberForDocument] = useState(null);
  const { isOperator } = useMemberAuth();
  const { isAuthenticated: isAdmin } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async (search = '') => {
    try {
      setLoading(true);
      const data = await adminService.getAllMembers(search);
      // Sort members alphabetically by name
      const sorted = Array.isArray(data) ? data.sort((a, b) => {
        const nameA = (a.firstName || '') + ' ' + (a.lastName || '');
        const nameB = (b.firstName || '') + ' ' + (b.lastName || '');
        return nameA.localeCompare(nameB);
      }) : data;
      setMembers(sorted);
    } catch (error) {
      console.error('Error fetching members:', error);
      alert('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMembers(searchTerm);
  };

  const handleAddNew = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this member?')) {
      try {
        await adminService.deactivateMember(id);
        alert('Member deactivated successfully');
        fetchMembers();
      } catch (error) {
        console.error('Error deactivating member:', error);
        alert('Failed to deactivate member');
      }
    }
  };

  const handleUnblock = async (id) => {
    if (window.confirm('Are you sure you want to unblock this member?')) {
      try {
        await adminService.unblockMember(id);
        alert('Member unblocked successfully');
        fetchMembers();
      } catch (error) {
        console.error('Error unblocking member:', error);
        alert('Failed to unblock member');
      }
    }
  };

  const handleFormClose = (shouldRefresh) => {
    setShowForm(false);
    setEditingMember(null);
    if (shouldRefresh) {
      fetchMembers();
    }
  };

  const handleUploadDocument = (member) => {
    setSelectedMemberForDocument(member);
    setShowDocumentUpload(true);
  };

  const handleDocumentUploadClose = () => {
    setShowDocumentUpload(false);
    setSelectedMemberForDocument(null);
  };

  const formatBlockedUntil = (blockedUntil) => {
    if (!blockedUntil) return '';
    const date = new Date(blockedUntil);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loader message={t('loading')} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('members')}</h2>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <Link
              to="/admin/sessions"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
            >
              <Monitor size={20} />
              <span>Active Sessions</span>
            </Link>
          )}
          {!isOperator && (
            <button
              onClick={handleAddNew}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
            >
              <UserPlus size={20} />
              <span>{t('addMember')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`${t('search')} ${t('memberName')} or phone...`}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            {t('search')}
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              fetchMembers('');
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
          >
            {t('cancel')}
          </button>
        </div>
      </form>

      {/* Members Table */}
      <StyledTable
        renderHeader={() => (
          <>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('memberName')}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('phone')}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('pin')}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Login Status</th>
            {!isOperator && <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('status')}</th>}
            {!isOperator && <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('actions')}</th>}
          </>
        )}
      >
        {members.length === 0 ? (
          <tr>
            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No members found</td>
          </tr>
        ) : (
          members.map((member) => (
            <tr key={member.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <Link to={`/admin/statements?memberId=${member.id}`} className="text-blue-600 hover:underline">
                  {member.firstName} {member.lastName}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{member.pin || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {member.isBlocked ? (
                  <div className="flex flex-col">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mb-1">
                      🔒 Blocked
                    </span>
                    {member.blockedUntil && (
                      <span className="text-xs text-red-600">
                        Until: {formatBlockedUntil(member.blockedUntil)}
                      </span>
                    )}
                    {member.failedLoginAttempts > 0 && (
                      <span className="text-xs text-gray-500 mt-1">
                        Failed attempts: {member.failedLoginAttempts}
                      </span>
                    )}
                  </div>
                ) : member.failedLoginAttempts > 0 ? (
                  <div className="flex flex-col">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 mb-1">
                      ⚠️ Warning
                    </span>
                    <span className="text-xs text-yellow-600">
                      Failed attempts: {member.failedLoginAttempts}/3
                    </span>
                  </div>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    ✓ OK
                  </span>
                )}
              </td>
              {!isOperator && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              )}
              {!isOperator && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {isAdmin && (
                      <button
                        onClick={() => handleUploadDocument(member)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Upload Document"
                      >
                        <FileText size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    {member.isBlocked && (
                      <button
                        onClick={() => handleUnblock(member.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Unblock Member"
                      >
                        <Unlock size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={!member.isActive}
                      title="Deactivate"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </StyledTable>

      {/* Member Form Modal */}
      {showForm && (
        <MemberForm
          member={editingMember}
          onClose={handleFormClose}
        />
      )}
      {showDocumentUpload && selectedMemberForDocument && (
        <DocumentUpload
          memberId={selectedMemberForDocument.id}
          memberName={`${selectedMemberForDocument.firstName} ${selectedMemberForDocument.lastName}`}
          onClose={handleDocumentUploadClose}
        />
      )}
    </div>
  );
};

export default MemberManagement;