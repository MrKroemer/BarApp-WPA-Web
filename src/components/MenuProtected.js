import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import Menu from '../pages/Menu';

const MenuProtected = () => {
  const { user } = useAuthStore();
  
  // Verifica se tem sessão de cliente QR
  const customerSession = localStorage.getItem('customerSession');
  
  // Permite acesso se:
  // 1. Está autenticado (usuário normal)
  // 2. Tem sessão de cliente QR
  if (user || customerSession) {
    return <Menu />;
  }
  
  // Se não tem nenhum dos dois, redireciona para login
  return <Navigate to="/" replace />;
};

export default MenuProtected;