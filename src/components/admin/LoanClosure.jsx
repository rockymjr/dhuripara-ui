import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateForInput } from '../../utils/dateFormatter';
import { X, Calculator } from 'lucide-react';

const LoanClosure = ({ loan, onClose }) => {
  const [returnDate, setReturnDate] = useState(formatDateForInput(new Date()));
  const [paymentAmount, setPaymentAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [calculatedData, setCalculatedData] = useState(null);

  const calculateInterest = () => {
    const loanDate = new Date(loan.loanDate);
    const returnDateObj = new Date(returnDate);
    
    const daysDiff = Math.floor((returnDateObj - loanDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      alert('Return date cannot be before loan date');
      return;
    }

    const months = Math.ceil(daysDiff / 30);
    const interest = (loan.loanAmount * 5 * months) / 100;
    const totalRepayment = loan.loanAmount + interest;
    
    const payment = parseFloat(paymentAmount) || 0;
    const discount = parseFloat(discountAmount) || 0;
    const alreadyPaid = loan.paidAmount || 0;
    const alreadyDiscount = loan.discountAmount || 0;
    
    const totalPaidWithDiscount = alreadyPaid + payment + alreadyDiscount + discount;
    const finalAmount = totalRepayment - totalPaidWithDiscount;

    setCalculatedData({
      days: daysDiff,
      months: months,
      interest: interest,
      totalRepayment: totalRepayment,
      payment: payment,
      discount: discount,
      alreadyPaid: alreadyPaid,
      alreadyDiscount: alreadyDiscount,
      finalAmount: finalAmount > 0 ? finalAmount : 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!calculatedData) {
      alert('Please calculate interest first');
      return;
    }

    const confirmMsg = `Close this loan?\n\nTotal: ${formatCurrency(calculatedData.totalRepayment)}\n` +
      `Already Paid: ${formatCurrency(calculatedData.alreadyPaid)}\n` +
      `Already Discount: ${formatCurrency(calculatedData.alreadyDiscount)}\n` +
      `This Payment: ${formatCurrency(calculatedData.payment)}\n` +
      `This Discount: ${formatCurrency(calculatedData.discount)}\n` +
      `Final Outstanding: ${formatCurrency(calculatedData.finalAmount)}`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        returnDate: returnDate,
        discountAmount: parseFloat(discountAmount) || 0
      };

      if (paymentAmount && parseFloat(paymentAmount) > 0) {
        payload.paymentAmount = parseFloat(paymentAmount);
      }

      await adminService.closeLoan(loan.id, payload);
      alert('Loan closed successfully');
      onClose(true);
    } catch (error) {
      console.error('Error closing loan:', error);
      alert(error.response?.data?.message || 'Failed to close loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Close Loan (Final Settlement)</h3>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Loan Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Loan Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member:</span>
                <span className="font-medium">{loan.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Amount:</span>
                <span className="font-medium">{formatCurrency(loan.loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Date:</span>
                <span className="font-medium">{formatDate(loan.loanDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Already Paid:</span>
                <span className="font-medium text-green-600">{formatCurrency(loan.paidAmount || 0)}</span>
              </div>
              {loan.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Already Discount:</span>
                  <span className="font-medium text-orange-600">{formatCurrency(loan.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-medium">5% per month</span>
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
                min={loan.loanDate}
                max={formatDateForInput(new Date())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Payment Amount (₹) <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    setCalculatedData(null);
                  }}
                  min="0"
                  step="0.01"
                  placeholder="Enter if making final payment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Amount (₹) <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => {
                    setDiscountAmount(e.target.value);
                    setCalculatedData(null);
                  }}
                  min="0"
                  step="0.01"
                  placeholder="Enter discount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={calculateInterest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition"
            >
              <Calculator size={20} />
              <span>Calculate Final Settlement</span>
            </button>

            {calculatedData && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-red-800 mb-2">Settlement Calculation</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Days:</span>
                  <span className="font-medium">{calculatedData.days} days ({calculatedData.months} months)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Principal:</span>
                  <span className="font-medium">{formatCurrency(loan.loanAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Interest @ 5%/month:</span>
                  <span className="font-medium text-red-600">{formatCurrency(calculatedData.interest)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-2">
                  <span>Total Repayment:</span>
                  <span>{formatCurrency(calculatedData.totalRepayment)}</span>
                </div>
                
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Already Paid:</span>
                    <span className="text-green-600">-{formatCurrency(calculatedData.alreadyPaid)}</span>
                  </div>
                  {calculatedData.alreadyDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Already Discount:</span>
                      <span className="text-orange-600">-{formatCurrency(calculatedData.alreadyDiscount)}</span>
                    </div>
                  )}
                  {calculatedData.payment > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">This Payment:</span>
                      <span className="text-green-600">-{formatCurrency(calculatedData.payment)}</span>
                    </div>
                  )}
                  {calculatedData.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">This Discount:</span>
                      <span className="text-orange-600">-{formatCurrency(calculatedData.discount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Final Outstanding:</span>
                  <span className={calculatedData.finalAmount > 0 ? 'text-red-700' : 'text-green-700'}>
                    {formatCurrency(calculatedData.finalAmount)}
                  </span>
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
                {loading ? 'Closing...' : 'Close Loan'}
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

export default LoanClosure;