// src/components/vdf/VdfContributionForm.jsx
import React, { useState, useEffect } from 'react';
import { vdfService } from '../../services/vdfService';
import { X } from 'lucide-react';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const VdfContributionForm = ({ family, year, onClose }) => {
  const [monthlyContributions, setMonthlyContributions] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loadingData, setLoadingData] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};
    let hasAnyValue = false;

    MONTHS.forEach(month => {
      const amount = monthlyContributions[month.value];
      if (amount && amount.trim()) {
        hasAnyValue = true;
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          newErrors[month.value] = 'Invalid amount';
        }
      }
    });

    if (!hasAnyValue) {
      newErrors.general = 'Please enter amount for at least one month';
    }

    if (!paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
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
      
      // Prepare contributions array
      const contributions = MONTHS
        .filter(month => monthlyContributions[month.value] && monthlyContributions[month.value].trim())
        .map(month => ({
          month: month.value,
          amount: parseFloat(monthlyContributions[month.value])
        }));

      const payload = {
        familyConfigId: family.familyConfigId,
        year: year,
        paymentDate: paymentDate,
        notes: notes || null,
        contributions: contributions
      };

      await vdfService.recordBulkContributions(payload);
      alert('Contributions saved successfully');
      onClose(true);
    } catch (error) {
      console.error('Error saving contributions:', error);
      alert('Failed to save contributions: ' + (error.response?.data?.message || error.message));
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

          {/* Monthly Contributions Grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Monthly Amounts (₹) <span className="text-red-500">*</span>
            </label>
            
            {loadingData ? (
              <p className="text-gray-500 text-center py-4">Loading existing contributions...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {MONTHS.map(month => (
                  <div key={month.value}>
                    <label className="text-sm text-gray-600 mb-1 block">
                      {month.label}
                    </label>
                    <input
                      type="number"
                      value={monthlyContributions[month.value] || ''}
                      onChange={(e) => handleAmountChange(month.value, e.target.value)}
                      placeholder="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors[month.value] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[month.value] && (
                      <p className="text-red-500 text-xs mt-1">{errors[month.value]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount:</p>
            <p className="text-2xl font-bold text-teal-600">
              ₹{Object.values(monthlyContributions).reduce((sum, val) => {
                const amount = parseFloat(val) || 0;
                return sum + amount;
              }, 0).toFixed(2)}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingData}
              className="flex-1 px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
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
