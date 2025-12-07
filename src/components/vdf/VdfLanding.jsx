import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMemberAuth } from '../../context/MemberAuthContext';
import VdfPublicExpenses from './VdfPublicExpenses';
import VdfPublicDeposits from './VdfPublicDeposits';
import VdfMonthlyContribution from './VdfMonthlyContribution';
import VdfFamilyManagement from '../admin/vdf/VdfFamilyManagement';
import VdfExpenseManagement from './VdfExpenseManagement';

const sections = [
  { key: 'expenses', label: 'Expenses' },
  { key: 'deposits', label: 'Deposits' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'families', label: 'Families', adminOnly: true }
];

const VdfLanding = () => {
  const [selectedSection, setSelectedSection] = useState('expenses');
  const { isAuthenticated: isAdmin } = useAuth();
  const { isAuthenticated: isMember, isOperator } = useMemberAuth();

  const showFamilies = isAdmin || (isMember && isOperator);

  const renderSection = () => {
    switch (selectedSection) {
      case 'expenses':
        return isAdmin ? <VdfExpenseManagement /> : <VdfPublicExpenses />;
      case 'deposits':
        return <VdfPublicDeposits />;
      case 'monthly':
        return <VdfMonthlyContribution />;
      case 'families':
        return showFamilies ? <VdfFamilyManagement readOnly={!!isOperator} /> : null;
      default:
        return null;
    }
  };

  const visibleSections = sections.filter(s => !s.adminOnly || showFamilies);

  return (
    <div className="p-2 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">VDF</h1>

      {/* Section Tabs - Horizontal Scrollable on Mobile */}
      <div className="flex gap-1 md:gap-2 mb-3 md:mb-6 overflow-x-auto pb-2">
        {visibleSections.map(section => (
          <button
            key={section.key}
            onClick={() => setSelectedSection(section.key)}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base whitespace-nowrap transition flex-shrink-0 ${
              selectedSection === section.key
                ? 'bg-green-600 text-white font-semibold'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="bg-white rounded shadow p-2 md:p-6">
        {renderSection()}
      </div>
    </div>
  );
};

export default VdfLanding;
