// src/components/vdf/VdfPublicDeposits.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from '../../services/vdfService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Plus, Edit, Trash2, Info } from 'lucide-react';
import Loader from '../common/Loader';
import VdfDepositForm from './VdfDepositForm';

const VdfPublicDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const { isAuthenticated: isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedNotes, setSelectedNotes] = useState(null);

  useEffect(() => {
    fetchDeposits();
  }, [selectedYear]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const data = await vdfService.getPublicDeposits(selectedYear);
      console.log('Fetched deposits:', data);
      setDeposits(Array.isArray(data) ? data : []);
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
    if (!isAdmin) {
      alert('Only admins can add deposits');
      navigate('/admin/login');
      return;
    }
    setEditingDeposit(null);
    setShowForm(true);
  };

  const handleEdit = (deposit) => {
    if (!isAdmin) {
      alert('Only admins can edit deposits');
      return;
    }
    setEditingDeposit(deposit);
    setShowForm(true);
  };

  const handleDelete = async (depositId) => {
    if (!window.confirm('Are you sure you want to delete this deposit?')) return;
    try {
      await vdfService.deleteDeposit(depositId);
      alert('Deposit deleted successfully');
      fetchDeposits();
    } catch (error) {
      console.error('Error deleting deposit:', error);
      alert('Failed to delete deposit');
    }
  };

  if (loading) return <Loader message="Loading deposits..." />;

  const totalDeposits = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
  const depositsByType = {};
  deposits.forEach(d => {
    if (!depositsByType[d.sourceType]) {
      depositsByType[d.sourceType] = 0;
    }
    depositsByType[d.sourceType] += d.amount;
  });

  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-green-600" />
          <h2 className="text-lg font-bold text-gray-800">Deposits</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {isAdmin && (
            <button
              onClick={handleAddNew}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center space-x-1 transition text-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 mb-4 text-white">
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">Total Deposits {selectedYear}</span>
          <span className="text-xl font-bold">{formatCurrency(totalDeposits)}</span>
        </div>
      </div>

      {/* Deposits by Type Summary */}
      {Object.keys(depositsByType).length > 0 && (
        <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
          <div className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold">
            By Type
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(depositsByType).map(([type, amount]) => (
                  <tr key={type} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900">{type}</td>
                    <td className="px-3 py-2 text-right font-semibold text-green-600">{formatCurrency(amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Deposits Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Date</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-left font-semibold">Source</th>
                <th className="px-3 py-2 text-right font-semibold">Amount</th>
                {isAdmin && <th className="px-3 py-2 text-center font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-3 py-3 text-center text-gray-500">
                    No deposits found
                  </td>
                </tr>
              ) : (
                deposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap text-xs sm:text-sm">{formatDate(deposit.depositDate)}</td>
                    <td className="px-3 py-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 whitespace-nowrap">
                        {deposit.sourceType}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700 truncate max-w-xs text-xs sm:text-sm">
                      {deposit.sourceName || '-'}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-green-600 whitespace-nowrap text-xs sm:text-sm">
                      {formatCurrency(deposit.amount)}
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(deposit)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(deposit.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
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
