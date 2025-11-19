import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth, useFirebaseData } from './hooks/useFirebase';
import { useAuthStore } from './store/useStore';
import { ThemeContextProvider } from './utils/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ConnectionStatus from './components/ConnectionStatus';
import './styles/animations.css';
import AuthPage from './pages/AuthPage';
import ClienteEntry from './pages/ClienteEntry';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Cashback from './pages/Cashback';
import Menu from './pages/Menu';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';

function App() {
  useAuth();
  useFirebaseData();
  
  const { user, userProfile, loading } = useAuthStore();

  return (
    <ThemeContextProvider>
      <ConnectionStatus />
      <Routes>
        <Route path="/cliente" element={<ClienteEntry />} />
        <Route path="/*" element={
          loading ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              minHeight="100vh"
              bgcolor="background.default"
            >
              <CircularProgress size={60} />
            </Box>
          ) : !user ? (
            <AuthPage />
          ) : (
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                <Route path="/products" element={
                  <ProtectedRoute requiredRoute="/products">
                    <Products />
                  </ProtectedRoute>
                } />
                <Route path="/stock" element={
                  <ProtectedRoute requiredRoute="/stock">
                    <Stock />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute requiredRoute="/orders">
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/customers" element={
                  <ProtectedRoute requiredRoute="/customers">
                    <Customers />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute requiredRoute="/reports">
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/cashback" element={
                  <ProtectedRoute requiredRoute="/cashback">
                    <Cashback />
                  </ProtectedRoute>
                } />
                <Route path="/menu" element={<Menu />} />
                <Route path="/my-orders" element={
                  <ProtectedRoute requiredRoute="/my-orders">
                    <MyOrders />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute requiredRoute="/profile">
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          )
        } />
      </Routes>
    </ThemeContextProvider>
  );
}

export default App;