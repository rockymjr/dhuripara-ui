// src/components/vdf/VdfPublicDeposits.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from '../../services/vdfService';
import { adminService } from '../../services/adminService';
import { publicService } from '../../services/publicService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Plus, Edit, Trash2, Filter } from 'lucide-react';
import Loader from '../common/Loader';
import VdfDepositForm from './VdfDepositForm';

const VdfPublicDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMember, setSelectedMember] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const { isAuthenticated: isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  // On mount: fetch members, summary, and deposits.
  useEffect(() => {
    const initializeData = async () => {
      await fetchMembers();
      await fetchSummary();
      await fetchDeposits();
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMembers = async () => {
    try {
      // Use public service for public pages, fallback to admin service if authenticated
      let data;
      try {
        data = await publicService.getMembers();
      } catch (err) {
        // Fallback to admin service if user is authenticated
        if (isAdmin) {
          data = await adminService.getAllMembers('');
        } else {
          throw err;
        }
      }
      const membersList = Array.isArray(data) ? data : (data?.content || []);
      // Already sorted by backend, but ensure it's sorted
      const sorted = membersList.sort((a, b) => {
        const nameA = (a.firstName || '') + ' ' + (a.lastName || '');
        const nameB = (b.firstName || '') + ' ' + (b.lastName || '');
        return nameA.localeCompare(nameB);
      });
      setMembers(sorted);
    } catch (error) {
      console.error('Error fetching members:', error);
      // Don't show error to user, just leave members empty
    }
  };

  const [backendTotal, setBackendTotal] = useState(0);

  const fetchSummary = async () => {
    try {
      const data = await vdfService.getPublicSummary();
      // backend may return different field names; try common ones
      const total = data?.totalAmount || data?.totalDeposits || data?.total || 0;
      setBackendTotal(Number(total) || 0);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchDeposits = async ({ year = selectedYear, member = selectedMember, category = selectedCategory } = {}) => {
    try {
      setLoading(true);
      let allDeposits = [];

      // If 'all years' is selected, fetch multiple years (but only when user requests)
      if (String(year) === 'all') {
        for (let i = 0; i < 5; i++) {
          const yearToFetch = currentYear - i;
          const data = await vdfService.getPublicDeposits(yearToFetch);
          if (Array.isArray(data)) {
            allDeposits = [...allDeposits, ...data];
          }
        }
      } else {
        const yearNum = parseInt(year);
        const data = await vdfService.getPublicDeposits(Number.isNaN(yearNum) ? undefined : yearNum);
        allDeposits = Array.isArray(data) ? data : [];
      }

      setDeposits(allDeposits);
      // Only reset category filter when year changes, not when category filter changes
      if (year !== selectedYear) {
        setSelectedCategory('all');
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
      alert(t('errorFetching'));
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = (shouldRefresh) => {
    setShowForm(false);
    setEditingDeposit(null);
    if (shouldRefresh) {
      fetchDeposits();
    }
  };

  const handleAddNew = () => {
    if (!isAdmin) {
      alert(t('adminOnly'));
      navigate('/admin/login');
      return;
    }
    setEditingDeposit(null);
    setShowForm(true);
  };

  const handleEdit = (deposit) => {
    if (!isAdmin) {
      alert(t('adminOnly'));
      return;
    }
    setEditingDeposit(deposit);
    setShowForm(true);
  };

  const handleDelete = async (depositId) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await vdfService.deleteDeposit(depositId);
      alert(t('deleted'));
      fetchDeposits();
    } catch (error) {
      console.error('Error deleting deposit:', error);
      alert(t('errorDeleting'));
    }
  };

  if (loading) return <Loader message={t('loadingDeposits')} />;

  // Filter deposits by selected category and member
  const filteredDeposits = deposits.filter(d => {
    const catMatch = selectedCategory === 'all' || (d.categoryName || d.category?.categoryName || 'Uncategorized') === selectedCategory;
    // selectedMember is a string UUID (e.g., "10aed26e-dc80-4313-ba00-2f5f30d62290")
    // memberId in deposit is also a UUID string
    const memberMatch = selectedMember === 'all' || (d.memberId && d.memberId === selectedMember);
    return catMatch && memberMatch;
  });

  // Helper to get member display name depending on selected language and available fields
  const getMemberDisplayName = (member) => {
    if (!member) return '-';
    // Prefer explicit Bengali fields if language is set to bn
    if (language === 'bn') {
      const bnFirst = member.firstNameBn || member.first_name_bn || member.nameBn || member.name_bn || member.bengaliName || member.bnName;
      const bnLast = member.lastNameBn || member.last_name_bn || '';
      const bnFull = [bnFirst, bnLast].filter(Boolean).join(' ').trim();
      if (bnFull) return bnFull;
    }
    // Fallback to common English fields
    const first = member.firstName || member.first_name || member.first || '';
    const last = member.lastName || member.last_name || member.last || '';
    const full = `${first} ${last}`.trim();
    if (full) return full;
    // Some APIs may expose a single `name` field
    return member.name || member.memberName || member.member_name || '-';
  };

  // Use backend total when available else fall back to client calculation
  const totalDeposits = backendTotal || filteredDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);

  // Group filtered deposits by category
  const depositsByCategory = {};
  const allCategories = new Set();
  
  filteredDeposits.forEach(d => {
    const cat = d.categoryName || d.category?.categoryName || 'Uncategorized';
    allCategories.add(cat);
    if (!depositsByCategory[cat]) {
      depositsByCategory[cat] = 0;
    }
    depositsByCategory[cat] += d.amount;
  });

  const availableYearsOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp size={24} className="text-green-600" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">{t('vdfDeposits')}</h2>
        </div>
        {isAdmin && (
          <button
            onClick={handleAddNew}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-1 transition"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t('addDeposit')}</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Total Deposits Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Deposits</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(totalDeposits)}</p>
          <p className="text-xs mt-2 opacity-75">{selectedYear === 'all' ? 'All Years' : selectedYear}</p>
        </div>

      </div>

      {/* Category-wise Summary Table 
      {Object.keys(depositsByCategory).length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold">
            Deposits by Category ({selectedYear === 'all' ? 'All Years' : selectedYear})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(depositsByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const percentage = totalDeposits > 0 ? ((amount / totalDeposits) * 100).toFixed(1) : 0;
                    return (
                      <tr key={category} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">{category}</td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(amount)}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{percentage}%</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}*/}

      {/* Category Filter and Deposits List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Filter Bar */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={18} className="text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Filter by:</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const newCat = e.target.value;
                setSelectedCategory(newCat);
                // Don't refetch deposits when only category filter changes - filtering is done client-side
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="all">All Categories</option>
              {Array.from(allCategories)
                .sort()
                .map(cat => {
                  const count = filteredDeposits.filter(d => (d.categoryName || d.category?.categoryName || 'Uncategorized') === cat).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({count})
                    </option>
                  );
                })}
            </select>
            <select
              value={selectedMember}
              onChange={(e) => {
                const newMember = e.target.value;
                setSelectedMember(newMember);
                fetchDeposits({ year: selectedYear, member: newMember, category: selectedCategory });
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="all">All Members</option>
              {members.length > 0 ? (
                members.map(member => {
                  const count = deposits.filter(d => (d.memberId && d.memberId === member.id) || (d.member && d.member.id === member.id)).length;
                  const memberName = getMemberDisplayName(member);
                  return (
                    <option key={member.id} value={member.id}>
                      {memberName} ({count})
                    </option>
                  );
                })
              ) : (
                <option disabled>No members available</option>
              )}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => {
                const newYear = e.target.value;
                setSelectedYear(newYear);
                // fetch deposits only when user changes year
                fetchDeposits({ year: newYear, member: selectedMember, category: selectedCategory });
                // refresh summary as year scope changed
                fetchSummary();
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="all">All Years</option>
              {availableYearsOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Deposits Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-left font-semibold">Member</th>
                <th className="px-4 py-3 text-left font-semibold">Source</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                {isAdmin && <th className="px-4 py-3 text-center font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-4 py-4 text-center text-gray-500">
                    {t('noDepositsFound')}
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs sm:text-sm">
                      {formatDate(deposit.depositDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {language === 'bn'
                          ? (deposit.categoryNameBn || deposit.category?.categoryNameBn || deposit.categoryName || deposit.category?.categoryName || '-')
                          : (deposit.categoryName || deposit.category?.categoryName || '-')
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs sm:text-sm">
                      {deposit.member ? getMemberDisplayName(deposit.member) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 truncate max-w-xs text-xs sm:text-sm">
                      {language === 'bn' ? (deposit.sourceNameBn || deposit.sourceName || '-') : (deposit.sourceName || '-')}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600 whitespace-nowrap text-xs sm:text-sm">
                      {formatCurrency(deposit.amount)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(deposit)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(deposit.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary at bottom */}
        {filteredDeposits.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Showing {filteredDeposits.length} of {deposits.length} deposits
              </span>
              <span className="text-sm font-bold text-green-600">
                Filtered Total: {formatCurrency(filteredDeposits.reduce((sum, d) => sum + (d.amount || 0), 0))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Form Modal */}
      {showForm && (
        <VdfDepositForm
          deposit={editingDeposit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default VdfPublicDeposits;
