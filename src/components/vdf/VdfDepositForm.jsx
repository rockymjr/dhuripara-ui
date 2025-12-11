// src/components/vdf/VdfDepositForm.jsx
import React, { useState, useEffect } from 'react';
import { vdfService } from '../../services/vdfService';
import { useLanguage } from '../../context/LanguageContext';
import { X } from 'lucide-react';

// For VDF deposit form we keep only category, date, amount and notes.

const VdfDepositForm = ({ deposit, onClose }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    depositDate: deposit?.depositDate || new Date().toISOString().split('T')[0],
    categoryId: deposit?.categoryId || deposit?.category?.id || '',
    memberId: deposit?.memberId || '',
    amount: deposit?.amount?.toString() || '',
    notes: deposit?.notes || ''
  });

  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchMembers();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await vdfService.getDepositCategories();
      console.log('Fetched deposit categories:', data);
      setCategories(Array.isArray(data) ? data : (data?.content || []));
    } catch (error) {
      console.error('Error fetching deposit categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const data = await vdfService.getMembers();
      console.log('Fetched members:', data);
      setMembers(Array.isArray(data) ? data : (data?.content || []));
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.depositDate) {
      newErrors.depositDate = 'Date is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      // For VDF deposits we don't collect sourceType/month in the form.
      // Payload uses categoryId instead of sourceType now. Backend maps category via deposit_category_id.
      const payload = {
        depositDate: formData.depositDate,
        memberId: formData.memberId || null,
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        notes: formData.notes || null
      };

      if (deposit?.id) {
        await vdfService.updateDeposit(deposit.id, payload);
        alert(t('updated'));
      } else {
        await vdfService.createDeposit(payload);
        alert(t('created'));
      }
      onClose(true);
    } catch (error) {
      console.error('Error saving deposit:', error);
      alert('Failed to save deposit: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            {deposit ? t('editDeposit') : t('addDeposit')}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="depositDate"
              value={formData.depositDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.depositDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.depositDate && (
              <p className="text-red-500 text-xs mt-1">{errors.depositDate}</p>
            )}
          </div>

          

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={loadingCategories}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              } ${loadingCategories ? 'opacity-50' : ''}`}
            >
              <option value="">
                {loadingCategories ? 'Loading categories...' : 'Select Category'}
              </option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
            )}
          </div>

          {/* Member (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member (Optional)
            </label>
            <select
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              disabled={loadingMembers}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                loadingMembers ? 'opacity-50' : ''
              }`}
            >
              <option value="">
                {loadingMembers ? 'Loading members...' : 'Select Member (Optional)'}
              </option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.memberHeadName || member.name}
                </option>
              ))}
            </select>
          </div>

          

          

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Add any additional notes"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VdfDepositForm;
