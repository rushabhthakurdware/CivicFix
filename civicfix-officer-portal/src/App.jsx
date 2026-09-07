import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ComplaintDetail from './pages/ComplaintDetail';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Global Dark Mode Toast Provider */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#141414',
              color: '#f5f5f5',
              border: '1px solid #262626',
              borderRadius: '12px',
              fontSize: '13px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#141414',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#141414',
              },
            },
          }}
        />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute>
                <ComplaintDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}