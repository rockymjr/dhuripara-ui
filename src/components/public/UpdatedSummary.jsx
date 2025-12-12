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
      {/* Bank Section */}
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

      {/* VDF Section */}
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
      </div>
    </div>
  );
};

export default UpdatedSummary;