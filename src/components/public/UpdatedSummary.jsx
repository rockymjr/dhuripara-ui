// src/components/public/UpdatedSummary.jsx
import React, { useEffect, useState } from 'react';
import { publicService } from '../../services/publicService';
import { vdfService } from '../../services/vdfService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useLanguage } from '../../context/LanguageContext';
import Loader from '../common/Loader';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Users, Package } from 'lucide-react';

const UpdatedSummary = () => {
  const { t } = useLanguage();
  const [bankSummary, setBankSummary] = useState(null);
  const [vdfSummary, setVdfSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vdf'); // 'bank' or 'vdf'
  const { language } = useLanguage();

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const [bank, vdf] = await Promise.all([
        publicService.getSummary(),
        vdfService.getPublicSummary()
      ]);
      setBankSummary(bank);
      setVdfSummary(vdf);
    } catch (error) {
      setError('Failed to load summary data');
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message={t('loading')} />;
  if (error) return <div className="text-red-500 text-center py-8 px-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Large Quick-Access Buttons like VDF page */}
      <div className="mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${activeTab === 'bank' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
            <TrendingUp size={20} />
            <span className="font-semibold">Gramin Bank</span>
          </button>
          <button
            onClick={() => setActiveTab('vdf')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${activeTab === 'vdf' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
            <Package size={20} />
            <span className="font-semibold">Village Development Fund</span>
          </button>
        </div>
      </div>

      {/* Bank Section */}
      {activeTab === 'bank' && (
      <div className="mb-8">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4">
          {t('graminBankSummary')} 
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Deposits Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <TrendingUp size={28} className="sm:w-8 sm:h-8" />
              <span className="text-xs sm:text-sm bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full">
                {bankSummary?.activeDepositsCount} Active
              </span>
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('totalDeposits')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">
              {formatCurrency(bankSummary?.totalDeposits, language)}
            </p>
          </div>

          {/* Total Loans Card */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <TrendingDown size={28} className="sm:w-8 sm:h-8" />
              <span className="text-xs sm:text-sm bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full">
                {bankSummary?.activeLoansCount} Active
              </span>
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('totalLoans')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">
              {formatCurrency(bankSummary?.totalLoans, language)}
            </p>
          </div>

          {/* Available Balance Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Wallet size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('availableBalance')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">
              {formatCurrency(bankSummary?.availableBalance, language)}
            </p>
          </div>

          {/* Bank Profit Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <DollarSign size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('bankProfit')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">
              {formatCurrency(bankSummary?.bankProfit, language)}
            </p>
          </div>
        </div>
      </div>
      )}

      {/* VDF Section */}
      {activeTab === 'vdf' && (
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4">
          {t('vdfSummary')}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Families Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Users size={28} className="sm:w-8 sm:h-8" />
              <span className="text-xs sm:text-sm bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full">
                {vdfSummary?.activeFamilies || vdfSummary?.activeContributors} {t('activeFamilies')}
              </span>
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('totalFamilies')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {vdfSummary?.totalFamilies}
            </p>
          </div>

          {/* Total Collected Card */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <TrendingUp size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('totalCollected')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">
              {formatCurrency(vdfSummary?.totalCollected, language)}
            </p>
          </div>

          {/* Total Expenses Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Package size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('totalExpenses')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">
              {formatCurrency(vdfSummary?.totalExpenses, language)}
            </p>
          </div>

          {/* Current Balance Card */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Wallet size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('vdfBalance')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">
              {formatCurrency(vdfSummary?.currentBalance, language)}
            </p>
          </div>
        </div>

        {/* Category-wise Breakdown */}
        {(vdfSummary?.categoryWiseDeposits || vdfSummary?.categoryWiseExpenses) && (
          <div className="mt-8">
       
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category-wise Deposits */}
              {vdfSummary?.categoryWiseDeposits && Object.keys(vdfSummary.categoryWiseDeposits).length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('depositsByCategory') || 'Deposits by Category'}</h3>
                  <div className="space-y-2">
                    {Object.entries(language === 'bn' ? (vdfSummary.categoryWiseDepositsBn || vdfSummary.categoryWiseDeposits) : (vdfSummary.categoryWiseDeposits))
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">{category}</span>
                          <span className="font-semibold text-green-600">{formatCurrency(amount, language)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Category-wise Expenses */}
              {vdfSummary?.categoryWiseExpenses && Object.keys(vdfSummary.categoryWiseExpenses).length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('expensesByCategory') || 'Expenses by Category'}</h3>
                  <div className="space-y-2">
                    {Object.entries(language === 'bn' ? (vdfSummary.categoryWiseExpensesBn || vdfSummary.categoryWiseExpenses) : (vdfSummary.categoryWiseExpenses))
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">{category}</span>
                          <span className="font-semibold text-orange-600">{formatCurrency(amount, language)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default UpdatedSummary;