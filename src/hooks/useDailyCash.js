import { useState } from 'react';
import { useFirebaseData } from './useFirebase';
import { useDataStore } from '../store/useStore';
import { useNotifications } from './useNotifications';

export const useDailyCash = () => {
  const [loading, setLoading] = useState(false);
  const { updateOrderStatus } = useFirebaseData();
  const { orders } = useDataStore();
  const { addNotification } = useNotifications();

  const closeDailyCash = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Filtrar pedidos de hoje que não estão entregues
      const pendingOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt?.seconds * 1000 || order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime() && 
               !['entregue', 'cancelado'].includes(order.status);
      });

      // Todos os pedidos de hoje
      const allTodayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt?.seconds * 1000 || order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      // Marcar pedidos pendentes como entregues
      const updatePromises = pendingOrders.map(order => 
        updateOrderStatus(order.id, 'entregue')
      );
      
      await Promise.all(updatePromises);

      // Calcular métricas do dia
      const totalRevenue = allTodayOrders.reduce((sum, order) => 
        sum + (order.total || 0), 0
      );
      
      const totalItems = allTodayOrders.reduce((sum, order) => 
        sum + (order.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0
      );

      // Criar relatório do dia
      const dailyReport = {
        date: today.toISOString().split('T')[0],
        totalOrders: allTodayOrders.length,
        pendingOrdersProcessed: pendingOrders.length,
        totalRevenue,
        totalItems,
        averageTicket: allTodayOrders.length > 0 ? totalRevenue / allTodayOrders.length : 0,
        timestamp: new Date()
      };

      // Salvar relatório no localStorage para histórico
      const dailyReports = JSON.parse(localStorage.getItem('dailyReports') || '[]');
      dailyReports.push(dailyReport);
      localStorage.setItem('dailyReports', JSON.stringify(dailyReports.slice(-30))); // Manter últimos 30 dias

      // Notificação de sucesso
      addNotification({
        title: 'Caixa Fechado com Sucesso!',
        message: `${pendingOrders.length} pedidos processados. Total: R$ ${totalRevenue.toFixed(2)}`,
        type: 'success'
      });

      return dailyReport;
    } catch (error) {
      addNotification({
        title: 'Erro ao Fechar Caixa',
        message: error.message,
        type: 'error'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDailyReports = () => {
    return JSON.parse(localStorage.getItem('dailyReports') || '[]');
  };

  const getTodayMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt?.seconds * 1000 || order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const pendingOrders = todayOrders.filter(order => 
      !['entregue', 'cancelado'].includes(order.status)
    );

    return {
      totalOrders: todayOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue: todayOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      canClose: pendingOrders.length > 0
    };
  };

  return {
    closeDailyCash,
    getDailyReports,
    getTodayMetrics,
    loading
  };
};