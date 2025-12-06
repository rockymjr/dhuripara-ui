// src/components/vdf/VdfMonthlyContribution.jsx
import React, { useEffect, useState } from 'react';
import { vdfService } from '../../services/vdfService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useLanguage } from '../../context/LanguageContext';
import Loader from '../common/Loader';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const VdfMonthlyContribution = () => {
  const { t } = useLanguage();
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMatrix();
  }, [selectedYear]);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const data = await vdfService.getPublicMonthlyMatrix(selectedYear);
      setMatrix(data);
    } catch (error) {
      console.error('Error fetching contribution matrix:', error);
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
  if (!matrix || !matrix.families) {
    return <div className="text-center py-8 text-gray-500">No data available</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
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

      {/* Mobile View - Cards */}
      <div className="block lg:hidden space-y-4">
        {matrix.families.map((family) => (
          <div key={family.familyId} className="bg-white rounded-lg shadow p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900">{family.familyHeadName}</h3>
              <p className="text-sm text-gray-600">{family.memberName}</p>
            </div>
            
            {/* Month Status Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {MONTHS.map((month, idx) => {
                const monthKey = `month${idx + 1}`;
                const monthData = family.months[monthKey];
                const isPaid = monthData?.paid;
                
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
            
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
              <div>
                <p className="text-gray-600">Paid:</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(family.totalPaid)}
                </p>
                <p className="text-xs text-gray-500">({family.paidMonths} months)</p>
              </div>
              <div>
                <p className="text-gray-600">Due:</p>
                <p className="font-semibold text-red-600">
                  {formatCurrency(family.totalDue)}
                </p>
                <p className="text-xs text-gray-500">({family.pendingMonths} months)</p>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {matrix.families.map((family) => (
              <tr key={family.familyId} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">{family.familyHeadName}</p>
                    <p className="text-sm text-gray-500">{family.memberName}</p>
                  </div>
                </td>
                
                {MONTHS.map((month, idx) => {
                  const monthKey = `month${idx + 1}`;
                  const monthData = family.months[monthKey];
                  const isPaid = monthData?.paid;
                  
                  return (
                    <td key={idx} className="px-2 py-3 text-center">
                      {isPaid ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle size={20} className="text-green-600" />
                          <span className="text-xs text-gray-600 mt-1">
                            {formatCurrency(monthData.amount)}
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
                    {family.paidMonths} months
                  </div>
                </td>
                
                <td className="px-4 py-3 text-center">
                  <div className="font-semibold text-red-600">
                    {formatCurrency(family.totalDue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {family.pendingMonths} months
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VdfMonthlyContribution;