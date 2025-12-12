import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { Plus, XCircle, Edit, DollarSign, History, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../common/Loader';
import LoanForm from './LoanForm';
import LoanClosure from './LoanClosure';
import LoanPayment from './LoanPayment';
import LoanPaymentHistory from './LoanPaymentHistory';
import StyledTable from '../common/StyledTable';

const LoanManagement = ({ readOnly, statusFilter: externalStatusFilter, onFilterChange }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [closingLoan, setClosingLoan] = useState(null);
  const [paymentLoan, setPaymentLoan] = useState(null);
  const [historyLoan, setHistoryLoan] = useState(null);
  const [internalStatusFilter, setInternalStatusFilter] = useState('ACTIVE');
  const [sortedLoans, setSortedLoans] = useState([]);

  // Use external filter if provided, otherwise use internal state
  const statusFilter = externalStatusFilter !== undefined ? externalStatusFilter : internalStatusFilter;
  const setStatusFilter = onFilterChange || setInternalStatusFilter;

  useEffect(() => {
    fetchLoans();
  }, [page, statusFilter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllLoans(statusFilter, page, 20);
      // Sort by loan date in descending order (newest first)
      const sorted = [...data.content].sort((a, b) => {
        return new Date(b.loanDate) - new Date(a.loanDate);
      });
      setSortedLoans(sorted);
      setLoans(sorted);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching loans:', error);
      alert('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = (shouldRefresh) => {
    setShowForm(false);
    setEditingLoan(null);
    if (shouldRefresh) {
      fetchLoans();
    }
  };

  const handleClosureComplete = (shouldRefresh) => {
    setClosingLoan(null);
    if (shouldRefresh) {
      fetchLoans();
    }
  };

  const handlePaymentComplete = (shouldRefresh) => {
    setPaymentLoan(null);
    if (shouldRefresh) {
      fetchLoans();
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingLoan(null);
    setShowForm(true);
  };

  const { t } = useLanguage();
  if (loading) return <Loader message={t('loadingLoans') || 'Loading loans...'} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('loanManagement') || 'Loan Management'}</h2>
        {!readOnly && (
          <button
            onClick={handleAddNew}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            <Plus size={20} />
            <span>{t('sanctionLoan') || 'Sanction Loan'}</span>
          </button>
        )}
      </div>

      {/* Status Filter - only show if not controlled externally */}
      {externalStatusFilter === undefined && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-lg transition ${
                  statusFilter === 'ALL'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('allLoans') || 'All Loans'}
              </button>
              <button
                onClick={() => {
                  setStatusFilter('ACTIVE');
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-lg transition ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('active') || 'Active'}
              </button>
              <button
                onClick={() => {
                  setStatusFilter('CLOSED');
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-lg transition ${
                  statusFilter === 'CLOSED'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('closed') || 'Closed'}
              </button>
            </div>
          </div>
        </div>
      )}

      <StyledTable
        renderHeader={() => (
          <>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('memberName') || 'Member Name'}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white whitespace-nowrap uppercase tracking-wide">{t('loanAmount') || 'Loan Amount'}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('paidDiscount') || 'Paid / Discount'}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('loanDate') || 'Loan Date'}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('returnDate') || 'Return Date'}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('duration') || 'Duration'}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('monthlyInterest') || 'Monthly Interest'}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('totalInterest')}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{statusFilter === 'ACTIVE' ? (t('remainingAmount') || 'Remaining') : (t('paid') || 'Total Repayment')}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('status') || 'Status'}</th>
            {(statusFilter === 'ACTIVE' || statusFilter === 'ALL') && !readOnly && <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('actions') || 'Actions'}</th>}
          </>
        )}
      >
        {loans.length === 0 ? (
          <tr>
            <td colSpan="8" className="px-6 py-4 text-center text-gray-500">{t('noLoansFound') || 'No loans found'}</td>
          </tr>
        ) : (
          loans.map((loan) => (
            <tr key={loan.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"><Link to={`/admin/statements?memberId=${loan.memberId}`} className="text-blue-600 hover:underline">{loan.memberName}</Link></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(loan.loanAmount)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm"><div className="text-green-600 font-medium">{formatCurrency(loan.paidAmount || 0)}</div>{loan.discountAmount > 0 && (<div className="text-orange-600 text-xs">-{formatCurrency(loan.discountAmount)}</div>)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(loan.loanDate)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.returnDate ? formatDate(loan.returnDate) : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{loan.durationDays ? (<>{loan.durationMonths || 0} {t('month')} {loan.durationDays} {t('day')}</>) : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency((loan.loanAmount * (loan.interestRate || 0)) / 100)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(loan.currentInterest || loan.interestAmount)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{statusFilter === 'ACTIVE' ? (<span className="text-red-700">{formatCurrency(loan.currentRemaining || loan.remainingAmount || 0)}</span>) : (formatCurrency(loan.totalRepayment))}</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loan.status === 'ACTIVE' ? 'bg-yellow-100 text-yellow-800' : loan.status === 'CLOSED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{ loan.status}</span></td>
              {(statusFilter === 'ACTIVE' || statusFilter === 'ALL') && !readOnly && (<td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex space-x-2">{(loan.status === 'ACTIVE' || statusFilter === 'ALL') && (<><button onClick={() => handleEdit(loan)} className="text-blue-600 hover:text-blue-900" title="Edit"><Edit size={18} /></button><button onClick={() => setPaymentLoan(loan)} className="text-green-600 hover:text-green-900" title="Add Payment"><DollarSign size={18} /></button><button onClick={() => setClosingLoan(loan)} className="text-orange-600 hover:text-orange-900" title="Close Loan"><XCircle size={18} /></button></>) }{(loan.paidAmount > 0 || loan.status === 'CLOSED') && (<button onClick={() => setHistoryLoan(loan)} className="text-purple-600 hover:text-purple-900" title="Payment History"><History size={18} /></button>)}</div></td>)}
            </tr>
          ))
        )}
      </StyledTable>

    {/* Pagination */}
    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{page + 1}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </nav>
        </div>
      </div>
    </div>
    {!readOnly && showForm && <LoanForm loan={editingLoan} onClose={handleFormClose} />}
    {!readOnly && closingLoan && <LoanClosure loan={closingLoan} onClose={handleClosureComplete} />}
    {!readOnly && paymentLoan && <LoanPayment loan={paymentLoan} onClose={handlePaymentComplete} />}
    {historyLoan && <LoanPaymentHistory loan={historyLoan} onClose={() => setHistoryLoan(null)} />}
  </div>
  );
};
export default LoanManagement;