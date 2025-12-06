// src/components/common/UpdatedNavbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Home, User, LogOut, Users as UsersIcon, TrendingUp, TrendingDown, 
         Package, DollarSign, Calendar, Gift } from 'lucide-react';

const UpdatedNavbar = () => {
  const { isAuthenticated: isAdmin, username: adminUsername, logout: adminLogout } = useAuth();
  const { isAuthenticated: isMember, memberName, isOperator, logout: memberLogout } = useMemberAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAdminLogout = () => {
    adminLogout();
    setMobileMenuOpen(false);
  };

  const handleMemberLogout = () => {
    memberLogout();
    setMobileMenuOpen(false);
  };

  const showLoginButtons = !isAdmin && !isMember;
  const showAdminMenu = isAdmin;
  const showMemberMenu = isMember && !isOperator;
  const showOperatorMenu = isMember && isOperator;

  return (
    <nav className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
              <span className="text-sm md:text-base font-bold">Dhuripara Village</span>
            </Link>
          </div>

          {/* Mobile: show language switcher and username or login button at top-right */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            {(isAdmin || isMember) ? (
              <div className="text-sm md:text-base font-bold">{isAdmin ? `Admin: ${adminUsername}` : memberName}</div>
            ) : (
              <Link to="/login" className="text-sm bg-blue-600 px-2 py-1 rounded" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher />
            {(isAdmin || isMember) && (
              <div className="text-green-200 text-sm mr-2">
                {isAdmin ? `Admin: ${adminUsername}` : memberName}
              </div>
            )}

            {showLoginButtons && (
              <Link to="/login" className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition text-white">
                <User size={16} />
                <span className="text-sm">{t('loginTitle')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* VDF Quick Access Buttons (desktop) - visible to everyone */}
        <div className="hidden md:flex items-center gap-2 mt-3 overflow-x-auto">
          <Link to="/" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-gray-700 hover:bg-gray-800 transition px-1" title="Home">
            <Home size={22} />
            <span className="text-xs text-white mt-1">Home</span>
          </Link>

          <Link to={isAdmin ? "/admin/vdf/expenses" : "/vdf/expenses"} className="flex flex-col items-center justify-center w-16 h-16 rounded bg-orange-600 hover:bg-orange-700 transition px-1" title="VDF Expenses">
            <Package size={22} />
            <span className="text-xs text-white mt-1">Expenses</span>
          </Link>

          <Link to="/vdf/contributions" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-teal-600 hover:bg-teal-700 transition px-1" title="Monthly Contribution">
            <Calendar size={22} />
            <span className="text-xs text-white mt-1">Monthly</span>
          </Link>

          <button className="flex flex-col items-center justify-center w-16 h-16 rounded bg-pink-600 hover:bg-pink-700 transition px-1 opacity-50 cursor-not-allowed" title="Festivals (Coming Soon)" disabled>
            <Gift size={22} />
            <span className="text-xs text-white mt-1">Festivals</span>
          </button>

          {/* Admin/Operator specific buttons */}
          {(showAdminMenu || showOperatorMenu) && (
            <>
              <Link to="/admin/members" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-indigo-600 hover:bg-indigo-700 transition px-1" title="Members">
                <UsersIcon size={22} />
                <span className="text-xs text-white mt-1">Members</span>
              </Link>

              <Link to="/admin/deposits" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-green-600 hover:bg-green-700 transition px-1" title="Bank Deposits">
                <TrendingUp size={22} />
                <span className="text-xs text-white mt-1">Deposits</span>
              </Link>

              <Link to="/admin/loans" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-red-600 hover:bg-red-700 transition px-1" title="Bank Loans">
                <TrendingDown size={22} />
                <span className="text-xs text-white mt-1">Loans</span>
              </Link>

              <Link to="/admin/vdf/families" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-cyan-600 hover:bg-cyan-700 transition px-1" title="VDF Families">
                <UsersIcon size={22} />
                <span className="text-xs text-white mt-1">Families</span>
              </Link>
            </>
          )}

          {(showOperatorMenu || showMemberMenu) && (
            <Link to="/member/dashboard" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-blue-600 hover:bg-blue-700 transition px-1" title="My Dashboard">
              <Home size={22} />
              <span className="text-xs text-white mt-1">MyDash</span>
            </Link>
          )}

          {(isAdmin || isMember) && (
            <button onClick={() => (isAdmin ? handleAdminLogout() : handleMemberLogout())} className="flex flex-col items-center justify-center w-16 h-16 rounded bg-purple-600 hover:bg-purple-700 transition px-1" title="Logout">
              <LogOut size={22} />
              <span className="text-xs text-white mt-1">Logout</span>
            </button>
          )}
        </div>

        {/* Mobile quick-access buttons */}
        <div className="flex md:hidden items-center space-x-2 mt-3 overflow-x-auto">
          <Link to="/" className="flex flex-col items-center justify-center min-w-12 h-12 rounded border border-white/30 bg-gray-700 hover:bg-gray-800 transition px-1" onClick={() => setMobileMenuOpen(false)}>
            <Home size={18} />
            <span className="text-[11px] text-white mt-1">Home</span>
          </Link>

          <Link to={isAdmin ? "/admin/vdf/expenses" : "/vdf/expenses"} className="flex flex-col items-center justify-center min-w-13 h-12 rounded border border-white/30 bg-orange-600 hover:bg-orange-700 transition px-1" onClick={() => setMobileMenuOpen(false)}>
            <Package size={18} />
            <span className="text-[11px] text-white mt-1">Expense</span>
          </Link>

          <Link to="/vdf/contributions" className="flex flex-col items-center justify-center min-w-13 h-12 rounded border border-white/30 bg-teal-600 hover:bg-teal-700 transition px-1" onClick={() => setMobileMenuOpen(false)}>
            <Calendar size={18} />
            <span className="text-[11px] text-white mt-1">Monthly</span>
          </Link>

          {(showAdminMenu || showOperatorMenu) && (
            <>
              <Link to="/admin/members" className="flex flex-col items-center justify-center min-w-13 h-12 rounded border border-white/30 bg-indigo-600 hover:bg-indigo-700 transition px-1" onClick={() => setMobileMenuOpen(false)}>
                <UsersIcon size={18} />
                <span className="text-[11px] text-white mt-1">Members</span>
              </Link>

              <Link to="/admin/vdf/families" className="flex flex-col items-center justify-center min-w-13 h-12 rounded border border-white/30 bg-cyan-600 hover:bg-cyan-700 transition px-1" onClick={() => setMobileMenuOpen(false)}>
                <UsersIcon size={18} />
                <span className="text-[11px] text-white mt-1">Families</span>
              </Link>
            </>
          )}

          {(showOperatorMenu || showMemberMenu) && (
            <Link to="/member/dashboard" className="flex flex-col items-center justify-center min-w-13 h-12 rounded border border-white/30 bg-blue-600 hover:bg-blue-700 transition px-1" onClick={() => setMobileMenuOpen(false)}>
              <Home size={18} />
              <span className="text-[11px] text-white mt-1">MyDash</span>
            </Link>
          )}

          {(isAdmin || isMember) && (
            <button onClick={() => (isAdmin ? handleAdminLogout() : handleMemberLogout())} className="flex flex-col items-center justify-center min-w-12 h-12 rounded border border-red-400/50 bg-red-500 hover:bg-red-600 transition px-1">
              <LogOut size={18} />
              <span className="text-[11px] text-white mt-1">Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UpdatedNavbar;