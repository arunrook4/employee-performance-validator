import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Performance from './pages/Performance';
import EmployeeForm from './pages/EmployeeForm';
import PerformanceForm from './pages/PerformanceForm';
import EmployeeDetail from './pages/EmployeeDetail';
import PerformanceDetail from './pages/PerformanceDetail';
import Goals from './pages/Goals';
import GoalForm from './pages/GoalForm';
import GoalDetail from './pages/GoalDetail';
import Competencies from './pages/Competencies';
import CompetencyForm from './pages/CompetencyForm';
import CompetencyDetail from './pages/CompetencyDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="pt-16">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="h-screen flex flex-col bg-gray-50">
        {isAuthenticated() && <Navbar />}
        <main className="flex-1 overflow-y-auto">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employees" 
                element={
                  <ProtectedRoute>
                    <Employees />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employees/new" 
                element={
                  <ProtectedRoute>
                    <EmployeeForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employees/:id" 
                element={
                  <ProtectedRoute>
                    <EmployeeDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employees/:id/edit" 
                element={
                  <ProtectedRoute>
                    <EmployeeForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/performance" 
                element={
                  <ProtectedRoute>
                    <Performance />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/performance/new" 
                element={
                  <ProtectedRoute>
                    <PerformanceForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/performance/:id" 
                element={
                  <ProtectedRoute>
                    <PerformanceDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/performance/:id/edit" 
                element={
                  <ProtectedRoute>
                    <PerformanceForm />
                  </ProtectedRoute>
                } 
              />

              {/* Goal Routes */}
              <Route 
                path="/goals" 
                element={
                  <ProtectedRoute>
                    <Goals />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/goals/new" 
                element={
                  <ProtectedRoute>
                    <GoalForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/goals/:id" 
                element={
                  <ProtectedRoute>
                    <GoalDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/goals/:id/edit" 
                element={
                  <ProtectedRoute>
                    <GoalForm />
                  </ProtectedRoute>
                } 
              />

              {/* Competency Routes */}
              <Route 
                path="/competencies" 
                element={
                  <ProtectedRoute>
                    <Competencies />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/competencies/new" 
                element={
                  <ProtectedRoute>
                    <CompetencyForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/competencies/:id" 
                element={
                  <ProtectedRoute>
                    <CompetencyDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/competencies/:id/edit" 
                element={
                  <ProtectedRoute>
                    <CompetencyForm />
                  </ProtectedRoute>
                } 
              />

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 