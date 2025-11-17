import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar } from '@mui/material';
import { Person } from '@mui/icons-material';
import { useDataStore } from '../store/useStore';
import EmptyState from '../components/EmptyState';

const Customers = () => {
  const { customers, orders, cashbacks } = useDataStore();
  
  // Combine customers from users collection and orders for complete list
  const allCustomers = React.useMemo(() => {
    const customerMap = new Map();
    
    // Add customers from users collection
    customers.forEach(customer => {
      customerMap.set(customer.id, {
        ...customer,
        _source: 'users_collection'
      });
    });
    
    // Add customers from orders (fallback and additional data)
    orders.forEach(order => {
      if (order.customerId && order.customerName) {
        const existing = customerMap.get(order.customerId);
        if (!existing) {
          customerMap.set(order.customerId, {
            id: order.customerId,
            name: order.customerName,
            email: order.customerEmail || 'N/A',
            _source: 'orders_extraction'
          });
        } else if (!existing.email || existing.email === 'N/A') {
          // Update email if we have better data from orders
          customerMap.set(order.customerId, {
            ...existing,
            email: order.customerEmail || existing.email
          });
        }
      }
    });
    
    return Array.from(customerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, orders]);
  
  React.useEffect(() => {
    console.log('Customers component - customers:', customers.length);
    console.log('Customers component - allCustomers:', allCustomers.length);
    console.log('Customers component - orders:', orders.length);
  }, [customers, allCustomers, orders]);

  const getCustomerStats = (customerId) => {
    const customerOrders = orders.filter(order => order.customerId === customerId);
    const totalSpent = customerOrders
      .filter(order => order.status === 'DELIVERED')
      .reduce((total, order) => total + (order.totalAmount || 0), 0);
    
    const customerCashbacks = cashbacks.filter(cb => cb.customerId === customerId && !cb.isUsed);
    const totalCashback = customerCashbacks.reduce((total, cb) => total + (cb.amount || 0), 0);
    
    return {
      totalOrders: customerOrders.length,
      totalSpent,
      totalCashback,
      lastOrder: customerOrders.length > 0 ? customerOrders[0].timestamp?.toDate() : null
    };
  };

  const getCustomerTier = (totalSpent) => {
    if (totalSpent >= 1000) return { label: 'VIP', color: 'error' };
    if (totalSpent >= 500) return { label: 'Gold', color: 'warning' };
    if (totalSpent >= 100) return { label: 'Silver', color: 'info' };
    return { label: 'Bronze', color: 'default' };
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Gestão de Clientes
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell align="center"><strong>Total Pedidos</strong></TableCell>
              <TableCell align="right"><strong>Total Gasto</strong></TableCell>
              <TableCell align="right"><strong>Cashback</strong></TableCell>
              <TableCell align="center"><strong>Categoria</strong></TableCell>
              <TableCell><strong>Último Pedido</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allCustomers.map((customer) => {
              const stats = getCustomerStats(customer.id);
              const tier = getCustomerTier(stats.totalSpent);
              
              return (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {customer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {customer.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {stats.totalOrders}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      R$ {stats.totalSpent.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                      R$ {stats.totalCashback.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={tier.label} 
                      color={tier.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {stats.lastOrder ? (
                      <Box>
                        <Typography variant="body2">
                          {stats.lastOrder.toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stats.lastOrder.toLocaleTimeString('pt-BR')}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nunca
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {allCustomers.length === 0 && (
        <EmptyState
          icon="👥"
          title="Nenhum cliente cadastrado"
          description="Os clientes aparecerão aqui quando se registrarem no sistema"
        />
      )}

      {/* Customer Statistics */}
      {allCustomers.length > 0 && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Estatísticas dos Clientes
          </Typography>
          <Box display="flex" gap={4} flexWrap="wrap">
            <Box>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                {allCustomers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Total de Clientes</Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                {allCustomers.filter(c => getCustomerStats(c.id).totalOrders > 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Clientes Ativos</Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                {allCustomers.filter(c => getCustomerTier(getCustomerStats(c.id).totalSpent).label === 'VIP').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Clientes VIP</Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                R$ {allCustomers.reduce((total, c) => total + getCustomerStats(c.id).totalSpent, 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">Receita Total</Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Customers;