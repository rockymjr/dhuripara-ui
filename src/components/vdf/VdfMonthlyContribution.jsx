// src/components/vdf/VdfMonthlyContribution.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from '../../services/vdfService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import VdfContributionForm from './VdfContributionForm';
import { Calendar, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';

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
  const [expandedFamily, setExpandedFamily] = useState(null);

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
    for (let year = currentYear; year >= 2023; year--) {
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
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-teal-600" />
          <h2 className="text-lg font-bold text-gray-800">Monthly Contributions</h2>
        </div>
        
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
        >
          {generateYearOptions().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Contribution Form Modal */}
      {showForm && <VdfContributionForm family={editingFamily} year={selectedYear} onClose={handleFormClose} />}

      {/* Family List with Collapsible Months - Table Format */}
      <div className="space-y-2">
        {matrix.families.map((family) => (
          <div key={family.familyConfigId} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Family Header - Always Visible */}
            <div 
              onClick={() => setExpandedFamily(expandedFamily === family.familyConfigId ? null : family.familyConfigId)}
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 transition border-b border-gray-200"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {expandedFamily === family.familyConfigId ? (
                  <ChevronDown size={18} className="text-teal-600 flex-shrink-0" />
                ) : (
                  <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                )}
                <h3 className="font-semibold text-gray-900 text-sm truncate">{family.familyHeadName}</h3>
              </div>

              {/* Summary on Right */}
              <div className="flex items-center space-x-3 text-xs flex-shrink-0">
                <div className="text-right">
                  <p className="text-gray-600">Paid</p>
                  <p className="font-semibold text-green-600">{formatCurrency(family.totalPaidAllTime || family.totalPaid || 0)}</p>
                  {(family.totalPaidAllTime && family.totalPaid) && (family.totalPaidAllTime !== family.totalPaid) && (
                    <div className="text-xxs text-gray-500">(This year: {formatCurrency(family.totalPaid || 0)})</div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Due</p>
                  <p className="font-semibold text-red-600">{formatCurrency(family.totalDueAllTime || family.totalDue || 0)}</p>
                  {(family.totalDueAllTime && family.totalDue) && (family.totalDueAllTime !== family.totalDue) && (
                    <div className="text-xxs text-gray-500">(This year: {formatCurrency(family.totalDue || 0)})</div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content - Months Details */}
            {expandedFamily === family.familyConfigId && (
              <div className="bg-gray-50 p-3">
                <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {MONTHS.map((month, idx) => {
                    const monthIndex = idx + 1;
                    const monText = `${selectedYear}-${String(monthIndex).padStart(2,'0')}`;

                    const isPaid = family.paidMonths?.[idx] === true || family.paidMap?.[monText] === true;
                    const monthPaid = isPaid ? family.monthlyAmount : 0;

                    // Try several possible shapes for exemption information
                    const isExempted = Boolean(
                      family.exemptedMonths?.[idx] ||
                      family.exemptionsMap?.[monText] ||
                      family.months?.[idx]?.is_exempted ||
                      family.months?.[idx]?.isExempted
                    );

                    const handleToggleExempt = async () => {
                      if (!isAdmin) return;
                      const confirmMsg = isExempted
                        ? `Remove exemption for ${family.familyHeadName} - ${monText}?`
                        : `Mark ${family.familyHeadName} as exempt for ${monText}?`;
                      if (!window.confirm(confirmMsg)) return;

                      try {
                        if (!isExempted) {
                          await vdfService.createFamilyExemption({ familyId: family.familyConfigId || family.familyConfigId || family.familyId || family.family_id, monthYear: monText, reason: 'Marked exempt via UI' });
                        } else {
                          await vdfService.deleteFamilyExemption(family.familyConfigId || family.familyConfigId || family.familyId || family.family_id, monText);
                        }
                        await fetchMatrix();
                      } catch (err) {
                        console.error('Error toggling exemption:', err);
                        alert('Failed to update exemption: ' + (err?.message || err));
                      }
                    };

                    return (
                      <div key={idx} className="bg-white p-2 rounded border border-gray-200 text-center text-xs">
                        <div className="font-medium text-gray-700 mb-1">{month}</div>
                        {isPaid ? (
                          <CheckCircle size={14} className="text-green-600 mx-auto mb-1" />
                        ) : isExempted ? (
                          <Calendar size={14} className="text-blue-500 mx-auto mb-1" />
                        ) : (
                          <XCircle size={14} className="text-gray-300 mx-auto mb-1" />
                        )}

                        <span className={`font-semibold block ${isPaid ? 'text-green-600' : isExempted ? 'text-blue-600' : 'text-gray-500'}`}>
                          {isExempted ? 'Exempt' : formatCurrency(monthPaid)}
                        </span>

                        {isAdmin && (
                          <button
                            onClick={handleToggleExempt}
                            className={`mt-2 text-xs px-2 py-0.5 rounded ${isExempted ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-teal-50 text-teal-600 border border-teal-100'}`}
                          >
                            {isExempted ? 'Undo Exempt' : 'Mark Exempt'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Edit Button for Collapsible View */}
                {isAdmin && (
                  <button
                    onClick={() => handleEditFamily(family)}
                    className="w-full mt-2 px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium text-xs"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VdfMonthlyContribution;