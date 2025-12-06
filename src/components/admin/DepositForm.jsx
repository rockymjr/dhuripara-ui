import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { X } from 'lucide-react';
import { formatDateForInput } from '../../utils/dateFormatter';

const DepositForm = ({ deposit, onClose }) => {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    depositDate: formatDateForInput(new Date()),
    interestRate: '2.5',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMembers();
    if (deposit) {
      setFormData({
        memberId: deposit.memberId,
        amount: deposit.amount.toString(),
        depositDate: formatDateForInput(new Date(deposit.depositDate))
      });
    }
  }, [deposit]);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const data = await adminService.getAllMembers();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      alert('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.memberId) {
      newErrors.memberId = 'Please select a member';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.depositDate) {
      newErrors.depositDate = 'Deposit date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        memberId: formData.memberId,
        amount: parseFloat(formData.amount),
        depositDate: formData.depositDate
      };

      if (deposit) {
        await adminService.updateDeposit(deposit.id, payload);
        alert('Deposit updated successfully');
      } else {
        await adminService.createDeposit(payload);
        alert('Deposit recorded successfully');
      }
      onClose(true);
    } catch (error) {
      console.error('Error saving deposit:', error);
      alert(error.response?.data?.message || 'Failed to save deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            {deposit ? 'Edit Deposit' : 'Record New Deposit'}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Member <span className="text-red-500">*</span>
            </label>
            {loadingMembers ? (
              <p className="text-sm text-gray-500">Loading members...</p>
            ) : (
              <select
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.memberId ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">-- Select Member --</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName} {member.phone && `- ${member.phone}`}
                  </option>
                ))}
              </select>
            )}
            {errors.memberId && (
              <p className="text-red-500 text-xs mt-1">{errors.memberId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="Enter amount (no limits)"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Interest Rate: 2.5% per month (no amount limit)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deposit Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="depositDate"
              value={formData.depositDate}
              onChange={handleChange}
              max={formatDateForInput(new Date())}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.depositDate ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.depositDate && (
              <p className="text-red-500 text-xs mt-1">{errors.depositDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (% per month) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              min="0.1"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Default: 2.5% per month</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-500 text-xs">(Admin Only)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Internal notes (not visible to members)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {deposit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Editing will recalculate interest based on the new values
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || loadingMembers}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : deposit ? 'Update Deposit' : 'Record Deposit'}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositForm;