import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth, useFirebaseData } from './hooks/useFirebase';
import { useAuthStore } from './store/useStore';
import { ThemeContextProvider } from './utils/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
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

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const isOwner = userProfile?.isOwner;

  return (
    <ThemeContextProvider>
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
          <Route path="/menu" element={
            <ProtectedRoute requiredRoute="/menu">
              <Menu />
            </ProtectedRoute>
          } />
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
    </ThemeContextProvider>
  );
}

export default App;