import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { FileText } from 'lucide-react';
import Loader from '../common/Loader';
import StyledTable from '../common/StyledTable';
import { useLanguage } from '../../context/LanguageContext';

const MemberStatement = ({ readOnly }) => {
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(false);

  // Read optional memberId from query params and fetch members
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const memberIdFromQuery = params.get('memberId');
    if (memberIdFromQuery) {
      // fetch statement for all years (year=null)
      (async () => {
        try {
          setLoading(true);
          const data = await adminService.getMemberStatement(memberIdFromQuery, null);
          setStatement(data);
        } catch (error) {
          console.error('Error fetching statement:', error);
          alert('Failed to fetch statement');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText size={32} className="text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">{t('memberStatement') || 'Member Statement'}</h2>
        </div>
      </div>

      {loading && <Loader message="Loading statement..." />}

      {/* Statement Display */}
      {statement && (
        <div className="bg-white rounded-lg shadow p-6 print:shadow-none">
          {/* Header */}
          <div className="border-b pb-4 mb-6 print:border-black">
            <div className="bg-gray-50 rounded-lg p-4 print:bg-white print:border">

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <p className="text-sm font-bold text-gray-600">{t('memberName') || 'Name:'} {statement.memberName} </p>
                  <p className="text-sm text-gray-600">{t('phone') || 'Phone:'} {statement.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border-t-4 border-blue-500 print:border print:border-black">
            <h4 className="font-semibold text-gray-800 mb-3">{t('summary') || 'Summary'}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statement.totalDeposits > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">{t('activeDepositsWithInterest') || 'Active Deposits (with Interest)'}</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(statement.activeDepositsWithInterest)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('totalDeposits') || 'Total Deposits'}</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(statement.totalDeposits)}</p>
                  </div>
                </div>
              )}


              {statement.totalLoans > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">{t('activeLoansWithInterest') || 'Active Loans (with Interest)'}</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(statement.activeLoansWithInterest)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('totalLoans') || 'Total Loans'}</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(statement.totalLoans)}</p>
                  </div>

                </div>
              )}
            </div>

          </div>


          {/* Deposits Section */}
          {          /*if statement.deposits && statement.deposits.length > 0  then display following section */}
          {statement.deposits.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">{t('deposits') || 'Deposits'}</h4>
              {statement.deposits && statement.deposits.length > 0 ? (
                <StyledTable
                  renderHeader={() => (
                    <>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('depositDate') || 'Deposit Date'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('returnDate') || 'Return Date'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('duration') || 'Duration'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('amount') || 'Amount'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('monthlyInterest') || 'Monthly Interest'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('interestEarned') || 'Interest Earned'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('totalAmount') || 'Total'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('status') || 'Status'}</th>
                    </>
                  )}
                >
                  {statement.deposits.map((deposit) => (
                    <tr key={deposit.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(deposit.depositDate)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{deposit.returnDate ? formatDate(deposit.returnDate) : '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{deposit.durationDays ? (<>{deposit.durationMonths || 0} {t('month')} {deposit.durationDays} {t('day')}</>) : '-'}</td>
                      <td className="px-4 py-2 text-sm">{formatCurrency(deposit.amount)}</td>
                      <td className="px-4 py-2 text-sm text-green-600">{formatCurrency((deposit.amount * deposit.interestRate) / 100 || 0)}</td>
                      <td className="px-4 py-2 text-sm text-green-600">{formatCurrency(deposit.interestEarned)}</td>
                      <td className="px-4 py-2 text-sm font-medium">{formatCurrency(deposit.totalAmount)}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-4 py-2 whitespace-nowrap text-sm rounded-full ${deposit.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {deposit.status === 'ACTIVE' ? t('active') : deposit.status === 'RETURNED' ? t('returned') : deposit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </StyledTable>
              ) : (
                <p className="text-gray-500 text-sm">{t('noDepositsFound') || 'No deposits found'}</p>
              )}
            </div>
          )}

          {/* Loans Section */}
          {statement.loans.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">{t('loans') || 'Loans'}</h4>
              {statement.loans && statement.loans.length > 0 ? (
                <StyledTable
                  renderHeader={() => (
                    <>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('loanDate') || 'Loan Date'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('returnDate') || 'Return Date'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('duration') || 'Duration'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('loanAmount') || 'Amount'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('monthlyInterest') || 'Monthly Interest'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('totalInterest') || 'Total Interest'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('due') || 'Due'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('paid') || 'Paid'}</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-white uppercase tracking-wide">{t('status') || 'Status'}</th>
                    </>
                  )}
                >
                  {statement.loans.map((loan) => (
                    <tr key={loan.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(loan.loanDate)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{loan.returnDate ? formatDate(loan.returnDate) : '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{loan.durationDays ? (<>{loan.durationMonths || 0} {t('month')} {loan.durationDays} {t('day')}</>) : '-'}</td>
                      <td className="px-4 py-2 text-sm">{formatCurrency(loan.loanAmount)}</td>
                      <td className="px-4 py-2 text-sm text-red-600">{formatCurrency((loan.loanAmount * loan.interestRate) / 100 || 0)}</td>
                      <td className="px-4 py-2 text-sm text-red-600"> {formatCurrency(loan.currentInterest)}</td>
                      <td className="px-4 py-2 text-sm text-red-600"> {formatCurrency(loan.currentRemaining)}</td>
                      <td className="px-4 py-2 text-sm text-red-600"> {loan.status === 'ACTIVE' ? formatCurrency(loan.paidAmount) : formatCurrency(loan.totalRepayment)} </td>

                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${loan.status === 'ACTIVE' ? 'bg-yellow-100 text-yellow-800' : loan.status === 'CLOSED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {loan.status === 'ACTIVE' ? t('active') : loan.status === 'CLOSED' ? t('closed') : loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </StyledTable>
              ) : (
                <p className="text-gray-500 text-sm">{t('noLoansFound') || 'No loans found'}</p>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default MemberStatement;