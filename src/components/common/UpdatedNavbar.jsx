// src/components/common/UpdatedNavbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { memberService } from '../../services/memberService';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Home, User, LogOut, Users as UsersIcon, TrendingUp, TrendingDown, 
         Package, DollarSign, Calendar, Gift, Bell, Wallet } from 'lucide-react';
import VdfNotifications from '../vdf/VdfNotifications';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

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

  // Fetch unread notification count for members
  useEffect(() => {
    if (!isMember) return;
    const fetchUnreadCount = async () => {
      try {
        const { vdfNotificationService } = await import('../../services/vdfNotificationService');
        const unread = await vdfNotificationService.getUnreadNotifications();
        setUnreadNotificationCount(unread.length);
      } catch (err) {
        console.error('Failed to fetch notification count', err);
      }
    };
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isMember]);

  return (
    <nav className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
              <span className="text-sm md:text-base font-bold">{t('appName')}</span>
            </Link>
          </div>

          {/* Mobile: show language switcher and username or login button at top-right */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            {(isAdmin || isMember) ? (
              <div className="flex items-center space-x-2">
                <div className="text-sm md:text-base font-bold">{isAdmin ? `${t('admin')}: ${adminUsername}` : memberName}</div>
                <button onClick={() => (isAdmin ? handleAdminLogout() : handleMemberLogout())} className="ml-1 px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white" title={t('logout')} aria-label={t('logout')}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm bg-blue-600 px-2 py-1 rounded" onClick={() => setMobileMenuOpen(false)}>
                {t('loginTitle')}
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher />
            {(isAdmin || isMember) && (
              <div className="flex items-center space-x-2">
                {isMember && (
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="relative p-2 text-white hover:bg-green-700 rounded transition"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>
                )}
                <div className="text-green-200 text-sm mr-2">{isAdmin ? `${t('admin')}: ${adminUsername}` : memberName}</div>
                <button onClick={() => (isAdmin ? handleAdminLogout() : handleMemberLogout())} className="ml-1 px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white" title={t('logout')} aria-label={t('logout')}>
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
          <Link to="/" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-gray-700 hover:bg-gray-800 transition px-1" title={t('home')}>
            <Home size={22} />
            <span className="text-xs text-white mt-1">{t('home')}</span>
          </Link>

          <Link to="/vdf" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-indigo-600 hover:bg-indigo-700 transition px-1" title={t('vdf')}>
            <Package size={22} />
            <span className="text-xs text-white mt-1">{t('vdfButton')}</span>
          </Link>

          {/* Member-only: My Dashboard */}
          {showMemberMenu && (
            <Link to="/member/dashboard" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-sky-600 hover:bg-sky-700 transition px-1" title={t('dashboard')}>
              <Wallet size={22} />
              <span className="text-xs text-white mt-1">{t('dashboard')}</span>
            </Link>
          )}

          {/* Admin/Operator/Member: Gramin Bank button */}
            {(showAdminMenu || showOperatorMenu || showMemberMenu) && (
            <Link to={showMemberMenu ? "/member/dashboard?section=bank" : "/admin/gramin-bank"} className="flex flex-col items-center justify-center w-16 h-16 rounded bg-yellow-600 hover:bg-yellow-700 transition px-1" title={t('graminBank')}>
              <Package size={22} />
              <span className="text-xs text-white mt-1">{t('graminBank')}</span>
            </Link>
          )}

          {/* Admin/Operator: Members button and Admin Dashboard */}
          {(showAdminMenu || showOperatorMenu) && (
            <>
              <Link to="/admin/dashboard" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-gray-700 hover:bg-gray-800 transition px-1" title={t('admin')}>
                <Package size={22} />
                <span className="text-xs text-white mt-1">{t('admin') || 'Admin'}</span>
              </Link>
              <Link to="/admin/members" className="flex flex-col items-center justify-center w-16 h-16 rounded bg-purple-600 hover:bg-purple-700 transition px-1" title={t('members')}>
                <UsersIcon size={22} />
                <span className="text-xs text-white mt-1">{t('members')}</span>
              </Link>
            </>
          )}

        </div>

        {/* Mobile quick-access buttons */}
          <div className="flex md:hidden items-center space-x-3 mt-3 overflow-x-auto px-1 py-1">
          <Link to="/" className="flex flex-col items-center justify-center w-12 h-12 rounded border border-white/20 bg-gray-700 hover:bg-gray-800 transition px-1" onClick={() => setMobileMenuOpen(false)} aria-label={t('home')}>
            <Home size={18} />
            <span className="text-[11px] text-white mt-1">{t('home')}</span>
          </Link>

          <Link to="/vdf" className="flex flex-col items-center justify-center w-12 h-12 rounded border border-white/20 bg-indigo-600 hover:bg-indigo-700 transition px-1" onClick={() => setMobileMenuOpen(false)} aria-label={t('vdf')}>
            <Package size={18} />
            <span className="text-[11px] text-white mt-1">{t('vdfButton')}</span>
          </Link>

          {/* Member-only: My Dashboard (mobile) */}
          {showMemberMenu && (
            <Link to="/member/dashboard" className="flex flex-col items-center justify-center w-12 h-12 rounded border border-white/20 bg-sky-600 hover:bg-sky-700 transition px-1" onClick={() => setMobileMenuOpen(false)} aria-label={t('dashboard')}>
              <Wallet size={18} />
              <span className="text-[11px] text-white mt-1">{t('dashboard')}</span>
            </Link>
          )}

          {(showAdminMenu || showOperatorMenu || showMemberMenu) && (
            <Link to={showMemberMenu ? "/member/dashboard?section=bank" : "/admin/gramin-bank"} className="flex flex-col items-center justify-center w-12 h-12 rounded border border-white/20 bg-yellow-600 hover:bg-yellow-700 transition px-1" onClick={() => setMobileMenuOpen(false)} aria-label={t('graminBank')}>
              <Package size={18} />
              <span className="text-[11px] text-white mt-1">{t('bank')}</span>
            </Link>
          )}

          {(showAdminMenu || showOperatorMenu) && (
            <Link to="/admin/members" className="flex flex-col items-center justify-center w-12 h-12 rounded border border-white/20 bg-purple-600 hover:bg-purple-700 transition px-1" onClick={() => setMobileMenuOpen(false)} aria-label={t('members')}>
              <UsersIcon size={18} />
              <span className="text-[11px] text-white mt-1">{t('members')}</span>
            </Link>
          )}

        </div>
      </div>

      {/* Notifications Modal */}
      {showNotifications && isMember && (
        <VdfNotifications
          onClose={() => {
            setShowNotifications(false);
            // Refresh unread count
            import('../../services/vdfNotificationService').then(({ vdfNotificationService }) => {
              vdfNotificationService.getUnreadNotifications()
                .then(unread => setUnreadNotificationCount(unread.length))
                .catch(() => {});
            });
          }}
        />
      )}
    </nav>
  );
};

export default UpdatedNavbar;