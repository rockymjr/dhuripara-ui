import React, { useEffect, useState } from 'react';
import { memberService } from '../../services/memberService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import Loader from '../common/Loader';
import { Users, Calendar, CreditCard, FileText, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import StyledTable from '../common/StyledTable';

const FamilyDetails = () => {
  const [familyDetails, setFamilyDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilyDetails();
  }, []);

  const fetchFamilyDetails = async () => {
    try {
      setLoading(true);
      const data = await memberService.getFamilyDetails();
      setFamilyDetails(data);
    } catch (error) {
      console.error('Error fetching family details:', error);
      if (error.response?.status === 404 || error.response?.data?.message?.includes('not associated')) {
        alert('You are not associated with any family. Please contact admin.');
      } else {
        alert('Failed to load family details');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading family details..." />;
  if (!familyDetails) return <div className="text-center py-8">No family details found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Family Details</h2>
      </div>

      {/* Family Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users size={24} className="text-indigo-600" />
          <h3 className="text-xl font-semibold">{familyDetails.familyHeadName}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Contribution Enabled:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
              familyDetails.isContributionEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {familyDetails.isContributionEnabled ? 'Yes' : 'No'}
            </span>
          </div>
          {familyDetails.effectiveFrom && (
            <div>
              <span className="text-sm text-gray-600">Effective From:</span>
              <span className="ml-2 font-medium">{formatDate(familyDetails.effectiveFrom)}</span>
            </div>
          )}
          {familyDetails.monthlyAmount && (
            <div>
              <span className="text-sm text-gray-600">Monthly Amount:</span>
              <span className="ml-2 font-medium">{formatCurrency(familyDetails.monthlyAmount)}</span>
            </div>
          )}
        </div>
        {familyDetails.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Notes:</span>
            <p className="text-sm text-gray-800 mt-1">{familyDetails.notes}</p>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} />
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Total</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Family Deposits</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(familyDetails.totalDeposits || 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown size={24} />
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Total</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Family Loans</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(familyDetails.totalLoans || 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={24} />
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">VDF</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">VDF Contributions</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(familyDetails.totalVdfContributions || 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <FileText size={24} />
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">VDF</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">VDF Expenses</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(familyDetails.totalVdfExpenses || 0)}</p>
        </div>
      </div>

      {/* Family Members Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Family Members ({familyDetails.members?.length || 0})</h3>
        </div>
        <StyledTable
          renderHeader={() => (
            <>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Date of Birth</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Aadhar No</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Voter No</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">PAN No</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Deposits</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">Loans</th>
            </>
          )}
        >
          {!familyDetails.members || familyDetails.members.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No family members found</td>
            </tr>
          ) : (
            familyDetails.members.map((member) => (
              <tr key={member.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {member.firstName} {member.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.phone || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.dateOfBirth ? formatDate(member.dateOfBirth) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                  {member.aadharNo || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                  {member.voterNo || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                  {member.panNo || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                  {formatCurrency(member.totalDeposits || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                  {formatCurrency(member.totalLoans || 0)}
                </td>
              </tr>
            ))
          )}
        </StyledTable>
      </div>
    </div>
  );
};

export default FamilyDetails;

