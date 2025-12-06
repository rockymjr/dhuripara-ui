import React, { useEffect, useState } from 'react';
import { publicService } from '../../services/publicService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { useLanguage } from '../../context/LanguageContext';
import Loader from '../common/Loader';
import StyledTable from '../common/StyledTable';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LoanList = () => {
  const { t } = useLanguage();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchLoans();
  }, [page]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await publicService.getLoans(page, 10);
      setLoans(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message={t('loading')} />;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">{t('loans')}</h2>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {loans.map((loan) => (
          <div key={loan.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{loan.memberName}</h3>
                <p className="text-xs text-gray-500 mt-1">{formatDate(loan.loanDate)}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                loan.status === 'ACTIVE'
                  ? 'bg-yellow-100 text-yellow-800'
                  : loan.status === 'CLOSED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {loan.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('amount')}:</span>
                <span className="font-semibold">{formatCurrency(loan.loanAmount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <StyledTable
        renderHeader={() => (
          <>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('memberName')}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('loanAmount')}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('loanDate')}</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">{t('status')}</th>
          </>
        )}
      >
        {loans.length === 0 ? (
          <tr>
            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">{t('noLoansFound')}</td>
          </tr>
        ) : (
          loans.map((loan) => (
            <tr key={loan.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.memberName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(loan.loanAmount)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(loan.loanDate)}</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loan.status === 'ACTIVE' ? 'bg-yellow-100 text-yellow-800' : loan.status === 'CLOSED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{loan.status}</span></td>
            </tr>
          ))
        )}
      </StyledTable>

      {/* Pagination */}
      <div className="mt-4 sm:mt-6 flex items-center justify-between">
        <p className="text-xs sm:text-sm text-gray-700">
          Page <span className="font-medium">{page + 1}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanList;