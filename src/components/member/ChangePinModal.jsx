import React, { useState } from 'react';
import { memberService } from '../../services/memberService';
import { X, Lock } from 'lucide-react';

const ChangePinModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    oldPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPin !== formData.confirmPin) {
      setError('New PIN and Confirm PIN do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await memberService.changePin(formData.oldPin, formData.newPin);
      alert('PIN changed successfully');
      onClose(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Lock className="mr-2" size={24} />
            Change PIN
          </h3>
          <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Old PIN <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.oldPin}
              onChange={(e) => setFormData({...formData, oldPin: e.target.value.replace(/\D/g, '')})}
              maxLength="4"
              placeholder="••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New PIN <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.newPin}
              onChange={(e) => setFormData({...formData, newPin: e.target.value.replace(/\D/g, '')})}
              maxLength="4"
              placeholder="••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New PIN <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.confirmPin}
              onChange={(e) => setFormData({...formData, confirmPin: e.target.value.replace(/\D/g, '')})}
              maxLength="4"
              placeholder="••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change PIN'}
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

export default ChangePinModal;