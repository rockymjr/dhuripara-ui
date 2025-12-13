import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { Plus, RotateCcw, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../common/Loader';
import DepositForm from './DepositForm';
import DepositReturn from './DepositReturn';
import StyledTable from '../common/StyledTable';

const DepositManagement = ({ readOnly, statusFilter: externalStatusFilter, onFilterChange }) => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const [returningDeposit, setReturningDeposit] = useState(null);
  const [internalStatusFilter, setInternalStatusFilter] = useState('ACTIVE');
  const [sortedDeposits, setSortedDeposits] = useState([]);

  // Use external filter if provided, otherwise use internal state
  const statusFilter = externalStatusFilter !== undefined ? externalStatusFilter : internalStatusFilter;
  const setStatusFilter = onFilterChange || setInternalStatusFilter;

  useEffect(() => {
    fetchDeposits();
  }, [page, statusFilter]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllDeposits(statusFilter, page, 20);
      const sorted = [...data.content].sort((a, b) => {
        const dateA = new Date(b.depositDate);
        const dateB = new Date(a.depositDate);
        return dateA.getTime() - dateB.getTime();
      });
      setSortedDeposits(sorted);
      setDeposits(sorted);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      alert('Failed to load deposits');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = (shouldRefresh) => {
    setShowForm(false);
    setEditingDeposit(null);
    if (shouldRefresh) {
      fetchDeposits();
    }
  };

  const handleReturnComplete = (shouldRefresh) => {
    setReturningDeposit(null);
    if (shouldRefresh) {
      fetchDeposits();
    }
  };

  const handleEdit = (deposit) => {
    setEditingDeposit(deposit);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingDeposit(null);
    setShowForm(true);
  };

  const { t } = useLanguage();
  if (loading) return <Loader message={t('loadingDeposits') || 'Loading deposits...'} />;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('depositManagement') || 'Deposit Management'}</h2>
          {!readOnly && (
            <button
              onClick={handleAddNew}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
            >
              <Plus size={20} />
              <span>{t('addDeposit') || 'Add Deposit'}</span>
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
                  className={`px-4 py-2 rounded-lg transition ${statusFilter === 'ALL'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {t('allDeposits') || 'All Deposits'}
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('ACTIVE');
                    setPage(0);
                  }}
                  className={`px-4 py-2 rounded-lg transition ${statusFilter === 'ACTIVE'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {t('active') || 'Active'}            
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('RETURNED');
                    setPage(0);
                  }}
                  className={`px-4 py-2 rounded-lg transition ${statusFilter === 'RETURNED'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {t('closed') || 'Returned'}
                </button>
              </div>
            </div>
          </div>
        )}

        <StyledTable
          renderHeader={() => (
            <>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('memberName') || 'Member Name'}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('amount') || 'Amount'}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('depositDate') || 'Deposit Date'}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('returnDate') || 'Return Date'}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('duration') || 'Duration'}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('monthlyInterest') || 'Monthly Interest'}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{statusFilter === 'ACTIVE' ? (t('currentInterest') || 'Current Interest') : (t('interestEarned') || 'Interest Earned')}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{statusFilter === 'ACTIVE' ? (t('currentTotal') || 'Current Total') : (t('totalAmount') || 'Total Amount')}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('status') || 'Status'}</th>
              {(statusFilter === 'ACTIVE' || statusFilter === 'ALL') && !readOnly && <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('actions') || 'Actions'}</th>}
            </>
          )}
        >
          {deposits.length === 0 ? (
            <tr>
              <td colSpan="12" className="px-6 py-4 text-center text-gray-500">{t('noDepositsFound') || 'No deposits found'}</td>
            </tr>
          ) : (
            deposits.map((deposit) => (
              <tr key={deposit.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"><Link to={`/admin/statements?memberId=${deposit.memberId}`} className="text-blue-600 hover:underline">{deposit.memberName}</Link></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(deposit.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(deposit.depositDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deposit.returnDate ? formatDate(deposit.returnDate) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{deposit.durationDays ? (<>{deposit.durationMonths || 0} {t('month')} {deposit.durationDays} {t('day')}</>) : '-'}</td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency((deposit.amount * (deposit.interestRate || 0)) / 100)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(deposit.currentInterest || deposit.interestEarned)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(deposit.currentTotal || deposit.totalAmount)}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${deposit.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : deposit.status === 'RETURNED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{deposit.status}</span></td>
                {(statusFilter === 'ACTIVE' || statusFilter === 'ALL') && !readOnly && (<td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex space-x-2">{(deposit.status === 'ACTIVE' || statusFilter === 'ALL') && (<><button onClick={() => handleEdit(deposit)} className="text-blue-600 hover:text-blue-900" title="Edit"><Edit size={18} /></button><button onClick={() => setReturningDeposit(deposit)} className="text-green-600 hover:text-green-900" title="Return"><RotateCcw size={18} /></button></>)}</div></td>)}
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
      </div>

      {!readOnly && showForm && <DepositForm deposit={editingDeposit} onClose={handleFormClose} />}
      {!readOnly && returningDeposit && <DepositReturn deposit={returningDeposit} onClose={handleReturnComplete} />}
    </>
  );
};

export default DepositManagement;