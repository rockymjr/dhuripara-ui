// src/components/common/UpdatedNavbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { memberService } from '../../services/memberService';
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
        // ignore - treat as no activity
        setHasBankActivity(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [isMember]);

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
              <div className="flex items-center space-x-2">
                <div className="text-sm md:text-base font-bold">{isAdmin ? `Admin: ${adminUsername}` : memberName}</div>
                <button onClick={() => (isAdmin ? handleAdminLogout() : handleMemberLogout())} className="ml-1 px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white" title="Logout" aria-label="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm bg-blue-600 px-2 py-1 rounded" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher />
            {(isAdmin || isMember) && (
              <div className="flex items-center space-x-2">
                <div className="text-green-200 text-sm mr-2">{isAdmin ? `Admin: ${adminUsername}` : memberName}</div>
                <button onClick={() => (isAdmin ? handleAdminLogout() : handleMemberLogout())} className="ml-1 px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white" title="Logout" aria-label="Logout">
                  <LogOut size={16} />
                </button>
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

          <Link to="/vdf" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-indigo-600 hover:bg-indigo-700 transition px-1" title="VDF">
            <Package size={22} />
            <span className="text-xs text-white mt-1">VDF</span>
          </Link>

          {/* Admin/Operator: Gramin Bank button only */}
          {(showAdminMenu || showOperatorMenu) && (
            <Link to="/admin/gramin-bank" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-yellow-600 hover:bg-yellow-700 transition px-1" title="Gramin Bank">
              <Package size={22} />
              <span className="text-xs text-white mt-1">Gramin Bank</span>
            </Link>
          )}

          {/* Admin/Operator: Members button */}
          {(showAdminMenu || showOperatorMenu) && (
            <Link to="/admin/members" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-purple-600 hover:bg-purple-700 transition px-1" title="Members">
              <UsersIcon size={22} />
              <span className="text-xs text-white mt-1">Members</span>
            </Link>
          )}

          {(showOperatorMenu || showMemberMenu) && hasBankActivity && (
            <Link to="/member/dashboard" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-blue-600 hover:bg-blue-700 transition px-1" title="MyBank">
              <Home size={22} />
              <span className="text-xs text-white mt-1">MyBank</span>
            </Link>
          )}

          {/* MyVDF quick access (members/operators) */}
          {(showOperatorMenu || showMemberMenu) && (
            <Link to="/member/account" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-cyan-600 hover:bg-cyan-700 transition px-1" title="MyVDF">
              <Package size={22} />
              <span className="text-xs text-white mt-1">MyVDF</span>
            </Link>
          )}
        </div>

        {/* Mobile quick-access buttons */}
        <div className="flex md:hidden items-center space-x-3 mt-3 overflow-x-auto px-1 py-1">
          <Link to="/" className="flex flex-col items-center justify-center w-12 h-12 rounded border border-white/20 bg-gray-700 hover:bg-gray-800 transition px-1" onClick={() => setMobileMenuOpen(false)} aria-label="Home">
            <Home size={18} />
            <span className="text-[11px] text-white mt-1">Home</span>
          </Link>

          <Link to="/vdf" className="flex flex-col items-center justify-center w-12 h-12 rounded border border-white/20 bg-indigo-600 hover:bg-indigo-700 transition px-1" onClick={() => setMobileMenuOpen(false)} aria-label="VDF">
            <Package size={18} />
            <span className="text-[11px] text-white mt-1">VDF</span>
          </Link>

          {(showAdminMenu || showOperatorMenu) && (
            <Link to="/admin/gramin-bank" className="flex flex-col items-center justify-center w-12 h-12 rounded border border-white/20 bg-yellow-600 hover:bg-yellow-700 transition px-1" onClick={() => setMobileMenuOpen(false)} aria-label="Gramin Bank">
              <Package size={18} />
              <span className="text-[11px] text-white mt-1">Bank</span>
            </Link>
          )}

          {(showAdminMenu || showOperatorMenu) && (
            <Link to="/admin/members" className="flex flex-col items-center justify-center w-12 h-12 rounded border border-white/20 bg-purple-600 hover:bg-purple-700 transition px-1" onClick={() => setMobileMenuOpen(false)} aria-label="Members">
              <UsersIcon size={18} />
              <span className="text-[11px] text-white mt-1">Members</span>
            </Link>
          )}

          {(showOperatorMenu || showMemberMenu) && hasBankActivity && (
            <Link to="/member/dashboard" className="flex flex-col items-center justify-center w-12 h-12 rounded border border-white/20 bg-blue-600 hover:bg-blue-700 transition px-1" onClick={() => setMobileMenuOpen(false)} aria-label="MyBank">
              <Home size={18} />
              <span className="text-[11px] text-white mt-1">MyBank</span>
            </Link>
          )}

          {(showOperatorMenu || showMemberMenu) && (
            <Link to="/member/account" className="flex flex-col items-center justify-center w-12 h-12 rounded border border-white/20 bg-cyan-600 hover:bg-cyan-700 transition px-1" onClick={() => setMobileMenuOpen(false)} aria-label="MyVDF">
              <Package size={18} />
              <span className="text-[11px] text-white mt-1">MyVDF</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UpdatedNavbar;