import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { memberService } from '../../services/memberService';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { useLanguage } from '../../context/LanguageContext';
import { useMemberAuth } from '../../context/MemberAuthContext';
import Loader from '../common/Loader';
import StyledTable from '../common/StyledTable';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

const UnifiedMemberAccount = ({ readOnly }) => {
  const { t } = useLanguage();
  const { isAuthenticated: isMember } = useMemberAuth() || {};
  const [searchParams] = useSearchParams();
  const memberIdFromQuery = searchParams.get('memberId');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberDocuments, setMemberDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [docViewerUrl, setDocViewerUrl] = useState('');
  const [docViewerTitle, setDocViewerTitle] = useState('');
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    fetchData();
  }, [memberIdFromQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (memberIdFromQuery) {
        // Admin viewing member statement (has memberId query param)
        setIsAdminView(true);
        const statement = await adminService.getMemberStatement(memberIdFromQuery, null);
        setData(statement);
        // fetch member documents for admin view
        try {
          setLoadingDocs(true);
          const docs = await adminService.getMemberDocuments(memberIdFromQuery);
          setMemberDocuments(docs || []);
        } catch (err) {
          console.error('Failed to fetch member documents', err);
          setMemberDocuments([]);
        } finally {
          setLoadingDocs(false);
        }
      } else {
        // Member viewing their own dashboard
        setIsAdminView(false);
        const dashboard = await memberService.getDashboard();
        setData(dashboard);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message={t('loading') || 'Loading...'} />;
  if (!data) return <div className="text-center py-8">{t('notFound') || 'Not found'}</div>;

  const memberName = isAdminView ? data.memberName : data.memberName;
  const phone = isAdminView ? data.phone : data.phone;
  const deposits = isAdminView ? (data.deposits || []) : (data.deposits || []);
  const loans = isAdminView ? (data.loans || []) : (data.loans || []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Navigation Buttons */}
      <div className="mb-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
             <p className="font-semibold text-gray-800 mb-3">{memberName} ({phone})</p>

          </div>
          
          {/* Navigation Buttons - Only show for members, not admin view */}
          {!isAdminView && (
            <div className="flex flex-wrap gap-2">
              <Link
                to="/member/account"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
              >
                <span>My VDF</span>
              </Link>
              <Link
                to="/member/bank"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition"
              >
                <span>My Bank</span>
              </Link>
              <Link
                to="/member/documents"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
              >
                <span>My Documents</span>
              </Link>
              <Link
                to="/member/family-documents"
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition"
              >
                <span>Family Documents</span>
              </Link>
            </div>
          )}

            {/* Admin: Documents */}
            {isAdminView && (
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3">Documents</h3>
                {loadingDocs ? (
                  <div>Loading documents...</div>
                ) : memberDocuments.length === 0 ? (
                  <div className="text-gray-500">No documents found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs text-gray-600">
                        <tr>
                          <th className="px-2 py-1">Category</th>
                          <th className="px-2 py-1">Notes</th>
                          <th className="px-2 py-1">Uploaded</th>
                          <th className="px-2 py-1">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {memberDocuments.map(doc => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-2 py-2">{doc.categoryName || doc.documentCategoryName || '-'}</td>
                            <td className="px-2 py-2 text-gray-700">{doc.notes || '-'}</td>
                            <td className="px-2 py-2">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : '-'}</td>
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  className="text-blue-600 hover:underline"
                                  onClick={async () => {
                                    try {
                                      const res = await adminService.getDocumentUrl(doc.id);
                                      const url = res?.url || res;
                                      if (url) {
                                        setDocViewerUrl(url);
                                        setDocViewerTitle(doc.categoryName || doc.documentCategoryName || 'Document');
                                        setShowDocViewer(true);
                                      } else alert('Unable to fetch document URL');
                                    } catch (err) {
                                      console.error('Failed to get document url', err);
                                      alert('Failed to open document');
                                    }
                                  }}
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Summary Cards - Only show for member view */}
      {!isAdminView && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Deposited (All Time) */}
          {data.totalDeposited > 0 && (
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp size={28} />
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">All Time</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">{t('yourTotalDeposits') || 'Your Total Deposits'}</h3>
              <p className="text-2xl font-bold mt-2">{formatCurrency(data.totalDeposited)}</p>
              <p className="text-xs mt-1 opacity-80">
                {t('yourTotalInterestEarned') || 'Total Interest Earned'}: {formatCurrency(data.totalDepositInterestEarned)}
              </p>
            </div>
          )}

          {/* Current Deposited */}
          {data.totalDeposited > 0 && (
            <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp size={28} />
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Active</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">{t('yourActiveDeposits') || 'Your Active Deposits'}</h3>
              <p className="text-2xl font-bold mt-2">{formatCurrency(data.currentDeposits)}</p>
              <p className="text-xs mt-1 opacity-80">
                {t('yourCurrentInterest') || 'Current Interest'}: {formatCurrency(data.currentDepositInterest)}
              </p>
            </div>
          )}

          {/* Total Borrowed (All Time) */}
          {data.totalBorrowed > 0 && (
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <TrendingDown size={28} />
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">All Time</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">{t('yourTotalLoans') || 'Your Total Loans'}</h3>
              <p className="text-2xl font-bold mt-2">{formatCurrency(data.totalBorrowed)}</p>
              <p className="text-xs mt-1 opacity-80">
                {t('yourTotalInterestPaid') || 'Total Interest Paid'}: {formatCurrency(data.totalLoanInterestPaid)}
              </p>
            </div>
          )}

          {/* Current Loans */}
          {data.totalBorrowed > 0 && (
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <DollarSign size={28} />
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Active</span>
              </div>
              <h3 className="text-sm font-medium opacity-90">{t('yourCurrentLoan') || 'Your Current Loan'}</h3>
              <p className="text-2xl font-bold mt-2">{formatCurrency(data.currentLoans)}</p>
              <p className="text-xs mt-1 opacity-80">
                {t('yourCurrentInterest') || 'Current Interest'}: {formatCurrency(data.currentLoanInterest)}
              </p>
            </div>
          )}
        </div>
      )}
      {/* Document Viewer Modal for Admin view */}
      {showDocViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-60" onClick={() => setShowDocViewer(false)} />
          <div className="bg-white rounded-lg shadow-lg z-10 w-11/12 md:w-3/4 lg:w-4/5 max-h-[90vh] overflow-auto p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{docViewerTitle}</h3>
              <button className="text-gray-600" onClick={() => setShowDocViewer(false)}>Close</button>
            </div>
            <div className="w-full h-[80vh]">
              <iframe title={docViewerTitle} src={docViewerUrl} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}

      {/* Admin View Summary */}
      {isAdminView && (
        <div className="bg-blue-50 rounded-lg p-4 border-t-4 border-blue-500 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">{t('summary') || 'Summary'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.totalDeposits > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">{t('activeDepositsWithInterest') || 'Active Deposits (with Interest)'}</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(data.activeDepositsWithInterest)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('totalDeposits') || 'Total Deposits'}</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(data.totalDeposits)}</p>
                </div>
              </div>
            )}
            {data.totalLoans > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">{t('activeLoansWithInterest') || 'Active Loans (with Interest)'}</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(data.activeLoansWithInterest)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('totalLoans') || 'Total Loans'}</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(data.totalLoans)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deposits Table */}
      {deposits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('deposits') || 'Deposits'}</h2>
          <StyledTable
            renderHeader={() => (
              <>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('depositDate') || 'Deposit Date'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('returnDate') || 'Return Date'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('duration') || 'Duration'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('amount') || 'Amount'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('monthlyInterest') || 'Monthly Interest'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('interestEarned') || 'Interest Earned'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('totalAmount') || 'Total Amount'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('status') || 'Status'}</th>
              </>
            )}
          >
            {deposits.map((deposit, idx) => (
              <tr key={deposit.id || idx} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(deposit.depositDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deposit.returnDate ? formatDate(deposit.returnDate) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{deposit.durationDays ? (<>{deposit.durationMonths || 0} {t('month')} {deposit.durationDays} {t('day')}</>) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(deposit.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{deposit.interestRate ? formatCurrency((deposit.amount * deposit.interestRate) / 100) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(deposit.interestEarned || deposit.currentInterest || 0)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(deposit.totalAmount || deposit.currentTotal || deposit.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${deposit.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : deposit.status === 'RETURNED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {deposit.status}
                  </span>
                </td>
              </tr>
            ))}
          </StyledTable>
        </div>
      )}

      {/* Loans Table */}
      {loans.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('loans') || 'Loans'}</h2>
          <StyledTable
            renderHeader={() => (
              <>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('loanDate') || 'Loan Date'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('loanAmount') || 'Loan Amount'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('returnDate') || 'Return Date'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('duration') || 'Duration'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('monthlyInterest') || 'Monthly Interest'}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('totalInterest') || 'Total Interest'}</th>
                {isAdminView ? (
                  <>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('due') || 'Due'}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('paid') || 'Paid'}</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('paidAmount') || 'Paid Amount'}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('remainingAmount') || 'Remaining Amount'}</th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('status') || 'Status'}</th>
              </>
            )}
          >
            {loans.map((loan, idx) => (
              <tr key={loan.id || idx} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(loan.loanDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(loan.loanAmount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.returnDate ? formatDate(loan.returnDate) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{loan.durationDays ? (<>{loan.durationMonths || 0} {t('month')} {loan.durationDays} {t('day')}</>) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{loan.interestRate ? formatCurrency((loan.loanAmount * loan.interestRate) / 100) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(loan.currentInterest || loan.interestAmount || 0)}</td>
                {isAdminView ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(loan.currentRemaining || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{loan.status === 'ACTIVE' ? formatCurrency(loan.paidAmount || 0) : formatCurrency(loan.totalRepayment || 0)}</td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(loan.totalRepayment || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">{formatCurrency(loan.currentRemaining || 0)}</td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${loan.status === 'ACTIVE' ? 'bg-yellow-100 text-yellow-800' : loan.status === 'CLOSED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {loan.status}
                  </span>
                </td>
              </tr>
            ))}
          </StyledTable>
        </div>
      )}
    </div>
  );
};

export default UnifiedMemberAccount;

