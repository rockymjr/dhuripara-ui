// src/components/vdf/VdfMonthlyContribution.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { vdfService } from '../../services/vdfService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import VdfContributionForm from './VdfContributionForm';
import { Calendar, CheckCircle, XCircle, ChevronDown, ChevronRight, Edit, Search } from 'lucide-react';

const VdfMonthlyContribution = () => {
  const { t } = useLanguage();
  const { isAuthenticated: isAdmin } = useAuth();
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const MONTHS = [
    t('jan'), t('feb'), t('mar'), t('apr'), t('may'), t('jun'),
    t('jul'), t('aug'), t('sep'), t('oct'), t('nov'), t('dec')
  ];
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [expandedFamily, setExpandedFamily] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      alert(t('adminOnly'));
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
      alert(t('errorFetching'));
    } finally {
      setLoading(false);
    }
  };

  // Memoize filtered families to avoid recalculating on every render
  const filteredFamilies = useMemo(() => {
    if (!matrix?.families) return [];
    if (!searchTerm) return matrix.families;
    const search = searchTerm.toLowerCase();
    return matrix.families.filter(family => {
      const display = (family.memberName || family.familyHeadName || '').toLowerCase();
      return display.includes(search);
    });
  }, [matrix?.families, searchTerm]);

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2023; year--) {
      years.push(year);
    }
    return years;
  };


  if (loading) return <Loader message={t('loadingData')} />;
  
  if (!matrix || !matrix.families || matrix.families.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">{t('noContributionData')}</p>
          <p className="text-gray-400 text-sm mt-2">
            The backend endpoint /public/vdf/contributions/monthly-matrix may not be implemented yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar size={32} className="text-teal-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">{t('monthlyContributions')}</h2>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchByFamilyHeadName')}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-medium"
          >
            {generateYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contribution Form Modal */}
      {showForm && <VdfContributionForm family={editingFamily} year={selectedYear} onClose={handleFormClose} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">{t('totalFamilies')}</h3>
          <p className="text-3xl font-bold mt-2">{filteredFamilies.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">{t('totalPaid')} (All-time)</h3>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(
              filteredFamilies.reduce((sum, f) => sum + (f.totalPaidAllTime || 0), 0)
            )}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">{t('totalDues')}</h3>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(
              filteredFamilies.reduce((sum, f) => sum + (f.totalDueAllTime || 0), 0)
            )}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-medium opacity-90">{selectedYear} {t('totalPaid')}</h3>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(
              filteredFamilies.reduce((sum, f) => sum + (f.totalPaid || 0), 0)
            )}
          </p>
        </div>
      </div>

      {/* Family List with Collapsible Months - Table Format */}
      <div className="space-y-2">
        {filteredFamilies.map((family) => (
          <div key={family.familyConfigId} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Family Header - Table Row Format */}
            <div 
              onClick={() => setExpandedFamily(expandedFamily === family.familyConfigId ? null : family.familyConfigId)}
              className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 py-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-200 gap-3 md:gap-0"
            >
              {/* Family Name Column - Full width on mobile, flex on desktop */}
              <div className="flex items-center space-x-3 flex-1 min-w-0 w-full md:w-auto">
                {expandedFamily === family.familyConfigId ? (
                  <ChevronDown size={20} className="text-teal-600 flex-shrink-0" />
                ) : (
                  <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                )}
                <h3 className="font-semibold text-gray-900 break-words md:truncate text-base md:text-sm">{family.memberName || family.familyHeadName}</h3>
              </div>

              {/* Summary Columns - Stack on mobile, horizontal on desktop */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-8 text-sm flex-shrink-0 w-full md:w-auto md:ml-4">
                {/* Column 1: Total Paid (All-time) */}
                <div className="text-left md:text-right w-auto md:w-32">
                  <p className="text-gray-500 text-xs mb-1 font-medium">Total Paid</p>
                  <p className="font-semibold text-green-600 text-sm">{formatCurrency(family.totalPaidAllTime || 0)}</p>
                </div>

                {/* Column 2: Total Due (All-time) */}
                <div className="text-left md:text-right w-auto md:w-32">
                  <p className="text-gray-500 text-xs mb-1 font-medium">Total Due</p>
                  <p className="font-semibold text-red-600 text-sm">{formatCurrency(family.totalDueAllTime || 0)}</p>
                </div>

                {/* Column 3: This Year Paid */}
                <div className="text-left md:text-right w-auto md:w-32">
                  <p className="text-gray-500 text-xs mb-1 font-medium">{selectedYear} Paid</p>
                  <p className="font-semibold text-purple-600 text-sm">{formatCurrency(family.totalPaid || 0)}</p>
                </div>

                {/* Column 4: Edit Button (Admin only) */}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditFamily(family);
                    }}
                    className="text-teal-600 hover:text-teal-900 font-medium text-sm flex items-center space-x-1 whitespace-nowrap"
                    title="Edit"
                  >
                    <Edit size={16} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Content - Months Details Grid */}
            {expandedFamily === family.familyConfigId && (
              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-4">Monthly Details - {selectedYear}</h4>
                <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-6 gap-3">
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
                      const displayName = family.memberName || family.familyHeadName;
                      const confirmMsg = isExempted
                        ? `Remove exemption for ${displayName} - ${monText}?`
                        : `Mark ${displayName} as exempt for ${monText}?`;
                      if (!window.confirm(confirmMsg)) return;

                      try {
                        if (!isExempted) {
                          await vdfService.createFamilyExemption({ familyId: family.familyConfigId || family.familyId || family.family_id, monthYear: monText, reason: 'Marked exempt via UI' });
                        } else {
                          await vdfService.deleteFamilyExemption(family.familyConfigId || family.familyId || family.family_id, monText);
                        }
                        await fetchMatrix();
                      } catch (err) {
                        console.error('Error toggling exemption:', err);
                        alert(t('error') + ': ' + (err?.message || err));
                      }
                    };

                    return (
                      <div key={idx} className="bg-white p-3 rounded border border-gray-200 text-center hover:shadow-md transition">
                        <div className="font-medium text-gray-700 mb-2 text-sm">{month}</div>
                        {isPaid ? (
                          <CheckCircle size={16} className="text-green-600 mx-auto mb-2" />
                        ) : isExempted ? (
                          <Calendar size={16} className="text-blue-500 mx-auto mb-2" />
                        ) : (
                          <XCircle size={16} className="text-gray-300 mx-auto mb-2" />
                        )}

                        <span className={`font-semibold block text-xs mb-2 ${isPaid ? 'text-green-600' : isExempted ? 'text-blue-600' : 'text-gray-500'}`}>
                          {isExempted ? 'Exempt' : formatCurrency(monthPaid)}
                        </span>

                        {isAdmin && (
                          <button
                            onClick={handleToggleExempt}
                            className={`text-xs px-2 py-1 rounded font-medium transition ${isExempted ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-teal-50 text-teal-600 border border-teal-100 hover:bg-teal-100'}`}
                          >
                            {isExempted ? 'Undo' : 'Exempt'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* No Results Message */}
        {filteredFamilies.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No families found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VdfMonthlyContribution;
