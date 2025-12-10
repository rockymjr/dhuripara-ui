// src/components/vdf/VdfDepositManagement.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from "../../services/vdfService";
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { TrendingUp, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../common/Loader';
import VdfDepositForm from './VdfDepositForm';
import { useAuth } from '../../context/AuthContext';

const VdfDepositManagement = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { isAuthenticated: isAdmin } = useAuth();

  useEffect(() => {
    console.log('VdfDepositManagement mounted');
    fetchDeposits();
  }, [selectedYear]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const data = await vdfService.getPublicDeposits(selectedYear);
      console.log('Fetched deposits:', data);
      const deposits = Array.isArray(data) ? data : (data.content || []);
      setDeposits(deposits);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      alert('Failed to load deposits');
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
    setEditingDeposit(null);
    setShowForm(true);
  };

  const handleEdit = (deposit) => {
    setEditingDeposit(deposit);
    setShowForm(true);
  };

  const handleDelete = async (depositId) => {
    if (window.confirm('Are you sure you want to delete this deposit?')) {
      try {
        await vdfService.deleteDeposit(depositId);
        fetchDeposits();
        alert('Deposit deleted successfully');
      } catch (error) {
        console.error('Error deleting deposit:', error);
        alert('Failed to delete deposit');
      }
    }
  };

  // Calculate summary
  const filteredDeposits = (deposits || []).filter(dep => {
    const depDate = new Date(dep.depositDate);
    const yearMatch = depDate.getFullYear() === selectedYear;
    return yearMatch;
  });

  const totalDeposits = filteredDeposits.reduce((sum, dep) => sum + (dep.amount || 0), 0);
  const depositsByType = {};
  filteredDeposits.forEach(dep => {
    const cat = dep.categoryName || dep.category?.categoryName || 'Uncategorized';
    if (!depositsByType[cat]) {
      depositsByType[cat] = 0;
    }
    depositsByType[cat] += dep.amount;
  });

  console.log('Rendering VdfDepositManagement - loading:', loading, 'deposits:', deposits);
  if (loading) return <Loader message="Loading deposits..." />;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 md:mb-6 gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={24} className="text-green-600" />
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Deposits</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <button
              onClick={handleAddNew}
              className="bg-green-600 hover:bg-green-700 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg flex items-center space-x-1 transition text-sm md:text-base"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards - Total This Year in Table Format */}
      <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-3 md:mb-6">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="px-3 py-2 text-sm md:text-base font-medium text-gray-700">Total This Year:</td>
              <td className="px-3 py-2 text-sm md:text-base font-bold text-green-600 text-right">{formatCurrency(totalDeposits)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Deposit by Type - Table Format */}
      {Object.keys(depositsByType).length > 0 && (
        <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-3 md:mb-6 overflow-x-auto">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3">Deposits by Category</h3>
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b-2 border-green-300">
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Category</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-700">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(depositsByType).map(([type, amount]) => (
                <tr key={type} className="border-b border-gray-200 odd:bg-gray-50 hover:bg-gray-100">
                  <td className="px-3 py-2 text-gray-800">{type}</td>
                  <td className="px-3 py-2 text-right font-semibold text-green-600">{formatCurrency(amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {filteredDeposits.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500 text-sm">
            No deposits found for selected filters
          </div>
        ) : (
          filteredDeposits.map((deposit) => (
            <div key={deposit.id} className="bg-white rounded-lg shadow p-3 group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-xs md:text-sm">{deposit.sourceName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Member: {deposit.member ? `${deposit.member.firstName || ''} ${deposit.member.lastName || ''}`.trim() : 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(deposit.depositDate)}</p>
                </div>
                <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-800 whitespace-nowrap ml-2">
                  {deposit.categoryName || deposit.category?.categoryName || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-green-600">{formatCurrency(deposit.amount)}</span>
              </div>
              {isAdmin && (
                <div className="mt-2 flex gap-1">
                  <button
                    onClick={() => handleEdit(deposit)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded-lg flex items-center justify-center transition text-xs"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(deposit.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded-lg flex items-center justify-center transition text-xs"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-left font-semibold">Type</th>
                  <th className="px-3 py-2 text-left font-semibold">Member</th>
                  <th className="px-3 py-2 text-left font-semibold">Source</th>
                  <th className="px-3 py-2 text-right font-semibold">Amount</th>
                  <th className="px-3 py-2 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-3 py-4 text-center text-gray-500">No deposits found for selected filters</td>
                  </tr>
                ) : (
                  filteredDeposits.map((deposit) => (
                    <tr key={deposit.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 group">
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(deposit.depositDate)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                          {deposit.categoryName || deposit.category?.categoryName || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {deposit.member ? `${deposit.member.firstName || ''} ${deposit.member.lastName || ''}`.trim() : '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {deposit.sourceName || '-'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                        {formatCurrency(deposit.amount)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        {isAdmin ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(deposit)}
                              className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition"
                              title="Edit deposit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(deposit.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                              title="Delete deposit"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{page + 1}</span> of{' '}
            <span className="font-medium">{totalPages}</span> (showing {filteredDeposits.length} of {deposits.length} deposits)
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

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

export default VdfDepositManagement;
