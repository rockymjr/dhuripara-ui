// src/components/admin/vdf/VdfFamilyManagement.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from '../../../services/vdfService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/dateFormatter';
import { Users, Plus, Edit, Search } from 'lucide-react';
import Loader from '../../common/Loader';
import StyledTable from '../../common/StyledTable';
import VdfFamilyForm from './VdfFamilyForm';

const VdfFamilyManagement = ({ readOnly = false }) => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [filterActive, setFilterActive] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFamilies();
  }, [filterActive]);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const data = await vdfService.getPublicFamilies(filterActive === 'active');
      setFamilies(data);
    } catch (error) {
      console.error('Error fetching families:', error);
      alert('Failed to load families');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = (shouldRefresh) => {
    setShowForm(false);
    setEditingFamily(null);
    if (shouldRefresh) {
      fetchFamilies();
    }
  };

  const handleEdit = (family) => {
    setEditingFamily(family);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingFamily(null);
    setShowForm(true);
  };

  const filteredFamilies = families.filter(family => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      family.familyHeadName?.toLowerCase().includes(search) ||
      family.memberName?.toLowerCase().includes(search)
    );
  });

  if (loading) return <Loader message="Loading families..." />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users size={32} className="text-cyan-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">VDF Family Management</h2>
        </div>
        {!readOnly && (
          <button
            onClick={handleAddNew}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            <Plus size={20} />
            <span>Add Family</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterActive('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filterActive === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Families
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-4 py-2 rounded-lg transition ${
                filterActive === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Active Contributors
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by family head or member name..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Families</h3>
          <p className="text-3xl font-bold mt-2">{families.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Active Contributors</h3>
          <p className="text-3xl font-bold mt-2">
            {families.filter(f => f.isContributionEnabled).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Collected (This Year)</h3>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(
              families.reduce((sum, f) => sum + (f.totalAmountPaid || 0), 0)
            )}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Dues (This Year)</h3>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(
              families.reduce((sum, f) => sum + (f.totalAmountDue || 0), 0)
            )}
          </p>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {filteredFamilies.map((family) => (
          <div key={family.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{family.familyHeadName}</h3>
                <p className="text-sm text-gray-600">{family.memberName}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                family.isContributionEnabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {family.isContributionEnabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Amount:</span>
                <span className="font-medium">{formatCurrency(family.monthlyAmount)}</span>
              </div>
              {family.isContributionEnabled && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid Months:</span>
                    <span className="font-medium text-green-600">{family.totalPaidMonths}/12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(family.totalAmountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Due:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(family.totalAmountDue)}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {!readOnly && (
              <button
                onClick={() => handleEdit(family)}
                className="mt-3 w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <StyledTable
          renderHeader={() => (
            <>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Family Head</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Member Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Monthly Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Effective From</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Paid/Total</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Amount Paid</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Amount Due</th>
              {!readOnly && <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Actions</th>}
            </>
          )}
        >
          {filteredFamilies.length === 0 ? (
            <tr>
              <td colSpan="9" className="px-6 py-4 text-center text-gray-500">No families found</td>
            </tr>
          ) : (
            filteredFamilies.map((family) => (
              <tr key={family.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {family.familyHeadName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {family.memberName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(family.monthlyAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    family.isContributionEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {family.isContributionEnabled ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {family.effectiveFrom ? formatDate(family.effectiveFrom) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={family.totalPaidMonths === 12 ? 'text-green-600 font-semibold' : 'text-gray-900'}>
                    {family.totalPaidMonths || 0}/12
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {formatCurrency(family.totalAmountPaid || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  {formatCurrency(family.totalAmountDue || 0)}
                </td>
                {!readOnly && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(family)}
                      className="text-cyan-600 hover:text-cyan-900"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </StyledTable>
      </div>

      {/* Family Form Modal */}
      {!readOnly && showForm && (
        <VdfFamilyForm
          family={editingFamily}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default VdfFamilyManagement;