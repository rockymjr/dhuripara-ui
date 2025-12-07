import React, { useState } from 'react';
import { useMemberAuth } from '../../context/MemberAuthContext';
import MemberManagement from './MemberManagement';
import LoanManagement from './LoanManagement';
import DepositManagement from './DepositManagement';

const sections = [
  { key: 'members', label: 'Members' },
  { key: 'loans', label: 'Loans' },
  { key: 'deposits', label: 'Deposits' }
];

const filters = [
  { key: 'active', label: 'Active' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' }
];

const GraminBank = () => {
  const [selectedSection, setSelectedSection] = useState('members');
  const [selectedFilter, setSelectedFilter] = useState('active');
  const { isOperator } = useMemberAuth() || {};

  const renderSection = () => {
    // Operators should see readOnly views
    const readOnly = !!isOperator;
    switch (selectedSection) {
      case 'members':
        return <MemberManagement />;
      case 'loans':
        return <LoanManagement readOnly={readOnly} />;
      case 'deposits':
        return <DepositManagement readOnly={readOnly} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Gramin Bank</h2>
      <div className="flex gap-4 mb-4">
        {sections.map(section => (
          <button
            key={section.key}
            className={`px-4 py-2 rounded ${selectedSection === section.key ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setSelectedSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {filters.map(filter => (
          <button
            key={filter.key}
            className={`px-3 py-1 rounded ${selectedFilter === filter.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setSelectedFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div>
        <div className="border rounded p-4 bg-white shadow mb-4">
          <h3 className="text-lg font-semibold mb-2">{sections.find(s => s.key === selectedSection).label} ({filters.find(f => f.key === selectedFilter).label})</h3>
        </div>

        {/* Render the selected admin component */}
        <div>
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default GraminBank;
