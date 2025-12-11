// src/components/vdf/VdfContributionForm.jsx
import React, { useState, useEffect } from 'react';
import { vdfService } from '../../services/vdfService';
import { useLanguage } from '../../context/LanguageContext';
import { X } from 'lucide-react';

const VdfContributionForm = ({ family, year, onClose }) => {
  const { t } = useLanguage();
  const MONTHS = [
    { value: 1, label: t('jan') },
    { value: 2, label: t('feb') },
    { value: 3, label: t('mar') },
    { value: 4, label: t('apr') },
    { value: 5, label: t('may') },
    { value: 6, label: t('jun') },
    { value: 7, label: t('jul') },
    { value: 8, label: t('aug') },
    { value: 9, label: t('sep') },
    { value: 10, label: t('oct') },
    { value: 11, label: t('nov') },
    { value: 12, label: t('dec') }
  ];
  const [monthlyContributions, setMonthlyContributions] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [selectedExemptMonths, setSelectedExemptMonths] = useState([]);

  useEffect(() => {
    if (family) {
      fetchExistingContributions();
    }
  }, [family, year]);

  const fetchExistingContributions = async () => {
    if (!family) return;
    
    try {
      setLoadingData(true);
      const data = await vdfService.getFamilyContributions(family.familyConfigId, year);
      console.log('Fetched contributions:', data);
      
      // Initialize all months with existing values only, leave empty if no existing value
      const contributions = {};
      MONTHS.forEach(month => {
        const existing = data?.find(c => c.month === month.value);
        contributions[month.value] = existing ? existing.amount.toString() : '';
      });
      // initialize selected exemptions; backend may supply exemptions later
      setSelectedExemptMonths([]);
      setMonthlyContributions(contributions);
    } catch (error) {
      console.error('Error fetching contributions:', error);
      // Initialize with empty values if error
      const contributions = {};
      MONTHS.forEach(month => {
        contributions[month.value] = '';
      });
      setMonthlyContributions(contributions);
    } finally {
      setLoadingData(false);
    }
  };

  const pad = (n) => String(n).padStart(2, '0');

  const handleToggleSelectExempt = (monthValue) => {
    setSelectedExemptMonths(prev => {
      const exists = prev.includes(monthValue);
      if (exists) return prev.filter(m => m !== monthValue);
      return [...prev, monthValue];
    });
  };

  const handleMarkExempt = async () => {
    if (!family) return;
    if (!selectedExemptMonths || selectedExemptMonths.length === 0) {
      alert(t('required'));
      return;
    }

    const confirmMsg = t('confirmDelete');
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      const promises = selectedExemptMonths.map(monthValue => {
        const monthYear = `${year}-${pad(monthValue)}`;
        return vdfService.createFamilyExemption({ familyId: family.familyConfigId, monthYear, reason: notes || 'Marked exempt via UI' });
      });
      await Promise.all(promises);
      alert(t('updated'));
      onClose(true);
    } catch (err) {
      console.error('Error marking exemptions:', err);
      alert('Failed to mark exemptions: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleUnmarkExempt = async () => {
    if (!family) return;
    if (!selectedExemptMonths || selectedExemptMonths.length === 0) {
      alert('Please select one or more months to remove exemption');
      return;
    }

    const confirmMsg = `Remove exemption for selected months for ${family.familyHeadName}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      const promises = selectedExemptMonths.map(monthValue => {
        const monthYear = `${year}-${pad(monthValue)}`;
        return vdfService.deleteFamilyExemption(family.familyConfigId, monthYear);
      });
      await Promise.all(promises);
      alert('Selected months un-exempted');
      onClose(true);
    } catch (err) {
      console.error('Error removing exemptions:', err);
      alert('Failed to remove exemptions: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllExempt = () => {
    setSelectedExemptMonths(MONTHS.map(m => m.value));
  };

  const handleClearSelectedExempt = () => {
    setSelectedExemptMonths([]);
  };

  const handleClearAllAmounts = () => {
    if (!window.confirm('Set all months to 0? This will delete all contributions for this year.')) return;
    const contributions = {};
    MONTHS.forEach(m => {
      contributions[m.value] = '0';
    });
    setMonthlyContributions(contributions);
  };

  const handlePayAll = () => {
    const amount = family?.monthlyAmount || 20;
    const contributions = {};
    MONTHS.forEach(m => {
      contributions[m.value] = String(amount);
    });
    setMonthlyContributions(contributions);
  };

  const validateForm = () => {
    const newErrors = {};
    let hasAnyValue = false;
    let hasDeletion = false;

    MONTHS.forEach(month => {
      const amount = monthlyContributions[month.value];
      const isExempt = selectedExemptMonths.includes(month.value);
      
      // Skip validation if exempted
      if (isExempt) return;
      
      if (amount && amount.trim()) {
        const numAmount = parseFloat(amount);
        if (numAmount > 0) {
          hasAnyValue = true;
        } else if (numAmount === 0) {
          hasDeletion = true; // Mark as having a deletion attempt
        }
        if (isNaN(numAmount)) {
          newErrors[month.value] = 'Invalid amount';
        }
      }
    });

    // Allow if there are contributions OR deletions (zero values)
    if (!hasAnyValue && !hasDeletion && selectedExemptMonths.length === 0) {
      newErrors.general = 'Please enter amount for at least one month, mark months as exempt, or set amounts to 0 to delete';
    }

    if (!paymentDate && (hasAnyValue || hasDeletion)) {
      newErrors.paymentDate = 'Payment date is required when recording or updating contributions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmountChange = (monthValue, value) => {
    setMonthlyContributions(prev => ({
      ...prev,
      [monthValue]: value
    }));
    if (errors[monthValue]) {
      setErrors(prev => ({
        ...prev,
        [monthValue]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Prepare contributions array - include ALL months with values (including 0 for deletion)
      const contributions = MONTHS
        .filter(month => {
          // Skip if marked as exempt
          if (selectedExemptMonths.includes(month.value)) return false;
          // Include month if there's a value (including 0)
          const val = monthlyContributions[month.value];
          return val !== undefined && val !== null && val !== '';
        })
        .map(month => ({
          month: month.value,
          amount: parseFloat(monthlyContributions[month.value])
        }));

      if (contributions.length === 0) {
        alert('Please enter amounts for at least one month, or set to 0 to delete');
        setLoading(false);
        return;
      }

      // Check if this is only deletions (all zeros)
      const hasNonZeroAmounts = contributions.some(c => c.amount > 0);
      if (!hasNonZeroAmounts && !paymentDate) {
        // For deletion-only operations, we might not need a payment date
        // but let's require it to be consistent
      }

      const payload = {
        familyConfigId: family.familyConfigId || family.id,
        year: year,
        paymentDate: hasNonZeroAmounts ? paymentDate : new Date().toISOString().split('T')[0], // Use today if only deleting
        notes: notes || null,
        contributions: contributions
      };

      console.log('Submitting contributions payload:', JSON.stringify(payload, null, 2));
      const response = await vdfService.recordBulkContributions(payload);
      console.log('Response from server:', response);
      alert('Contributions updated successfully');
      onClose(true);
    } catch (error) {
      console.error('Full error object:', error);
      const errorMsg = error?.response?.data?.message || 
                      error?.response?.data?.error ||
                      error?.message ||
                      'Unknown error occurred';
      console.error('Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: errorMsg
      });
      alert('Failed to update contributions: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Contributions - {family?.familyHeadName}
            </h3>
            <p className="text-sm text-gray-600">{year}</p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <p className="text-red-500 text-sm">{errors.general}</p>
          )}

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.paymentDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.paymentDate && (
              <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Helper Buttons */}
          <div className="flex gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={handlePayAll}
              disabled={loading || loadingData}
              className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition disabled:opacity-50"
            >
              Fill All Months
            </button>
            <button
              type="button"
              onClick={handleSelectAllExempt}
              disabled={loading || loadingData}
              className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition disabled:opacity-50"
            >
              Select All Exempt
            </button>
            <button
              type="button"
              onClick={handleClearSelectedExempt}
              disabled={loading || loadingData}
              className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition disabled:opacity-50"
            >
              Clear Exemptions
            </button>
            <button
              type="button"
              onClick={handleClearAllAmounts}
              disabled={loading || loadingData}
              className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition disabled:opacity-50"
            >
              Delete All Months
            </button>
          </div>

          {/* Monthly Contributions Grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Monthly Amounts (₹) <span className="text-red-500">*</span>
            </label>
            
            {loadingData ? (
              <p className="text-gray-500 text-center py-4">Loading existing contributions...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {MONTHS.map(month => {
                  const isExempt = selectedExemptMonths.includes(month.value);
                  return (
                    <div key={month.value}>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600 mb-1 block">
                          {month.label}
                        </label>
                        <label className="flex items-center text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={isExempt}
                            onChange={() => handleToggleSelectExempt(month.value)}
                            className="mr-2 w-4 h-4"
                          />
                          Exempt
                        </label>
                      </div>
                      <input
                        type="number"
                        value={isExempt ? '' : (monthlyContributions[month.value] || '')}
                        onChange={(e) => handleAmountChange(month.value, e.target.value)}
                        placeholder="0"
                        step="0.01"
                        disabled={isExempt}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          isExempt ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                        } ${
                          errors[month.value] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[month.value] && (
                        <p className="text-red-500 text-xs mt-1">{errors[month.value]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount:</p>
            <p className="text-2xl font-bold text-teal-600">
              ₹{Object.entries(monthlyContributions).reduce((sum, [month, val]) => {
                // Don't count exempted months
                if (selectedExemptMonths.includes(parseInt(month))) return sum;
                const amount = parseFloat(val) || 0;
                return sum + amount;
              }, 0).toFixed(2)}
            </p>
            {selectedExemptMonths.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                ({selectedExemptMonths.length} month{selectedExemptMonths.length > 1 ? 's' : ''} marked as exempt)
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleMarkExempt}
              disabled={loading || loadingData || selectedExemptMonths.length === 0}
              className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-medium hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Mark Exempt (${selectedExemptMonths.length})`}
            </button>

            <button
              type="submit"
              disabled={loading || loadingData}
              className="ml-auto px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Contributions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VdfContributionForm;
