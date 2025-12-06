// src/components/admin/vdf/VdfFamilyForm.jsx
import React, { useState, useEffect } from 'react';
import { vdfService } from "../../services/vdfService"
import { adminService } from '../../services/adminService';
import { formatDateForInput } from '../../utils/dateFormatter';
import { X } from 'lucide-react';

const VdfFamilyForm = ({ family, onClose }) => {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    memberId: '',
    familyHeadName: '',
    isContributionEnabled: false,
    effectiveFrom: formatDateForInput(new Date()),
    monthlyAmount: '20.00',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMembers();
    if (family) {
      setFormData({
        memberId: family.memberId,
        familyHeadName: family.familyHeadName,
        isContributionEnabled: family.isContributionEnabled || false,
        effectiveFrom: family.effectiveFrom 
          ? formatDateForInput(new Date(family.effectiveFrom))
          : formatDateForInput(new Date()),
        monthlyAmount: family.monthlyAmount?.toString() || '20.00',
        notes: family.notes || ''
      });
    }
  }, [family]);

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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMemberSelect = (e) => {
    const memberId = e.target.value;
    setFormData(prev => ({
      ...prev,
      memberId
    }));
    
    // Auto-fill family head name from selected member
    const selectedMember = members.find(m => m.id === memberId);
    if (selectedMember && !formData.familyHeadName) {
      setFormData(prev => ({
        ...prev,
        familyHeadName: `${selectedMember.firstName} ${selectedMember.lastName}`
      }));
    }
    
    if (errors.memberId) {
      setErrors(prev => ({
        ...prev,
        memberId: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.memberId) {
      newErrors.memberId = 'Please select a member';
    }

    if (!formData.familyHeadName.trim()) {
      newErrors.familyHeadName = 'Family head name is required';
    }

    if (!formData.monthlyAmount) {
      newErrors.monthlyAmount = 'Monthly amount is required';
    } else if (parseFloat(formData.monthlyAmount) <= 0) {
      newErrors.monthlyAmount = 'Amount must be greater than 0';
    }

    if (formData.isContributionEnabled && !formData.effectiveFrom) {
      newErrors.effectiveFrom = 'Effective date is required when enabling contribution';
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
        familyHeadName: formData.familyHeadName.trim(),
        isContributionEnabled: formData.isContributionEnabled,
        effectiveFrom: formData.isContributionEnabled ? formData.effectiveFrom : null,
        monthlyAmount: parseFloat(formData.monthlyAmount),
        notes: formData.notes.trim()
      };

      if (family) {
        await vdfService.updateFamilyConfig(family.id, payload);
        alert('Family configuration updated successfully');
      } else {
        await vdfService.createFamilyConfig(payload);
        alert('Family configuration created successfully');
      }
      onClose(true);
    } catch (error) {
      console.error('Error saving family config:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save family configuration';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            {family ? 'Edit Family Configuration' : 'Add Family to VDF'}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Member (Head of Family) <span className="text-red-500">*</span>
            </label>
            {loadingMembers ? (
              <p className="text-sm text-gray-500">Loading members...</p>
            ) : (
              <select
                name="memberId"
                value={formData.memberId}
                onChange={handleMemberSelect}
                disabled={!!family} // Can't change member for existing config
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  errors.memberId ? 'border-red-500' : 'border-gray-300'
                } ${family ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
            {family && (
              <p className="text-xs text-gray-500 mt-1">Member cannot be changed after creation</p>
            )}
          </div>

          {/* Family Head Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Family Head Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="familyHeadName"
              value={formData.familyHeadName}
              onChange={handleChange}
              placeholder="Enter family head name"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                errors.familyHeadName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.familyHeadName && (
              <p className="text-red-500 text-xs mt-1">{errors.familyHeadName}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              This name will be displayed in contribution records
            </p>
          </div>

          {/* Monthly Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Contribution Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="monthlyAmount"
              value={formData.monthlyAmount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="20.00"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                errors.monthlyAmount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.monthlyAmount && (
              <p className="text-red-500 text-xs mt-1">{errors.monthlyAmount}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Default: ₹20 per month</p>
          </div>

          {/* Enable Contribution */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="isContributionEnabled"
                name="isContributionEnabled"
                checked={formData.isContributionEnabled}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <div className="flex-1">
                <label htmlFor="isContributionEnabled" className="block text-sm font-medium text-gray-700 cursor-pointer">
                  Enable Monthly Contribution
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  When enabled, this family will be required to pay monthly contributions
                </p>
              </div>
            </div>

            {/* Effective From Date - Only show if enabled */}
            {formData.isContributionEnabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="effectiveFrom"
                  value={formData.effectiveFrom}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    errors.effectiveFrom ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.effectiveFrom && (
                  <p className="text-red-500 text-xs mt-1">{errors.effectiveFrom}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Contributions will be tracked from this date onwards
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> By default, families are not required to contribute. 
              Enable contribution only when the family agrees to participate in VDF.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || loadingMembers}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : family ? 'Update Configuration' : 'Add Family'}
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

export default VdfFamilyForm;