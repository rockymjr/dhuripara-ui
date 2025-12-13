import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import UnifiedMemberAccount from '../member/UnifiedMemberAccount';
import { Users, TrendingUp, TrendingDown, FileText, Calendar } from 'lucide-react';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('memberId');
  const menuItems = [
    {
      title: 'Member Management',
      description: 'Add, edit, and manage members',
      icon: Users,
      link: '/admin/members',
      color: 'bg-blue-500'
    },
    {
      title: 'Deposit Management',
      description: 'Record and manage deposits',
      icon: TrendingUp,
      link: '/admin/deposits',
      color: 'bg-green-500'
    },
    {
      title: 'Loan Management',
      description: 'Sanction and manage loans',
      icon: TrendingDown,
      link: '/admin/loans',
      color: 'bg-red-500'
    },
    {
      title: 'Member Statements',
      description: 'View member transaction history',
      icon: FileText,
      link: '/admin/dashboard',
      color: 'bg-purple-500'
    },
    {
      title: 'Families',
      description: 'Manage VDF families',
      icon: Users,
      link: '/admin/vdf/families',
      color: 'bg-green-500'
    },
    {
      title: 'Yearly Reports',
      description: 'View settlement reports',
      icon: Calendar,
      link: '/admin/reports',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your village fund system</p>
      </div>

      {memberId ? (
        // If a memberId query param is present, show the UnifiedMemberAccount (admin view).
        <UnifiedMemberAccount />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.link}
                className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 border-t-4 border-transparent hover:border-green-500"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${item.color} p-3 rounded-lg text-white`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;