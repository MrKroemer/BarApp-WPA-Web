import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  DollarSign,
  Package,
  Clock,
  Star
} from 'lucide-react';

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  trend, 
  subtitle,
  onClick,
  loading = false 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
          <div className="w-16 h-4 bg-gray-700 rounded"></div>
        </div>
        <div className="w-24 h-8 bg-gray-700 rounded mb-2"></div>
        <div className="w-32 h-4 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div 
      className={`
        bg-gray-800 rounded-xl p-6 card-hover animate-fade-in
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`
          p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}
        `}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`
            flex items-center text-sm
            ${trend > 0 ? 'text-green-400' : 'text-red-400'}
          `}>
            <TrendingUp className={`
              w-4 h-4 mr-1
              ${trend < 0 ? 'rotate-180' : ''}
            `} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-white mb-1">
        {typeof value === 'number' && value > 999 
          ? `${(value / 1000).toFixed(1)}k` 
          : value
        }
      </div>
      
      <div className="text-gray-400 text-sm">{title}</div>
      
      {subtitle && (
        <div className="text-gray-500 text-xs mt-2">{subtitle}</div>
      )}
    </div>
  );
};

export const OwnerMetricsCards = ({ metrics, onCardClick }) => {
  const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Vendas Hoje"
        value={formatCurrency(metrics.todaySales)}
        icon={DollarSign}
        color="green"
        onClick={() => onCardClick?.('sales')}
        loading={metrics.loading}
      />
      
      <MetricCard
        title="Pedidos Ativos"
        value={metrics.activeOrders}
        icon={ShoppingCart}
        color="blue"
        onClick={() => onCardClick?.('orders')}
        loading={metrics.loading}
      />
      
      <MetricCard
        title="Total Clientes"
        value={metrics.totalCustomers}
        icon={Users}
        color="purple"
        onClick={() => onCardClick?.('customers')}
        loading={metrics.loading}
      />
      
      <MetricCard
        title="Estoque Baixo"
        value={metrics.lowStockItems}
        icon={AlertTriangle}
        color={metrics.lowStockItems > 5 ? 'red' : 'yellow'}
        onClick={() => onCardClick?.('stock')}
        loading={metrics.loading}
      />
    </div>
  );
};

export const CustomerMetricsCards = ({ metrics, onCardClick }) => {
  const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Meus Pedidos"
        value={metrics.totalOrders}
        icon={Package}
        color="blue"
        onClick={() => onCardClick?.('orders')}
        loading={metrics.loading}
      />
      
      <MetricCard
        title="Pedidos Ativos"
        value={metrics.activeOrders}
        icon={Clock}
        color="orange"
        onClick={() => onCardClick?.('active-orders')}
        loading={metrics.loading}
      />
      
      <MetricCard
        title="Total Gasto"
        value={formatCurrency(metrics.totalSpent)}
        icon={DollarSign}
        color="green"
        loading={metrics.loading}
      />
      
      <MetricCard
        title="Cashback"
        value={formatCurrency(metrics.availableCashback)}
        icon={Star}
        color="purple"
        onClick={() => onCardClick?.('cashback')}
        loading={metrics.loading}
      />
    </div>
  );
};

export const QuickActions = ({ userType, onAction }) => {
  const ownerActions = [
    { id: 'add-product', label: 'Novo Produto', icon: Package, color: 'blue' },
    { id: 'stock-entry', label: 'Entrada Estoque', icon: TrendingUp, color: 'green' },
    { id: 'close-day', label: 'Fechar Caixa', icon: DollarSign, color: 'orange' },
    { id: 'reports', label: 'Relatórios', icon: Users, color: 'purple' }
  ];

  const customerActions = [
    { id: 'menu', label: 'Ver Cardápio', icon: Package, color: 'blue' },
    { id: 'my-orders', label: 'Meus Pedidos', icon: ShoppingCart, color: 'green' },
    { id: 'profile', label: 'Meu Perfil', icon: Users, color: 'purple' }
  ];

  const actions = userType === 'owner' ? ownerActions : customerActions;

  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={`
              p-4 rounded-lg bg-gray-700 hover:bg-gray-600 
              transition-all duration-200 btn-animated micro-bounce
              flex flex-col items-center text-center
            `}
          >
            <action.icon className="w-6 h-6 text-orange-400 mb-2" />
            <span className="text-sm text-white">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MetricCard;