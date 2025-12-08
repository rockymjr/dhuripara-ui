import React, { useEffect, useState } from 'react';
import { memberService } from '../../services/memberService';
import Loader from '../common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import StyledTable from '../common/StyledTable';

const MemberAccount = () => {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const data = await memberService.getVdfAccount();
      setAccount(data);
      if (data && Array.isArray(data.contributions)) {
        const yrs = Array.from(new Set(data.contributions.map((c) => c.year))).filter(Boolean);
        yrs.sort((a, b) => b - a);
        setAvailableYears(yrs);
        const currentYear = new Date().getFullYear();
        if (yrs.includes(currentYear)) setSelectedYear(String(currentYear));
      }
    } catch (err) {
      console.error('Failed to load VDF account', err);
      alert('Failed to load VDF account');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading VDF account..." />;
  if (!account) return <div className="text-center py-8">No VDF account data found</div>;

  const contributions = Array.isArray(account.contributions) ? account.contributions : [];

  const filteredContributions = contributions.filter((c) => {
    if (selectedYear === 'all') return true;
    return String(c.year) === String(selectedYear);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My VDF Account</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-600">Total Paid (All-time)</div>
          <div className="text-xl font-bold text-green-600">{formatCurrency(account.totalPaidAllTime || 0)}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-600">Total Due (All-time)</div>
          <div className="text-xl font-bold text-red-600">{formatCurrency(account.totalDueAllTime || 0)}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-600">Current Year Due</div>
          <div className="text-xl font-bold text-orange-600">{formatCurrency(account.currentYearDue || 0)}</div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contributions</h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Year</label>
          <select
            className="form-select border rounded px-2 py-1"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All</option>
            {availableYears.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredContributions.length === 0 ? (
        <div className="text-gray-600">No contributions found</div>
      ) : (
        <StyledTable
          renderHeader={() => (
            <>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Month</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Notes</th>
            </>
          )}
        >
          {filteredContributions.map((c, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(c.paymentDate)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(c.amount)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{c.month}/{c.year}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{c.notes || '-'}</td>
            </tr>
          ))}
        </StyledTable>
      )}
    </div>
  );
};

export default MemberAccount;
