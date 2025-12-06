import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateForInput } from '../../utils/dateFormatter';
import { X, Calculator } from 'lucide-react';

const DepositReturn = ({ deposit, onClose }) => {
  const [returnDate, setReturnDate] = useState(formatDateForInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [calculatedData, setCalculatedData] = useState(null);

  const calculateInterest = () => {
    const depositDate = new Date(deposit.depositDate);
    const returnDateObj = new Date(returnDate);
    
    const daysDiff = Math.floor((returnDateObj - depositDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      alert('Return date cannot be before deposit date');
      return;
    }

    // Calculate months: 1-30 days = 1 month, 31-60 = 2 months, etc.
    const months = Math.ceil(daysDiff / 30);
    const interest = (deposit.amount * 2.5 * months) / 100;
    const totalReturn = deposit.amount + interest;

    setCalculatedData({
      days: daysDiff,
      months: months,
      interest: interest,
      totalReturn: totalReturn
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!calculatedData) {
      alert('Please calculate interest first');
      return;
    }

    if (!window.confirm(`Return this deposit with total amount of ${formatCurrency(calculatedData.totalReturn)}?`)) {
      return;
    }

    setLoading(true);

    try {
      await adminService.returnDeposit(deposit.id, returnDate);
      alert('Deposit returned successfully');
      onClose(true);
    } catch (error) {
      console.error('Error returning deposit:', error);
      alert(error.response?.data?.message || 'Failed to return deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Return Deposit</h3>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Deposit Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Deposit Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member:</span>
                <span className="font-medium">{deposit.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit Amount:</span>
                <span className="font-medium">{formatCurrency(deposit.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit Date:</span>
                <span className="font-medium">{formatDate(deposit.depositDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-medium">2.5% per month</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Return Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => {
                  setReturnDate(e.target.value);
                  setCalculatedData(null);
                }}
                min={deposit.depositDate}
                max={formatDateForInput(new Date())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="button"
              onClick={calculateInterest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition"
            >
              <Calculator size={20} />
              <span>Calculate Interest</span>
            </button>

            {calculatedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-green-800 mb-2">Calculation Result</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Days:</span>
                  <span className="font-medium">{calculatedData.days} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Months (rounded):</span>
                  <span className="font-medium">{calculatedData.months} months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Principal:</span>
                  <span className="font-medium">{formatCurrency(deposit.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Interest:</span>
                  <span className="font-medium text-green-600">{formatCurrency(calculatedData.interest)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total Return:</span>
                  <span className="text-green-700">{formatCurrency(calculatedData.totalReturn)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  * Interest calculated: 1-30 days = 1 month, 31-60 days = 2 months, etc.
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading || !calculatedData}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Return Deposit'}
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
    </div>
  );
};

export default DepositReturn;