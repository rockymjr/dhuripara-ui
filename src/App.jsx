// src/App.jsx - Updated with VDF routes
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MemberAuthProvider, useMemberAuth } from './context/MemberAuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/common/UpdatedNavbar'; // Use updated navbar
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import MemberProtectedRoute from './components/common/MemberProtectedRoute';
import UnifiedLogin from './components/common/UnifiedLogin';
import { initGA, trackPageView } from './utils/analytics';

// Public Pages
import UpdatedSummary from './components/public/UpdatedSummary'; // Updated with VDF
import DepositList from './components/public/DepositList';
import LoanList from './components/public/LoanList';

// VDF Public Pages
import VdfPublicExpenses from './components/vdf/VdfPublicExpenses';
import VdfPublicDeposits from './components/vdf/VdfPublicDeposits';
import VdfMonthlyContribution from './components/vdf/VdfMonthlyContribution';
import VdfLanding from './components/vdf/VdfLanding';

// Admin Pages
import MemberManagement from './components/admin/MemberManagement';
import DepositManagement from './components/admin/DepositManagement';
import LoanManagement from './components/admin/LoanManagement';
import MemberStatement from './components/admin/MemberStatement';
import YearlyReport from './components/admin/YearlyReport';

// VDF Admin Pages
import VdfFamilyManagement from './components/admin/vdf/VdfFamilyManagement';
import VdfExpenseManagement from './components/vdf/VdfExpenseManagement';
//import VdfContributionManagement from './components/admin/vdf/VdfContributionManagement';

// Member Pages
import MemberDashboard from './components/member/MemberDashboard';
import GraminBank from './components/admin/GraminBank';

// Analytics Tracker Component
// function AnalyticsTracker() {
//   const location = useLocation();

//   useEffect(() => {
//     trackPageView(location.pathname + location.search, document.title);
//   }, [location]);

//   return null;
// }

// Main App Component
function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <MemberAuthProvider>
          <Router>
            {/* <AnalyticsTracker /> */}
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Navbar />
              <main className="flex-grow">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </Router>
        </MemberAuthProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

// AppRoutes Component
function AppRoutes() {
  let isOperator = false;
  try {
    const memberCtx = useMemberAuth();
    isOperator = !!memberCtx?.isOperator;
  } catch (err) {
    // If hook is used outside provider or any other error occurs, log and continue with defaults
    console.error('useMemberAuth threw in AppRoutes, defaulting isOperator=false', err);
    isOperator = false;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<UpdatedSummary />} />
      <Route path="/deposits" element={<DepositList />} />
      <Route path="/loans" element={<LoanList />} />

      {/* VDF Public Routes */}
      <Route path="/vdf" element={<VdfLanding />} />
      <Route path="/vdf/expenses" element={<VdfPublicExpenses />} />
      <Route path="/vdf/deposits" element={<VdfPublicDeposits />} />
      <Route path="/vdf/contributions" element={<VdfMonthlyContribution />} />

      {/* Unified Login Route */}
      <Route path="/login" element={<UnifiedLogin />} />

      {/* Admin Routes - Banking */}
      <Route
        path="/admin/gramin-bank"
        element={
          isOperator
            ? <GraminBank />
            : <ProtectedRoute><GraminBank /></ProtectedRoute>
        }
      />
      <Route path="/admin/dashboard" element={<Navigate to="/admin/members" replace />} />
      <Route
        path="/admin/members"
        element={
          isOperator
            ? <MemberManagement readOnly={true} />
            : <ProtectedRoute><MemberManagement readOnly={false} /></ProtectedRoute>
        }
      />
      <Route
        path="/admin/deposits"
        element={
          isOperator
            ? <DepositManagement readOnly={true} />
            : <ProtectedRoute><DepositManagement readOnly={false} /></ProtectedRoute>
        }
      />
      <Route
        path="/admin/loans"
        element={
          isOperator
            ? <LoanManagement readOnly={true} />
            : <ProtectedRoute><LoanManagement readOnly={false} /></ProtectedRoute>
        }
      />
      <Route
        path="/admin/statements"
        element={
          isOperator
            ? <MemberStatement readOnly={true} />
            : <ProtectedRoute><MemberStatement readOnly={false} /></ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <YearlyReport />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes - VDF */}
      <Route
        path="/admin/vdf/families"
        element={
          isOperator
            ? <VdfFamilyManagement readOnly={true} />
            : <ProtectedRoute><VdfFamilyManagement readOnly={false} /></ProtectedRoute>
        }
      />
      <Route
        path="/admin/vdf/expenses"
        element={
          <ProtectedRoute>
            <VdfExpenseManagement />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/admin/vdf/contributions"
        element={
          <ProtectedRoute>
            <VdfContributionManagement />
          </ProtectedRoute>
        }
      /> */}

      {/* Member Routes */}
      <Route
        path="/member/dashboard"
        element={
          <MemberProtectedRoute>
            <MemberDashboard />
          </MemberProtectedRoute>
        }
      />

      {/* Admin Routes - VDF */}
      <Route
        path="/admin/vdf/families"
        element={
          isOperator
            ? <VdfFamilyManagement readOnly={true} />
            : <ProtectedRoute><VdfFamilyManagement readOnly={false} /></ProtectedRoute>
        }
      />
      <Route
        path="/admin/vdf/expenses"
        element={
          <ProtectedRoute>
            <VdfExpenseManagement />
          </ProtectedRoute>
        }
      />
    

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;