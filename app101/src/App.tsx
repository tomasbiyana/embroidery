import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { WriterDashboard } from '@/pages/WriterDashboard';
import { BookManagePage } from '@/pages/BookManagePage';
import { WritePage } from '@/pages/WritePage';
import { ReaderBrowsePage } from '@/pages/ReaderBrowsePage';
import { ReadBookPage } from '@/pages/ReadBookPage';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'writer') {
      return <Navigate to="/writer/dashboard" replace />;
    } else {
      return <Navigate to="/reader/browse" replace />;
    }
  }

  return <>{children}</>;
}

// Public Route - redirects authenticated users
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    if (user.role === 'writer') {
      return <Navigate to="/writer/dashboard" replace />;
    } else {
      return <Navigate to="/reader/browse" replace />;
    }
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Writer Routes */}
      <Route path="/writer/dashboard" element={
        <ProtectedRoute allowedRoles={['writer']}>
          <WriterDashboard />
        </ProtectedRoute>
      } />
      <Route path="/writer/book/:bookId" element={
        <ProtectedRoute allowedRoles={['writer']}>
          <BookManagePage />
        </ProtectedRoute>
      } />
      <Route path="/writer/book/:bookId/write" element={
        <ProtectedRoute allowedRoles={['writer']}>
          <WritePage />
        </ProtectedRoute>
      } />
      <Route path="/writer/book/:bookId/write/:chapterId" element={
        <ProtectedRoute allowedRoles={['writer']}>
          <WritePage />
        </ProtectedRoute>
      } />

      {/* Reader Routes */}
      <Route path="/reader/browse" element={
        <ProtectedRoute allowedRoles={['reader', 'writer']}>
          <ReaderBrowsePage />
        </ProtectedRoute>
      } />
      <Route path="/reader/book/:bookId" element={
        <ProtectedRoute allowedRoles={['reader', 'writer']}>
          <ReadBookPage />
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
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
