import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavProvider } from './context/NavContext';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import RoomManagement from './pages/Admin/RoomManagement';
import BookingManagement from './pages/Admin/BookingManagement';
import UserManagement from './pages/Admin/UserManagement';
import Reports from './pages/Admin/Reports';
import AdminSettings from './pages/Admin/AdminSettings';

// Guest Pages
import GuestDashboard from './pages/Guest/GuestDashboard';
import RoomBrowsing from './pages/Guest/RoomBrowsing';
import GuestBookings from './pages/Guest/GuestBookings';
import GuestProfile from './pages/Guest/GuestProfile';
import EmailVerificationPrompt from './pages/Auth/EmailVerificationPrompt';
import EmailVerificationVerified from './pages/Auth/EmailVerificationVerified';
import EmailNotVerificationPrompt from './pages/Auth/EmailNotVerificationPrompt';
import ForgotPasswordRequest from './pages/Auth/ForgotPasswordRequest';
import ResetPassword from './pages/Auth/ResetPassword';
import AdminProfile from './pages/Admin/AdminProfile';
import LandingPage from './pages/LandingPage';
import PaymentCollection from './pages/Admin/PaymentCollection';

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requiredRole?: 'admin' | 'guest';
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/guest/dashboard'} replace />;
  }

  return <Layout>
    {loading && <LoadingSpinner />}
    {children}
  </Layout>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/guest/dashboard'} replace />;
  }

  return <>
    {loading && <LoadingSpinner />}
    {children}
  </>;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/email-verification-prompt" element={<PublicRoute><EmailVerificationPrompt /></PublicRoute>} />
          <Route path="/email-not-verified-prompt" element={<PublicRoute><EmailNotVerificationPrompt /></PublicRoute>} />
          <Route path="/email-verified" element={<PublicRoute><EmailVerificationVerified /></PublicRoute>} />
          <Route path="/forgot-password-request" element={<PublicRoute><ForgotPasswordRequest /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/rooms" element={
            <ProtectedRoute requiredRole="admin">
              <RoomManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute requiredRole="admin">
              <BookingManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/payment-collections" element={
            <ProtectedRoute requiredRole="admin">
              <PaymentCollection />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRole="admin">
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute requiredRole="admin">
              <AdminProfile />
            </ProtectedRoute>
          } />

          {/* Guest Routes */}
          <Route path="/guest/dashboard" element={
            <ProtectedRoute requiredRole="guest">
              <GuestDashboard />
            </ProtectedRoute>
          } />
          <Route path="/guest/rooms" element={
            <ProtectedRoute requiredRole="guest">
              <RoomBrowsing />
            </ProtectedRoute>
          } />
          <Route path="/guest/bookings" element={
            <ProtectedRoute requiredRole="guest">
              <GuestBookings />
            </ProtectedRoute>
          } />
          <Route path="/guest/profile" element={
            <ProtectedRoute requiredRole="guest">
              <GuestProfile />
            </ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <NavProvider>
        <AppContent />
      </NavProvider>
    </AuthProvider>
  );
}

export default App;