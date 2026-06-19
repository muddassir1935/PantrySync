import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PantryProvider } from './context/PantryContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pantry } from './pages/Pantry';
import { CalendarPage } from './pages/CalendarPage';
import { Favorites } from './pages/Favorites';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard/pantry" replace /> : <Login />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <PantryProvider>
              <Dashboard />
            </PantryProvider>
          </ProtectedRoute>
        }
      >
        <Route path="pantry" element={<Pantry />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="favorites" element={<Favorites />} />
        <Route index element={<Navigate to="/dashboard/pantry" replace />} />
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard/pantry" : "/login"} replace />} />
    </Routes>
  );
}

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#363636',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: {
                primary: '#f97316', // orange-500
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
