import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateForInput } from '../../utils/dateFormatter';
import { X, Calculator, DollarSign } from 'lucide-react';

const LoanPayment = ({ loan, onClose }) => {
  const [formData, setFormData] = useState({
    paymentAmount: '',
    paymentDate: formatDateForInput(new Date()),
    discountAmount: '0',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [calculatedData, setCalculatedData] = useState(null);
  const [errors, setErrors] = useState({});

  const calculateCurrentStatus = () => {
    const loanDate = new Date(loan.loanDate);
    const today = new Date(formData.paymentDate);
    
    const daysDiff = Math.floor((today - loanDate) / (1000 * 60 * 60 * 24));
    const months = Math.ceil(daysDiff / 30);
    
    // Calculate interest on FULL loan amount (not reduced by payments)
    const interest = (loan.loanAmount * 5 * months) / 100;
    const totalOwed = loan.loanAmount + interest;
    
    const paymentAmount = parseFloat(formData.paymentAmount) || 0;
    const discount = parseFloat(formData.discountAmount) || 0;
    
    const totalPaidSoFar = (loan.paidAmount || 0) + paymentAmount;
    const totalDiscountSoFar = (loan.discountAmount || 0) + discount;
    const totalPaidWithDiscount = totalPaidSoFar + totalDiscountSoFar;
    
    const remaining = totalOwed - totalPaidWithDiscount;
    const willBeClosed = remaining <= 0;

    setCalculatedData({
      days: daysDiff,
      months: months,
      interest: interest,
      totalOwed: totalOwed,
      paymentAmount: paymentAmount,
      discount: discount,
      totalPaidWithDiscount: totalPaidWithDiscount,
      remaining: remaining > 0 ? remaining : 0,
      willBeClosed: willBeClosed
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setCalculatedData(null);
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.paymentAmount || parseFloat(formData.paymentAmount) <= 0) {
      newErrors.paymentAmount = 'Payment amount must be greater than 0';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    const discount = parseFloat(formData.discountAmount) || 0;
    if (discount < 0) {
      newErrors.discountAmount = 'Discount cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!calculatedData) {
      alert('Please calculate first');
      return;
    }

    const confirmMessage = calculatedData.willBeClosed
      ? `This payment will CLOSE the loan. Proceed?`
      : `Add payment of ${formatCurrency(calculatedData.paymentAmount)}${calculatedData.discount > 0 ? ` with discount of ${formatCurrency(calculatedData.discount)}` : ''}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        paymentAmount: parseFloat(formData.paymentAmount),
        paymentDate: formData.paymentDate,
        discountAmount: parseFloat(formData.discountAmount),
        notes: formData.notes
      };

      await adminService.addLoanPayment(loan.id, payload);
      alert('Payment added successfully');
      onClose(true);
    } catch (error) {
      console.error('Error adding payment:', error);
      alert(error.response?.data?.message || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Add Loan Payment</h3>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Loan Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <DollarSign size={20} className="mr-2 text-blue-600" />
              Current Loan Status
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Member:</span>
                <span className="font-medium ml-2">{loan.memberName}</span>
              </div>
              <div>
                <span className="text-gray-600">Loan Amount:</span>
                <span className="font-medium ml-2">{formatCurrency(loan.loanAmount)}</span>
              </div>
              <div>
                <span className="text-gray-600">Loan Date:</span>
                <span className="font-medium ml-2">{formatDate(loan.loanDate)}</span>
              </div>
              <div>
                <span className="text-gray-600">Paid So Far:</span>
                <span className="font-medium ml-2 text-green-600">
                  {formatCurrency(loan.paidAmount || 0)}
                </span>
              </div>
              {loan.discountAmount > 0 && (
                <div>
                  <span className="text-gray-600">Discount Given:</span>
                  <span className="font-medium ml-2 text-orange-600">
                    {formatCurrency(loan.discountAmount)}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Current Interest:</span>
                <span className="font-medium ml-2 text-red-600">
                  {formatCurrency(loan.currentInterest || 0)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Remaining (with today's interest):</span>
                <span className="font-bold ml-2 text-red-700 text-lg">
                  {formatCurrency(loan.currentRemaining || loan.remainingAmount || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              ℹ️ <strong>Important:</strong> Interest is always calculated on the FULL loan amount 
              ({formatCurrency(loan.loanAmount)}) until the loan is fully paid, regardless of partial payments.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="paymentAmount"
                  value={formData.paymentAmount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="Enter payment amount"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.paymentAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.paymentAmount && (
                  <p className="text-red-500 text-xs mt-1">{errors.paymentAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  min={loan.loanDate}
                  max={formatDateForInput(new Date())}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.paymentDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.paymentDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount (₹) <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="number"
                name="discountAmount"
                value={formData.discountAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter discount if applicable"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.discountAmount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.discountAmount && (
                <p className="text-red-500 text-xs mt-1">{errors.discountAmount}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Discount reduces the total amount owed (e.g., waiving part of interest)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                placeholder="Add any notes about this payment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="button"
              onClick={calculateCurrentStatus}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition"
            >
              <Calculator size={20} />
              <span>Calculate Payment Impact</span>
            </button>

            {calculatedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-green-800 mb-2">Payment Calculation</h4>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2 bg-white p-2 rounded">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Days elapsed:</span>
                      <span className="font-medium">{calculatedData.days} days ({calculatedData.months} months)</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Loan Principal:</span>
                      <span className="font-medium">{formatCurrency(loan.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Interest @ 5%/month:</span>
                      <span className="font-medium text-red-600">{formatCurrency(calculatedData.interest)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>Total Owed:</span>
                      <span>{formatCurrency(calculatedData.totalOwed)}</span>
                    </div>
                  </div>

                  <div className="col-span-2 bg-blue-50 p-2 rounded">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">This Payment:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(calculatedData.paymentAmount)}
                      </span>
                    </div>
                    {calculatedData.discount > 0 && (
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Discount:</span>
                        <span className="font-medium text-orange-600">
                          {formatCurrency(calculatedData.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">Previously Paid:</span>
                      <span className="font-medium">{formatCurrency(loan.paidAmount || 0)}</span>
                    </div>
                    {loan.discountAmount > 0 && (
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Previous Discount:</span>
                        <span className="font-medium">{formatCurrency(loan.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>Total Paid (with discount):</span>
                      <span className="text-green-700">
                        {formatCurrency(calculatedData.totalPaidWithDiscount)}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    {calculatedData.willBeClosed ? (
                      <div className="bg-green-100 border-2 border-green-500 p-3 rounded-lg text-center">
                        <p className="text-green-800 font-bold text-lg">
                          ✓ This payment will CLOSE the loan
                        </p>
                        <p className="text-green-700 text-sm mt-1">
                          Total paid will exceed amount owed
                        </p>
                      </div>
                    ) : (
                      <div className="bg-orange-100 border-2 border-orange-500 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-orange-800 font-bold">Remaining After Payment:</span>
                          <span className="text-orange-900 font-bold text-xl">
                            {formatCurrency(calculatedData.remaining)}
                          </span>
                        </div>
                        <p className="text-orange-700 text-xs mt-2">
                          ⚠️ Interest continues on full ₹{loan.loanAmount.toFixed(2)} until loan is closed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading || !calculatedData}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Add Payment'}
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

export default LoanPayment;