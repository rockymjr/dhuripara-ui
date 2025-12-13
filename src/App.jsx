// src/App.jsx - RouterProvider with future flags to silence react-router warnings
import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MemberAuthProvider, useMemberAuth } from './context/MemberAuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/common/UpdatedNavbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import MemberProtectedRoute from './components/common/MemberProtectedRoute';
import UnifiedLogin from './components/common/UnifiedLogin';
import { initGA } from './utils/analytics';

// Public Pages
import UpdatedSummary from './components/public/UpdatedSummary';
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
import SessionManagement from './components/admin/SessionManagement';

// VDF Admin Pages
import VdfFamilyManagement from './components/admin/vdf/VdfFamilyManagement';
import VdfExpenseManagement from './components/vdf/VdfExpenseManagement';
import VdfDepositManagement from './components/vdf/VdfDepositManagement';

// Member Pages
import MemberDashboard from './components/member/MemberDashboard';
import MemberAccount from './components/member/MemberAccount';
import FamilyDetails from './components/member/FamilyDetails';
import MyDocuments from './components/member/MyDocuments';
import FamilyDocuments from './components/member/FamilyDocuments';
import GraminBank from './components/admin/GraminBank';

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <MemberAuthProvider>
          <RouterWrapper />
        </MemberAuthProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

function RouterWrapper() {
  const memberCtx = useMemberAuth();
  const isOperator = !!memberCtx?.isOperator;
  function Layout() {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<UpdatedSummary />} />
        <Route path="/deposits" element={<DepositList />} />
        <Route path="/loans" element={<LoanList />} />

        {/* VDF Public Routes */}
        <Route path="/vdf" element={<VdfLanding />} />
        <Route path="/vdf/expenses" element={<VdfPublicExpenses />} />
        <Route path="/vdf/deposits" element={<VdfPublicDeposits />} />
        <Route path="/vdf/contributions" element={<VdfMonthlyContribution />} />

        {/* Auth / Login */}
        <Route path="/login" element={<UnifiedLogin />} />

        {/* Admin banking - accessible to admin, operator, and members */}
        <Route path="/admin/gramin-bank" element={
          isOperator ? <GraminBank /> : 
          <ProtectedRoute><GraminBank /></ProtectedRoute>
        } />
        <Route path="/member/bank" element={<MemberProtectedRoute><GraminBank /></MemberProtectedRoute>} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin/members" replace />} />
        <Route path="/admin/members" element={isOperator ? <MemberManagement readOnly={true} /> : <ProtectedRoute><MemberManagement readOnly={false} /></ProtectedRoute>} />
        <Route path="/admin/deposits" element={isOperator ? <DepositManagement readOnly={true} /> : <ProtectedRoute><DepositManagement readOnly={false} /></ProtectedRoute>} />
        <Route path="/admin/loans" element={isOperator ? <LoanManagement readOnly={true} /> : <ProtectedRoute><LoanManagement readOnly={false} /></ProtectedRoute>} />
        <Route path="/admin/statements" element={isOperator ? <MemberStatement readOnly={true} /> : <ProtectedRoute><MemberStatement readOnly={false} /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute><YearlyReport /></ProtectedRoute>} />
        <Route path="/admin/sessions" element={<ProtectedRoute><SessionManagement /></ProtectedRoute>} />

        {/* Admin - VDF */}
        <Route path="/admin/vdf/families" element={isOperator ? <VdfFamilyManagement readOnly={true} /> : <ProtectedRoute><VdfFamilyManagement readOnly={false} /></ProtectedRoute>} />
        <Route path="/admin/vdf/deposits" element={<ProtectedRoute><VdfDepositManagement /></ProtectedRoute>} />
        <Route path="/admin/vdf/expenses" element={<ProtectedRoute><VdfExpenseManagement /></ProtectedRoute>} />

        {/* Member */}
        <Route path="/member/dashboard" element={<MemberProtectedRoute><MemberDashboard /></MemberProtectedRoute>} />
        <Route path="/member/account" element={<MemberProtectedRoute><MemberAccount /></MemberProtectedRoute>} />
        <Route path="/member/family" element={<MemberProtectedRoute><FamilyDetails /></MemberProtectedRoute>} />
        <Route path="/member/documents" element={<MemberProtectedRoute><MyDocuments /></MemberProtectedRoute>} />
        <Route path="/member/family-documents" element={<MemberProtectedRoute><FamilyDocuments /></MemberProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </>
    ),
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );

  return <RouterProvider router={router} />;
}

export default App;
// end of file