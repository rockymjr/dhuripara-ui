import React, { useState, useEffect } from 'react';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { memberService } from '../../services/memberService';
import { useLanguage } from '../../context/LanguageContext';
import LoanManagement from './LoanManagement';
import DepositManagement from './DepositManagement';
import UnifiedMemberAccount from '../member/UnifiedMemberAccount';

const sections = [
    { key: 'loans', label: 'Loans' },
    { key: 'deposits', label: 'Deposits' },
    { key: 'account', label: 'My Account' }
];

const loanFilters = [
    { key: 'ACTIVE', label: 'Active' },
    { key: 'CLOSED', label: 'Closed' },
    { key: 'ALL', label: 'All' }
];

const depositFilters = [
    { key: 'ACTIVE', label: 'Active' },
    { key: 'RETURNED', label: 'Returned' },
    { key: 'ALL', label: 'All' }
];

const GraminBank = () => {
    const { t } = useLanguage();
    const [selectedSection, setSelectedSection] = useState('loans');
    const [selectedLoanFilter, setSelectedLoanFilter] = useState('ACTIVE');
    const [selectedDepositFilter, setSelectedDepositFilter] = useState('ACTIVE');
    const { isOperator, isAuthenticated: isMember } = useMemberAuth() || {};
    const [hasBankActivity, setHasBankActivity] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            if (!isMember) return;
            try {
                const data = await memberService.getDashboard();
                if (!mounted) return;
                const deposits = data?.deposits || [];
                const loans = data?.loans || [];
                setHasBankActivity(deposits.length > 0 || loans.length > 0);
            } catch (err) {
                setHasBankActivity(false);
            }
        };
        fetch();
        return () => { mounted = false; };
    }, [isMember]);

    const renderSection = () => {
        // Operators should see readOnly views
        const readOnly = !!isOperator;
        switch (selectedSection) {
            case 'loans':
                return <LoanManagement readOnly={readOnly} statusFilter={selectedLoanFilter} onFilterChange={setSelectedLoanFilter} />;
            case 'deposits':
                return <DepositManagement readOnly={readOnly} statusFilter={selectedDepositFilter} onFilterChange={setSelectedDepositFilter} />;
            case 'account':
                return <UnifiedMemberAccount readOnly={readOnly} />;
            default:
                return null;
        }
    };

    const visibleSections = sections.filter(s => {
        if (s.key === 'account') {
            return (isMember || isOperator) && hasBankActivity;
        }
        return true;
    });

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Gramin Bank</h2>
            <div className="flex gap-4 mb-4 items-center flex-wrap">
                {visibleSections.map(section => (
                    <button
                        key={section.key}
                        className={`px-4 py-2 rounded ${selectedSection === section.key ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setSelectedSection(section.key)}
                    >
                        {section.label}
                    </button>
                ))}
                {selectedSection === 'loans' && (
                    <div className="ml-auto flex items-center gap-2">
                        <label className="text-sm text-gray-700">Filter:</label>
                        <select
                            value={selectedLoanFilter}
                            onChange={(e) => setSelectedLoanFilter(e.target.value)}
                            className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {loanFilters.map(filter => (
                                <option key={filter.key} value={filter.key}>{filter.label}</option>
                            ))}
                        </select>
                    </div>
                )}
                {selectedSection === 'deposits' && (
                    <div className="ml-auto flex items-center gap-2">
                        <label className="text-sm text-gray-700">Filter:</label>
                        <select
                            value={selectedDepositFilter}
                            onChange={(e) => setSelectedDepositFilter(e.target.value)}
                            className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {depositFilters.map(filter => (
                                <option key={filter.key} value={filter.key}>{filter.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div>
                {/* Render the selected admin component */}
                <div>
                    {renderSection()}
                </div>
            </div>
        </div>
    );
};

export default GraminBank;
