// src/components/vdf/VdfMonthlyContribution.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from '../../services/vdfService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import VdfContributionForm from './VdfContributionForm';
import { Calendar, CheckCircle, XCircle, Plus } from 'lucide-react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const VdfMonthlyContribution = () => {
  const { t } = useLanguage();
  const { isAuthenticated: isAdmin } = useAuth();
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);

  useEffect(() => {
    fetchMatrix();
  }, [selectedYear]);

  const handleFormClose = (shouldRefresh) => {
    setShowForm(false);
    setEditingFamily(null);
    if (shouldRefresh) {
      fetchMatrix();
    }
  };

  const handleEditFamily = (family) => {
    if (!isAdmin) {
      alert('Only admins can edit contributions');
      return;
    }
    setEditingFamily({ ...family, year: selectedYear });
    setShowForm(true);
  };

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      console.log('Fetching monthly matrix for year:', selectedYear);
      const data = await vdfService.getPublicMonthlyMatrix(selectedYear);
      console.log('Monthly matrix data:', data);
      // Handle both array and object responses
      const families = Array.isArray(data) ? data : (data?.families || []);
      setMatrix({ families });
    } catch (error) {
      console.error('Error fetching contribution matrix:', error);
      alert('Failed to load contribution data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2024; year--) {
      years.push(year);
    }
    return years;
  };

  if (loading) return <Loader message="Loading contribution data..." />;
  
  if (!matrix || !matrix.families || matrix.families.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No contribution data available</p>
          <p className="text-gray-400 text-sm mt-2">
            The backend endpoint /public/vdf/contributions/monthly-matrix may not be implemented yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center">
          <Calendar size={32} className="text-teal-600 mr-3" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Monthly Contribution Status
          </h2>
        </div>
        
        {/* Year Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        >
          {generateYearOptions().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        </div>
      </div>

      {/* Contribution Form Modal */}
      {showForm && <VdfContributionForm family={editingFamily} year={selectedYear} onClose={handleFormClose} />}

      {/* Mobile View - Cards */}
      <div className="block lg:hidden space-y-4">
        {matrix.families.map((family) => (
          <div key={family.familyConfigId} className="bg-white rounded-lg shadow p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900">{family.familyHeadName}</h3>
              <p className="text-sm text-gray-600">{family.memberPhone}</p>
            </div>
            
            {/* Month Status Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {MONTHS.map((month, idx) => {
                const isPaid = family.paidMonths?.[idx] === true;
                
                return (
                  <div
                    key={idx}
                    className={`text-center py-2 rounded text-xs font-medium ${
                      isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {month}
                    {isPaid ? (
                      <CheckCircle size={12} className="mx-auto mt-1" />
                    ) : (
                      <XCircle size={12} className="mx-auto mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Edit Button for Mobile */}
            {isAdmin && (
              <button
                onClick={() => handleEditFamily(family)}
                className="w-full mt-4 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium text-sm"
              >
                Edit Contributions
              </button>
            )}
            
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
              <div>
                <p className="text-gray-600">Paid:</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(family.totalPaid)}
                </p>
                <p className="text-xs text-gray-500">({family.totalPaidMonths} months)</p>
              </div>
              <div>
                <p className="text-gray-600">Due:</p>
                <p className="font-semibold text-red-600">
                  {formatCurrency(family.totalDue)}
                </p>
                <p className="text-xs text-gray-500">({family.totalPendingMonths} months)</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Family Head</th>
              {MONTHS.map((month, idx) => (
                <th key={idx} className="px-2 py-3 text-center text-xs font-semibold uppercase">
                  {month}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-semibold uppercase">Paid</th>
              <th className="px-4 py-3 text-center text-sm font-semibold uppercase">Due</th>
              {isAdmin && <th className="px-4 py-3 text-center text-sm font-semibold uppercase">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {matrix.families.map((family) => (
              <tr key={family.familyConfigId} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">{family.familyHeadName}</p>
                    <p className="text-sm text-gray-500">{family.memberPhone}</p>
                  </div>
                </td>
                
                {MONTHS.map((month, idx) => {
                  const isPaid = family.paidMonths?.[idx] === true;
                  
                  return (
                    <td key={idx} className="px-2 py-3 text-center">
                      {isPaid ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle size={20} className="text-green-600" />
                          <span className="text-xs text-gray-600 mt-1">
                            {formatCurrency(family.monthlyAmount)}
                          </span>
                        </div>
                      ) : (
                        <XCircle size={20} className="text-red-400 mx-auto" />
                      )}
                    </td>
                  );
                })}
                
                <td className="px-4 py-3 text-center">
                  <div className="font-semibold text-green-600">
                    {formatCurrency(family.totalPaid)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {family.totalPaidMonths} months
                  </div>
                </td>
                
                <td className="px-4 py-3 text-center">
                  <div className="font-semibold text-red-600">
                    {formatCurrency(family.totalDue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {family.totalPendingMonths} months
                  </div>
                </td>
                
                {/* Edit Button for Desktop */}
                {isAdmin && (
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEditFamily(family)}
                      className="px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition text-sm font-medium"
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VdfMonthlyContribution;