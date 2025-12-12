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
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'vdf'

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
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('bank')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bank'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gramin Bank Summary
          </button>
          <button
            onClick={() => setActiveTab('vdf')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vdf'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Village Development Summary
          </button>
        </nav>
      </div>

      {/* Bank Section */}
      {activeTab === 'bank' && (
      <div className="mb-8">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4">
          {t('appName')} - Banking Summary
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
              {formatCurrency(bankSummary?.totalDeposits)}
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
              {formatCurrency(bankSummary?.totalLoans)}
            </p>
          </div>

          {/* Available Balance Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Wallet size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('availableBalance')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">
              {formatCurrency(bankSummary?.availableBalance)}
            </p>
          </div>

          {/* Bank Profit Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <DollarSign size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('bankProfit')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">
              {formatCurrency(bankSummary?.bankProfit)}
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
              {formatCurrency(vdfSummary?.totalCollected)}
            </p>
          </div>

          {/* Total Expenses Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Package size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('totalExpenses')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">
              {formatCurrency(vdfSummary?.totalExpenses)}
            </p>
          </div>

          {/* Current Balance Card */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Wallet size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-sm sm:text-lg font-medium opacity-90">{t('vdfBalance')}</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">
              {formatCurrency(vdfSummary?.currentBalance)}
            </p>
          </div>
        </div>

        {/* Category-wise Breakdown */}
        {(vdfSummary?.categoryWiseDeposits || vdfSummary?.categoryWiseExpenses) && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Category-wise Breakdown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category-wise Deposits */}
              {vdfSummary?.categoryWiseDeposits && Object.keys(vdfSummary.categoryWiseDeposits).length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Deposits by Category</h3>
                  <div className="space-y-2">
                    {Object.entries(vdfSummary.categoryWiseDeposits)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">{category}</span>
                          <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Category-wise Expenses */}
              {vdfSummary?.categoryWiseExpenses && Object.keys(vdfSummary.categoryWiseExpenses).length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h3>
                  <div className="space-y-2">
                    {Object.entries(vdfSummary.categoryWiseExpenses)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">{category}</span>
                          <span className="font-semibold text-orange-600">{formatCurrency(amount)}</span>
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