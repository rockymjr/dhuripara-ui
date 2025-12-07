// src/components/vdf/VdfPublicDeposits.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from '../../services/vdfService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Plus, Edit, Filter } from 'lucide-react';
import Loader from '../common/Loader';
import StyledTable from '../common/StyledTable';
import VdfDepositForm from './VdfDepositForm';

const VdfPublicDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const { isAuthenticated: isAdmin } = useAuth();
  const navigate = useNavigate();

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

  if (loading) return <Loader message="Loading deposits..." />;

  const totalDeposits = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
  const depositsByType = {};
  deposits.forEach(d => {
    if (!depositsByType[d.sourceType]) {
      depositsByType[d.sourceType] = 0;
    }
    depositsByType[d.sourceType] += d.amount;
  });

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center">
          <TrendingUp size={32} className="text-green-600 mr-3" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">VDF Deposits</h2>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <button
            onClick={handleAddNew}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            <Plus size={20} />
            <span>Add Deposit</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Deposits</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(totalDeposits)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Deposit Count</h3>
          <p className="text-3xl font-bold mt-2">{deposits.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Types</h3>
          <p className="text-3xl font-bold mt-2">{Object.keys(depositsByType).length}</p>
        </div>
      </div>

      {/* Deposit Type Summary */}
      {Object.keys(depositsByType).length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Filter size={20} className="mr-2 text-green-600" />
            Deposits by Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(depositsByType).map(([type, amount]) => (
              <div key={type} className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">{type}</p>
                <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {deposits.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
            No deposits found
          </div>
        ) : (
          deposits.map((deposit) => (
            <div key={deposit.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{deposit.sourceName}</p>
                  {deposit.memberName && (
                    <p className="text-xs text-gray-600">{deposit.memberName}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{formatDate(deposit.depositDate)}</p>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {deposit.sourceType}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(deposit.amount)}</span>
                </div>
                {deposit.notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Notes:</span>
                    <span className="text-xs">{deposit.notes}</span>
                  </div>
                )}
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleEdit(deposit)}
                  className="mt-3 w-full text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <StyledTable
          renderHeader={() => (
            <>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Source / Member</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Amount</th>
              {isAdmin && <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Actions</th>}
            </>
          )}
        >
          {deposits.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? "6" : "5"} className="px-6 py-4 text-center text-gray-500">No deposits found</td>
            </tr>
          ) : (
            deposits.map((deposit) => (
              <tr key={deposit.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(deposit.depositDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {deposit.sourceType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {deposit.categoryName || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate">{deposit.sourceName}</div>
                  {deposit.memberName && (
                    <div className="text-xs text-gray-600">{deposit.memberName}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {formatCurrency(deposit.amount)}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEdit(deposit)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-2"
                      title="Edit deposit"
                    >
                      <Edit size={16} />
                      <span className="text-sm">Edit</span>
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </StyledTable>
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
