import React from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, TrendingDown, FileText, Calendar } from 'lucide-react';

const OperatorDashboard = () => {
  const menuItems = [
    {
      title: 'Member Statements',
      description: 'View member transaction history',
      icon: FileText,
      link: '/admin/statements',
      color: 'bg-purple-500'
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
        <h1 className="text-3xl font-bold text-gray-800">Member Dashboard</h1>
        <p className="text-gray-600 mt-2">View your village fund system</p>
      </div>

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
    </div>
  );
};

export default OperatorDashboard;