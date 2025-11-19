import { useState, useEffect } from 'react';
import { useDataStore } from '../store/useStore';

export const useMetrics = (userType = 'owner') => {
  const [metrics, setMetrics] = useState({
    loading: true,
    todaySales: 0,
    activeOrders: 0,
    totalCustomers: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    averageTicket: 0,
    topProducts: [],
    recentActivity: []
  });

  const { 
    orders, 
    products, 
    customers, 
    stock
  } = useDataStore();

  useEffect(() => {
    if (!orders || !products) return;

    const calculateMetrics = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Pedidos de hoje
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt?.seconds * 1000 || order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      // Vendas do dia
      const todaySales = todayOrders.reduce((sum, order) => {
        return sum + (order.total || 0);
      }, 0);

      // Pedidos ativos (não entregues)
      const activeOrders = orders.filter(order => 
        order.status !== 'entregue' && order.status !== 'cancelado'
      ).length;

      // Itens com estoque baixo
      const lowStockItems = stock.filter(item => 
        item.status === 'baixo' || item.quantity < 10
      ).length;

      // Produtos mais vendidos (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt?.seconds * 1000 || order.createdAt);
        return orderDate >= thirtyDaysAgo;
      });

      const productSales = {};
      recentOrders.forEach(order => {
        order.items?.forEach(item => {
          productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
        });
      });

      const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([productId, quantity]) => {
          const product = products.find(p => p.id === productId);
          return {
            id: productId,
            name: product?.name || 'Produto não encontrado',
            quantity,
            revenue: quantity * (product?.price || 0)
          };
        });

      // Receita total (últimos 30 dias)
      const totalRevenue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      // Ticket médio
      const averageTicket = recentOrders.length > 0 ? totalRevenue / recentOrders.length : 0;

      // Atividade recente
      const recentActivity = orders
        .sort((a, b) => {
          const dateA = new Date(a.updatedAt?.seconds * 1000 || a.updatedAt || a.createdAt?.seconds * 1000 || a.createdAt);
          const dateB = new Date(b.updatedAt?.seconds * 1000 || b.updatedAt || b.createdAt?.seconds * 1000 || b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 10)
        .map(order => ({
          id: order.id,
          type: 'order',
          description: `Pedido #${order.id.slice(-6)} - ${order.status}`,
          timestamp: order.updatedAt || order.createdAt,
          value: order.total
        }));

      setMetrics({
        loading: false,
        todaySales,
        activeOrders,
        totalCustomers: customers.length,
        lowStockItems,
        totalRevenue,
        averageTicket,
        topProducts,
        recentActivity
      });
    };

    calculateMetrics();
  }, [orders, products, customers, stock]);

  return metrics;
};

// Hook específico para métricas do cliente
export const useCustomerMetrics = (customerId) => {
  const [customerMetrics, setCustomerMetrics] = useState({
    loading: true,
    totalOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
    availableCashback: 0,
    favoriteProducts: [],
    recentOrders: []
  });

  const { orders, cashbacks } = useDataStore();

  useEffect(() => {
    if (!customerId) return;

    const calculateCustomerMetrics = () => {
      // Pedidos do cliente
      const customerOrders = orders.filter(order => order.customerId === customerId);

      // Pedidos ativos
      const activeOrders = customerOrders.filter(order => 
        order.status !== 'entregue' && order.status !== 'cancelado'
      ).length;

      // Total gasto
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      // Cashback disponível
      const customerCashbacks = cashbacks.filter(cb => cb.customerId === customerId);
      const availableCashback = customerCashbacks.reduce((sum, cb) => {
        return sum + (cb.status === 'disponivel' ? cb.amount : 0);
      }, 0);

      // Produtos favoritos
      const productCount = {};
      customerOrders.forEach(order => {
        order.items?.forEach(item => {
          productCount[item.productId] = (productCount[item.productId] || 0) + item.quantity;
        });
      });

      const favoriteProducts = Object.entries(productCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([productId, quantity]) => ({ productId, quantity }));

      // Pedidos recentes
      const recentOrders = customerOrders
        .sort((a, b) => {
          const dateA = new Date(a.createdAt?.seconds * 1000 || a.createdAt);
          const dateB = new Date(b.createdAt?.seconds * 1000 || b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 5);

      setCustomerMetrics({
        loading: false,
        totalOrders: customerOrders.length,
        activeOrders,
        totalSpent,
        availableCashback,
        favoriteProducts,
        recentOrders
      });
    };

    calculateCustomerMetrics();
  }, [orders, cashbacks, customerId]);

  return customerMetrics;
};