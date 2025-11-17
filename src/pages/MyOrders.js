import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Card, CardContent } from '@mui/material';
import { useDataStore, useAuthStore } from '../store/useStore';
import EmptyState from '../components/EmptyState';
import AnimatedCard from '../components/AnimatedCard';

const getStatusColor = (status) => {
  const colors = {
    'NEW': 'info',
    'PREPARING': 'warning', 
    'READY': 'success',
    'DELIVERED': 'default'
  };
  return colors[status] || 'default';
};

const getStatusText = (status) => {
  const texts = {
    'NEW': 'Novo',
    'PREPARING': 'Preparando',
    'READY': 'Pronto',
    'DELIVERED': 'Entregue'
  };
  return texts[status] || status;
};

const MyOrders = () => {
  const { orders, products } = useDataStore();
  const { user } = useAuthStore();

  const myOrders = orders.filter(order => order.customerId === user?.uid);

  const getOrderTotal = (order) => {
    if (order.totalAmount) return order.totalAmount;
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    return 0;
  };

  const getItemsText = (order) => {
    if (order.items && Array.isArray(order.items)) {
      return order.items.map(item => {
        let productName = 'Produto';
        
        // Tentar várias formas de obter o nome do produto
        if (item.product?.name) {
          productName = item.product.name;
        } else if (item.name && item.name !== 'Produto') {
          productName = item.name;
        } else if (item.productName) {
          productName = item.productName;
        } else {
          // Buscar na lista de produtos
          const productId = item.product?.id || item.productId || item.id;
          if (productId && products.length > 0) {
            const product = products.find(p => p.id === productId);
            if (product?.name) {
              productName = product.name;
            }
          }
        }
        
        return `${item.quantity}x ${productName}`;
      }).join(', ');
    }
    return `${order.items?.length || 0} itens`;
  };

  const activeOrders = myOrders.filter(order => ['NEW', 'PREPARING', 'READY'].includes(order.status));
  const completedOrders = myOrders.filter(order => order.status === 'DELIVERED');

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Meus Pedidos
      </Typography>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Pedidos Ativos
          </Typography>
          
          {activeOrders.map((order, index) => (
            <AnimatedCard key={order.id} delay={index * 100} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Pedido #{order.id.substring(0, 8)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.timestamp?.toDate().toLocaleDateString('pt-BR')} às {order.timestamp?.toDate().toLocaleTimeString('pt-BR')}
                    </Typography>
                  </Box>
                  <Chip 
                    label={getStatusText(order.status)} 
                    color={getStatusColor(order.status)}
                  />
                </Box>
                
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Itens:</strong> {getItemsText(order)}
                </Typography>
                
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  Total: R$ {getOrderTotal(order).toFixed(2)}
                </Typography>
              </CardContent>
            </AnimatedCard>
          ))}
        </Box>
      )}

      {/* Order History Table */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Histórico de Pedidos
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Itens</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell><strong>Data</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {myOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {order.id.substring(0, 8)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                    {getItemsText(order)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    R$ {getOrderTotal(order).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={getStatusText(order.status)} 
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.timestamp?.toDate().toLocaleDateString('pt-BR')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.timestamp?.toDate().toLocaleTimeString('pt-BR')}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {myOrders.length === 0 && (
        <EmptyState
          icon="📋"
          title="Você ainda não fez nenhum pedido"
          description="Explore nosso cardápio e faça seu primeiro pedido"
        />
      )}

      {/* Order Summary */}
      {myOrders.length > 0 && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Resumo dos Seus Pedidos
          </Typography>
          <Box display="flex" gap={4} flexWrap="wrap">
            <Box>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                {myOrders.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Total de Pedidos</Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                {activeOrders.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Pedidos Ativos</Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                {completedOrders.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Pedidos Concluídos</Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="text.primary" sx={{ fontWeight: 700 }}>
                R$ {myOrders.reduce((total, order) => total + getOrderTotal(order), 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">Total Gasto</Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MyOrders;