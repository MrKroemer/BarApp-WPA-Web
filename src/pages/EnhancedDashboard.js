import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import { useMetrics, useCustomerMetrics } from '../hooks/useMetrics';
import { OwnerMetricsCards, CustomerMetricsCards, QuickActions } from '../components/MetricsCards';

const EnhancedDashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const [notification, setNotification] = useState(null);
  
  const isOwner = userProfile?.isOwner;
  const metrics = useMetrics(isOwner ? 'owner' : 'customer');
  const customerMetrics = useCustomerMetrics(userProfile?.id);

  const handleCardClick = (cardType) => {
    const routes = {
      sales: '/reports',
      orders: '/orders',
      customers: '/customers',
      stock: '/stock',
      'active-orders': '/my-orders',
      cashback: '/cashback',
      menu: '/menu'
    };
    
    if (routes[cardType]) {
      navigate(routes[cardType]);
    }
  };

  const handleQuickAction = async (actionId) => {
    switch (actionId) {
      case 'add-product':
        navigate('/products');
        break;
      case 'stock-entry':
        navigate('/stock');
        break;
      case 'close-day':
        // Implementar lógica de fechar caixa
        setNotification({
          type: 'success',
          message: 'Funcionalidade de fechar caixa será implementada'
        });
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'menu':
        navigate('/menu');
        break;
      case 'my-orders':
        navigate('/my-orders');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isOwner ? 'Dashboard do Proprietário' : 'Meu Dashboard'}
          </h1>
          <p className="text-gray-400">
            {isOwner 
              ? 'Gerencie seu bar com métricas em tempo real' 
              : 'Acompanhe seus pedidos e cashback'
            }
          </p>
        </div>

        {/* Métricas */}
        {isOwner ? (
          <OwnerMetricsCards 
            metrics={metrics} 
            onCardClick={handleCardClick} 
          />
        ) : (
          <CustomerMetricsCards 
            metrics={customerMetrics} 
            onCardClick={handleCardClick} 
          />
        )}

        {/* Ações Rápidas */}
        <QuickActions 
          userType={isOwner ? 'owner' : 'customer'}
          onAction={handleQuickAction}
        />

        {/* Atividade Recente */}
        {isOwner && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Atividade Recente
            </h3>
            <div className="space-y-3">
              {metrics.recentActivity?.slice(0, 5).map((activity, index) => (
                <div 
                  key={activity.id || index}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div>
                    <p className="text-white text-sm">{activity.description}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(activity.timestamp?.seconds * 1000 || activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {activity.value && (
                    <span className="text-green-400 font-semibold">
                      R$ {activity.value.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Produtos Favoritos (para clientes) */}
        {!isOwner && customerMetrics.favoriteProducts?.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Seus Produtos Favoritos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customerMetrics.favoriteProducts.map((product, index) => (
                <div 
                  key={product.productId}
                  className="bg-gray-700 rounded-lg p-4 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <p className="text-white font-medium">Produto #{product.productId.slice(-6)}</p>
                  <p className="text-gray-400 text-sm">{product.quantity} pedidos</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notificação */}
        {notification && (
          <div className={`
            fixed bottom-4 right-4 p-4 rounded-lg shadow-lg animate-slide-in
            ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
          `}>
            <p className="text-white">{notification.message}</p>
            <button 
              onClick={() => setNotification(null)}
              className="absolute top-1 right-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard;