import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import { Calendar, Download } from 'lucide-react';
import Loader from '../common/Loader';

const YearlyReport = () => {
  const [year, setYear] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetchReport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await adminService.getYearlySettlement(year);
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Failed to fetch yearly report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar size={32} className="text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Yearly Settlement Report</h2>
        </div>
      </div>

      {/* Year Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleFetchReport} className="flex items-end space-x-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {["2025-26", "2024-25"].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && <Loader message="Generating report..." />}

      {/* Report Display */}
      {report && !loading && (
        <div className="bg-white rounded-lg shadow p-8 print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200 print:border-black">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                Annual Settlement Report
              </h3>
              <p className="text-xl text-gray-600">Financial Year: {report.year}</p>
              {report.settlementDate && (
                <p className="text-sm text-gray-500 mt-1">
                  Settlement Date: {formatDate(report.settlementDate)}
                </p>
              )}
            </div>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition print:hidden"
            >
              <Download size={20} />
              <span>Print Report</span>
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Deposits */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-600 mb-1">Total Deposits</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(report.totalDeposits)}</p>
            </div>

            {/* Total Loans */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border-l-4 border-red-500">
              <p className="text-sm text-gray-600 mb-1">Total Loans</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(report.totalLoans)}</p>
            </div>

            {/* Net Profit */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">Net Profit</p>
              <p className={`text-2xl font-bold ${
                report.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'
              }`}>
                {formatCurrency(report.netProfit)}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-6">
            {/* Deposit Interest */}
            <div className="bg-gray-50 rounded-lg p-6 print:border print:border-gray-300">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Deposit Interest (Paid to Members)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Principal Amount</p>
                  <p className="text-xl font-semibold text-gray-800">{formatCurrency(report.totalDeposits)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interest @ 2.5% per month</p>
                  <p className="text-xl font-semibold text-red-600">{formatCurrency(report.totalDepositInterest)}</p>
                </div>
              </div>
            </div>

            {/* Loan Interest */}
            <div className="bg-gray-50 rounded-lg p-6 print:border print:border-gray-300">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Loan Interest (Received from Members)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Principal Amount</p>
                  <p className="text-xl font-semibold text-gray-800">{formatCurrency(report.totalLoans)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interest @ 5% per month</p>
                  <p className="text-xl font-semibold text-green-600">{formatCurrency(report.totalLoanInterest)}</p>
                </div>
              </div>
            </div>

            {/* Net Calculation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-300 print:border-black">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Net Calculation</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Interest Income (from loans)</span>
                  <span className="text-lg font-semibold text-green-600">
                    + {formatCurrency(report.totalLoanInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Interest Expense (to depositors)</span>
                  <span className="text-lg font-semibold text-red-600">
                    - {formatCurrency(report.totalDepositInterest)}
                  </span>
                </div>
                <div className="border-t-2 border-blue-300 pt-3 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Net Profit/Loss</span>
                  <span className={`text-2xl font-bold ${
                    report.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatCurrency(report.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-200 print:border-black">
            <p className="text-sm text-gray-600 text-center">
              This report represents the complete settlement for financial year {report.year}.
              All active deposits and loans have been settled with calculated interest.
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              Generated on: {formatDate(new Date())}
            </p>
          </div>
        </div>
      )}

      {!report && !loading && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Select a year and click "Generate Report" to view the settlement report</p>
        </div>
      )}
    </div>
  );
};

export default YearlyReport;