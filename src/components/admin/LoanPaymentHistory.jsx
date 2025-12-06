import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { X, History } from 'lucide-react';
import Loader from '../common/Loader';

const LoanPaymentHistory = ({ loan, onClose }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getLoanPaymentHistory(loan.id);
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      alert('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-2">
            <History size={24} className="text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">Payment History</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Loan Info */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Member:</span>
              <p className="font-medium">{loan.memberName}</p>
            </div>
            <div>
              <span className="text-gray-600">Loan Amount:</span>
              <p className="font-medium">{formatCurrency(loan.loanAmount)}</p>
            </div>
            <div>
              <span className="text-gray-600">Total Paid:</span>
              <p className="font-medium text-green-600">{formatCurrency(loan.paidAmount || 0)}</p>
            </div>
            <div>
              <span className="text-gray-600">Total Discount:</span>
              <p className="font-medium text-orange-600">{formatCurrency(loan.discountAmount || 0)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <Loader message="Loading payment history..." />
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <div
                  key={payment.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs text-gray-500">
                        Payment #{payments.length - index}
                      </span>
                      <p className="text-sm text-gray-600">
                        {formatDate(payment.paymentDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(payment.paymentAmount)}
                      </p>
                      {payment.discountApplied > 0 && (
                        <p className="text-sm text-orange-600">
                          Discount: {formatCurrency(payment.discountApplied)}
                        </p>
                      )}
                    </div>
                  </div>
                  {payment.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {payment.notes}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-400">
                    Recorded: {new Date(payment.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanPaymentHistory;