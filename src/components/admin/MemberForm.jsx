import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { X, Key } from 'lucide-react';

const MemberForm = ({ member, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    pin: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPinGenerator, setShowPinGenerator] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        phone: member.phone || '',
        pin: member.pin || ''
      });
    }
  }, [member]);

  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setFormData(prev => ({ ...prev, pin }));
    setShowPinGenerator(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate PIN input - only allow 4 digits
    if (name === 'pin' && value && !/^\d{0,4}$/.test(value)) {
      return;
    }
    
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Phone is optional, but if provided, must be 10 digits
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits if provided';
    }

    // PIN validation - optional, but if provided must be 4 digits
    if (formData.pin && !/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must be exactly 4 digits';
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
      if (member) {
        await adminService.updateMember(member.id, formData);
        alert('Member updated successfully');
      } else {
        await adminService.createMember(formData);
        alert('Member added successfully');
      }
      onClose(true);
    } catch (error) {
      console.error('Error saving member:', error);
      alert(error.response?.data?.message || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            {member ? 'Edit Member' : 'Add New Member'}
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
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-gray-500 text-xs">(Required for login)</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
              maxLength="10"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Required for member login access</p>
          </div>

          {/* NEW PIN FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Login PIN <span className="text-gray-500 text-xs">(4 digits)</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                placeholder="1234"
                maxLength="4"
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.pin ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={generateRandomPin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition flex items-center space-x-1"
                title="Generate Random PIN"
              >
                <Key size={18} />
                <span>Generate</span>
              </button>
            </div>
            {errors.pin && (
              <p className="text-red-500 text-xs mt-1">{errors.pin}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.pin && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium">
                    Current PIN: {formData.pin}
                  </p>
    <p className="text-xs text-blue-600 mt-1">
      Member can change PIN after first login
    </p>
  </div>
)}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isOperator"
              checked={formData.isOperator}
              onChange={(e) => setFormData(prev => ({ ...prev, isOperator: e.target.checked }))}
              className="..."
            />
            <label className="text-sm">Make this member an Operator (view-only access)</label>
          </div>

          {formData.phone && formData.pin && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium">
                ✓ Member Login Credentials
              </p>
              <p className="text-xs text-green-700 mt-1">
                Phone: {formData.phone}<br />
                PIN: {formData.pin}
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : member ? 'Update' : 'Add Member'}
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

export default MemberForm;