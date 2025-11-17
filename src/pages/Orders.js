import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Select, MenuItem, FormControl, Tabs, Tab } from '@mui/material';
import { useDataStore } from '../store/useStore';
import { useFirebaseData } from '../hooks/useFirebase';
import EmptyState from '../components/EmptyState';

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

const Orders = () => {
  const { orders, products } = useDataStore();
  const { updateOrderStatus } = useFirebaseData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Forçar re-render quando produtos carregam
  React.useEffect(() => {
    if (products.length > 0) {
      setForceUpdate(prev => prev + 1);
    }
  }, [products.length]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage = error.message || 'Erro desconhecido ao atualizar status do pedido';
      alert(`Erro ao atualizar status: ${errorMessage}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return ['NEW', 'PREPARING', 'READY'].includes(order.status);
    return order.status === statusFilter;
  });

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
        
        // Tentar várias formas de obter o nome
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Gestão de Pedidos
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={statusFilter} 
          onChange={(e, newValue) => setStatusFilter(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Todos" value="all" />
          <Tab label="Ativos" value="active" />
          <Tab label="Novos" value="NEW" />
          <Tab label="Preparando" value="PREPARING" />
          <Tab label="Prontos" value="READY" />
          <Tab label="Entregues" value="DELIVERED" />
        </Tabs>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Itens</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell><strong>Data</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {order.id.substring(0, 8)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {order.customerName || 'Cliente'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
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
                <TableCell align="center">
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      variant="outlined"
                    >
                      <MenuItem value="NEW">Novo</MenuItem>
                      <MenuItem value="PREPARING">Preparando</MenuItem>
                      <MenuItem value="READY">Pronto</MenuItem>
                      <MenuItem value="DELIVERED">Entregue</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredOrders.length === 0 && (
        <EmptyState
          icon="📝"
          title={statusFilter === 'all' ? 'Nenhum pedido encontrado' : `Nenhum pedido ${statusFilter === 'active' ? 'ativo' : getStatusText(statusFilter).toLowerCase()}`}
          description={statusFilter === 'all' 
            ? 'Os pedidos aparecerão aqui quando os clientes fizerem compras'
            : 'Altere o filtro para ver outros pedidos'
          }
        />
      )}

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Resumo dos Pedidos
        </Typography>
        <Box display="flex" gap={4} flexWrap="wrap">
          <Box>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
              {orders.filter(o => o.status === 'NEW').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Novos</Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
              {orders.filter(o => o.status === 'PREPARING').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Preparando</Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
              {orders.filter(o => o.status === 'READY').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Prontos</Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 700 }}>
              {orders.filter(o => o.status === 'DELIVERED').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Entregues</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Orders;