// src/components/admin/vdf/VdfFamilyManagement.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from '../../../services/vdfService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/dateFormatter';
import { Users, Plus, Edit, Search } from 'lucide-react';
import Loader from '../../common/Loader';
import StyledTable from '../../common/StyledTable';
import VdfFamilyForm from '../../../components/vdf/VdfFamilyForm';

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
      const data = await vdfService.getAllFamilies(filterActive === 'active');
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
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 md:mb-6 gap-2">
        <div className="flex items-center gap-2">
          <Users size={24} className="text-cyan-600" />
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Families</h2>
        </div>
        {!readOnly && (
          <button
            onClick={handleAddNew}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg flex items-center space-x-1 transition text-sm md:text-base"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-2 md:p-4 mb-3 md:mb-6">
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

      {/* Summary Cards - Compact on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-3 md:mb-6">
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow p-2 md:p-4 text-white">
          <h3 className="text-xs md:text-sm font-medium opacity-90">Total</h3>
          <p className="text-lg md:text-3xl font-bold mt-1 md:mt-2">{families.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-2 md:p-4 text-white">
          <h3 className="text-xs md:text-sm font-medium opacity-90">Active</h3>
          <p className="text-lg md:text-3xl font-bold mt-1 md:mt-2">
            {families.filter(f => f.isContributionEnabled).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-2 md:p-4 text-white">
          <h3 className="text-xs md:text-sm font-medium opacity-90">Collected</h3>
          <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2">
            {formatCurrency(
              families.reduce((sum, f) => sum + (f.totalPaidAllTime || f.totalAmountPaid || 0), 0)
            )}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-2 md:p-4 text-white">
          <h3 className="text-xs md:text-sm font-medium opacity-90">Dues</h3>
          <p className="text-lg md:text-2xl font-bold mt-1 md:mt-2">
            {formatCurrency(
              families.reduce((sum, f) => sum + (f.totalDueAllTime || f.totalAmountDue || 0), 0)
            )}
          </p>
        </div>
      </div>

      {/* Mobile/Tablet Compact Table View */}
      <div className="lg:hidden overflow-x-auto">
        <table className="w-full text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-cyan-600 text-white">
              <th className="px-2 md:px-3 py-2 text-left text-xs font-semibold border border-cyan-500">Family Head</th>
              <th className="px-2 md:px-3 py-2 text-center text-xs font-semibold border border-cyan-500">Status</th>
              <th className="px-2 md:px-3 py-2 text-right text-xs font-semibold border border-cyan-500">Paid</th>
              <th className="px-2 md:px-3 py-2 text-right text-xs font-semibold border border-cyan-500">Due</th>
              {!readOnly && <th className="px-2 md:px-3 py-2 text-center text-xs font-semibold border border-cyan-500">Act</th>}
            </tr>
          </thead>
          <tbody>
            {filteredFamilies.length === 0 ? (
              <tr>
                <td colSpan={!readOnly ? 5 : 4} className="px-2 md:px-3 py-2 text-center text-gray-500 text-xs border border-gray-200">No families found</td>
              </tr>
            ) : (
              filteredFamilies.map((family) => (
                <tr key={family.id} className="odd:bg-white even:bg-gray-50 border-b border-gray-200">
                  <td className="px-2 md:px-3 py-2 text-xs font-medium text-gray-900 border border-gray-200">
                    {family.familyHeadName}
                  </td>
                  <td className="px-2 md:px-3 py-2 text-center border border-gray-200">
                    <span className={`inline-block px-1.5 py-0.5 text-xs font-semibold rounded whitespace-nowrap ${
                      family.isContributionEnabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {family.isContributionEnabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs font-semibold text-green-600 border border-gray-200 text-right">
                    {formatCurrency(family.totalPaidAllTime || family.totalAmountPaid || 0)}
                    { (family.totalPaidAllTime && family.totalAmountPaid && family.totalPaidAllTime !== family.totalAmountPaid) && (
                      <div className="text-xxs text-gray-500">({formatCurrency(family.totalAmountPaid || 0)} this year)</div>
                    )}
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs font-semibold text-red-600 border border-gray-200 text-right">
                    {formatCurrency(family.totalDueAllTime || family.totalAmountDue || 0)}
                    { (family.totalDueAllTime && family.totalAmountDue && family.totalDueAllTime !== family.totalAmountDue) && (
                      <div className="text-xxs text-gray-500">({formatCurrency(family.totalAmountDue || 0)} this year)</div>
                    )}
                  </td>
                  {!readOnly && (
                    <td className="px-2 md:px-3 py-2 text-center border border-gray-200">
                      <button
                        onClick={() => handleEdit(family)}
                        className="text-cyan-600 hover:text-cyan-900 font-semibold"
                        title="Edit"
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <StyledTable
          renderHeader={() => (
            <>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Family Head</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Member Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Effective From</th>
              
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Amount Paid</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Amount Due</th>
              {!readOnly && <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Actions</th>}
            </>
          )}
        >
          {filteredFamilies.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No families found</td>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {formatCurrency(family.totalPaidAllTime || family.totalAmountPaid || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  {formatCurrency(family.totalDueAllTime || family.totalAmountDue || 0)}
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
