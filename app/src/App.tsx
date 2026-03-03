import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Public Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AnggotaPage from '@/pages/admin/AnggotaPage';
import AgendaPage from '@/pages/admin/AgendaPage';
import AbsensiPage from '@/pages/admin/AbsensiPage';

// Anggota Pages
import AnggotaDashboard from '@/pages/anggota/AnggotaDashboard';
import AnggotaAgendaPage from '@/pages/anggota/AgendaPage';
import ScanQRPage from '@/pages/anggota/ScanQRPage';
import ProfilPage from '@/pages/anggota/ProfilPage';

function AppRoutes() {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        currentUser ? (
          userRole === 'admin' ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/anggota/dashboard" replace />
          )
        ) : (
          <LandingPage />
        )
      } />
      <Route path="/login" element={
        currentUser ? (
          userRole === 'admin' ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/anggota/dashboard" replace />
          )
        ) : (
          <LoginPage />
        )
      } />
      <Route path="/register" element={
        currentUser ? (
          userRole === 'admin' ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/anggota/dashboard" replace />
          )
        ) : (
          <RegisterPage />
        )
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/anggota" element={
        <ProtectedRoute allowedRole="admin">
          <AnggotaPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/agenda" element={
        <ProtectedRoute allowedRole="admin">
          <AgendaPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/absensi" element={
        <ProtectedRoute allowedRole="admin">
          <AbsensiPage />
        </ProtectedRoute>
      } />

      {/* Anggota Routes */}
      <Route path="/anggota/dashboard" element={
        <ProtectedRoute allowedRole="anggota">
          <AnggotaDashboard />
        </ProtectedRoute>
      } />
      <Route path="/anggota/agenda" element={
        <ProtectedRoute allowedRole="anggota">
          <AnggotaAgendaPage />
        </ProtectedRoute>
      } />
      <Route path="/anggota/scan" element={
        <ProtectedRoute allowedRole="anggota">
          <ScanQRPage />
        </ProtectedRoute>
      } />
      <Route path="/anggota/profil" element={
        <ProtectedRoute allowedRole="anggota">
          <ProfilPage />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
