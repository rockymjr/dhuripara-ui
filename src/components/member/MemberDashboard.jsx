import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { memberService } from '../../services/memberService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { useLanguage } from '../../context/LanguageContext';
import Loader from '../common/Loader';
import StyledTable from '../common/StyledTable';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Users, FileText } from 'lucide-react';

const MemberDashboard = () => {
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await memberService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      alert('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message={t('loading')} />;
  if (!dashboard) return <div className="text-center py-8">{t('notFound')}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {dashboard.memberName}</h1>
            <p className="text-gray-600 mt-2">Phone: {dashboard.phone}</p>
          </div>
          <div className="flex space-x-2">
            <Link
              to="/member/family"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
            >
              <Users size={20} />
              <span>My Family</span>
            </Link>
            <Link
              to="/member/documents"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
            >
              <FileText size={20} />
              <span>My Documents</span>
            </Link>
            <Link
              to="/member/family-documents"
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
            >
              <FileText size={20} />
              <span>Family Documents</span>
            </Link>
          </div>
        </div>
        {/* Removed View My VDF Account quick link as requested */}
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">


        {/* Total Deposited (All Time) */}
        {dashboard.totalDeposited > 0 && (
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp size={28} />
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">All Time</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">{t('yourTotalDeposits')}</h3>
            <p className="text-2xl font-bold mt-2">{formatCurrency(dashboard.totalDeposited)}</p>
            <p className="text-xs mt-1 opacity-80">
              {t('yourTotalInterestEarned')} : {formatCurrency(dashboard.totalDepositInterestEarned)}
            </p>
          </div>
        )}

        {/* Current Deposited */}
        {dashboard.totalDeposited > 0 && (
          <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp size={28} />
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Active</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">{t('yourActiveDeposits')}</h3>
            <p className="text-2xl font-bold mt-2">{formatCurrency(dashboard.currentDeposits)}</p>
            <p className="text-xs mt-1 opacity-80">
              {t('yourCurrentInterest')} : {formatCurrency(dashboard.currentDepositInterest)}
            </p>
          </div>
        )}

        {/* Total Borrowed (All Time) */}
        {dashboard.totalBorrowed > 0 && (
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <TrendingDown size={28} />
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">All Time</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">{t('yourTotalLoans')}</h3>
            <p className="text-2xl font-bold mt-2">{formatCurrency(dashboard.totalBorrowed)}</p>
            <p className="text-xs mt-1 opacity-80">
              {t('yourTotalInterestPaid')} : {formatCurrency(dashboard.totalLoanInterestPaid)}
            </p>
          </div>
        )}

        {/* Current Loans */}
        {dashboard.totalBorrowed > 0 && (
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <DollarSign size={28} />
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Active</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">{t('yourCurrentLoan')}</h3>
            <p className="text-2xl font-bold mt-2">{formatCurrency(dashboard.currentLoans)}</p>
            <p className="text-xs mt-1 opacity-80">
              {t('yourCurrentInterest')} : {formatCurrency(dashboard.currentLoanInterest)}
            </p>
          </div>
        )}

      </div>


      {/* Deposits Table */}
      {dashboard.deposits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('deposits')}</h2>
          <StyledTable
            renderHeader={() => (
              <>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('depositDate')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('amount')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('returnDeposit')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('duration')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('monthlyInterest')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('interestEarned')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('totalAmount')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('status')}</th>
              </>
            )}
          >
            {dashboard.deposits.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No deposits found</td>
              </tr>
            ) : (
              dashboard.deposits.map((deposit, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(deposit.depositDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(deposit.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deposit.returnDate ? formatDate(deposit.returnDate) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{deposit.durationDays ? (<>{deposit.durationMonths || 0} {t('month')} {deposit.durationDays} {t('day')}</>) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{deposit.interestRate ? formatCurrency((deposit.amount * deposit.interestRate) / 100) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(deposit.interestEarned || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(deposit.totalAmount || deposit.currentTotal || deposit.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${deposit.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : deposit.status === 'RETURNED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{deposit.status}</span></td>
                </tr>
              ))
            )}
          </StyledTable>
        </div>
      )}

      {/* Loans Table */}
      {dashboard.loans.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('loans')}</h2>
          <StyledTable
            renderHeader={() => (
              <>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('loanDate')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('loanAmount')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('returnDeposit')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('duration')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('monthlyInterest')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('totalInterest')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('paidAmount')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('remainingAmount')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('status')}</th>
              </>
            )}
          >
            {(
              dashboard.loans.map((loan, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(loan.loanDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(loan.loanAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.returnDate ? formatDate(loan.returnDate) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{loan.durationDays ? (<>{loan.durationMonths || 0} {t('month')} {loan.durationDays} {t('day')}</>) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{loan.interestRate ? formatCurrency((loan.loanAmount * loan.interestRate) / 100) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(loan.currentInterest)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(loan.totalRepayment)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">{formatCurrency(loan.currentRemaining)}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${loan.status === 'ACTIVE' ? 'bg-yellow-100 text-yellow-800' : loan.status === 'CLOSED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{loan.status}</span></td>
                </tr>
              ))
            )}
          </StyledTable>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;