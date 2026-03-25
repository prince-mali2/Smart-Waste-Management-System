import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { ReportWastePage } from './pages/ReportWastePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { GuidePage } from './pages/GuidePage';
import { RecyclingMapPage } from './pages/RecyclingMapPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

const DashboardSwitch = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'worker') return <WorkerDashboard />;
  return <UserDashboard />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AuthLoadingWrapper>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardSwitch />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report-waste"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <DashboardLayout>
                      <ReportWastePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AnalyticsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guide"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <GuidePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recycling-map"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                    <DashboardLayout>
                      <RecyclingMapPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <DashboardLayout>
                      <LeaderboardPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AuthLoadingWrapper>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

const AuthLoadingWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  
  return <>{children}</>;
};
