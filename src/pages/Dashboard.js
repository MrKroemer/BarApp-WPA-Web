import React, { useState, useMemo } from 'react';
import { Grid, Card, CardContent, Typography, Box, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Fade } from '@mui/material';
import { TrendingUp, ShoppingCart, People, Inventory, AttachMoney, Assessment, MonetizationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useDataStore } from '../store/useStore';
import { useFirebaseData } from '../hooks/useFirebase';
import AnimatedCard from '../components/AnimatedCard';

const MetricCard = ({ title, value, icon, color, onClick, delay = 0 }) => (
  <AnimatedCard 
    delay={delay}
    sx={{ 
      cursor: onClick ? 'pointer' : 'default',
      background: (theme) => theme.palette.mode === 'dark' 
        ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`
        : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ color, fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: `${color}30`,
              transform: 'scale(1.1)'
            }
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 32, color } })}
        </Box>
      </Box>
    </CardContent>
  </AnimatedCard>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const { metrics, orders, cashbacks } = useDataStore();
  const { updateOrderStatus } = useFirebaseData();
  const [closeCashDialog, setCloseCashDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const isOwner = userProfile?.isOwner;

  const formatCurrency = (value) => `R$ ${(value || 0).toFixed(2)}`;

  const getCustomerCashback = () => {
    const userCashbacks = cashbacks.filter(cb => !cb.isUsed);
    return userCashbacks.reduce((total, cb) => total + (cb.amount || 0), 0);
  };

  const handleCloseDailyCash = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Pedidos pendentes para marcar como entregues
      const pendingOrders = orders.filter(order => {
        const orderDate = order.timestamp?.toDate();
        return orderDate >= today && ['NEW', 'PREPARING', 'READY'].includes(order.status);
      });
      
      // Todos os pedidos de hoje (incluindo já entregues)
      const allTodayOrders = orders.filter(order => {
        const orderDate = order.timestamp?.toDate();
        return orderDate >= today;
      });
      
      // Marcar pedidos pendentes como entregues
      for (const order of pendingOrders) {
        await updateOrderStatus(order.id, 'DELIVERED');
      }
      
      // Calcular total de TODOS os pedidos de hoje
      const totalAmount = allTodayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      setSnackbar({ 
        open: true, 
        message: `Caixa fechado! ${pendingOrders.length} pedidos marcados como entregues. Total do dia: R$ ${totalAmount.toFixed(2)}`, 
        severity: 'success' 
      });
      setCloseCashDialog(false);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Erro ao fechar caixa: ' + error.message, 
        severity: 'error' 
      });
    }
  };

  const ownerMetrics = useMemo(() => [
    {
      title: 'Vendas Hoje',
      value: formatCurrency(metrics.todaySales),
      icon: <AttachMoney />,
      color: '#4caf50',
      onClick: () => navigate('/orders')
    },
    {
      title: 'Pedidos Ativos',
      value: metrics.activeOrders,
      icon: <ShoppingCart />,
      color: '#ff9800',
      onClick: () => navigate('/orders')
    },
    {
      title: 'Total Clientes',
      value: metrics.totalCustomers,
      icon: <People />,
      color: '#2196f3',
      onClick: () => navigate('/customers')
    },
    {
      title: 'Status Estoque',
      value: metrics.stockStatus,
      icon: <Inventory />,
      color: metrics.stockStatus === 'OK' ? '#4caf50' : '#f44336',
      onClick: () => navigate('/stock')
    }
  ], [metrics, navigate]);

  const customerOrders = orders.filter(order => order.customerId === userProfile?.id);
  const activeCustomerOrders = customerOrders.filter(order => 
    ['NEW', 'PREPARING', 'READY'].includes(order.status)
  );

  const customerMetrics = useMemo(() => [
    {
      title: 'Total Pedidos',
      value: customerOrders.length,
      icon: <ShoppingCart />,
      color: '#2196f3',
      onClick: () => navigate('/my-orders')
    },
    {
      title: 'Pedidos Ativos',
      value: activeCustomerOrders.length,
      icon: <Assessment />,
      color: '#ff9800',
      onClick: () => navigate('/my-orders')
    },
    {
      title: 'Cashback',
      value: formatCurrency(getCustomerCashback()),
      icon: <AttachMoney />,
      color: '#4caf50'
    },
    {
      title: 'Cardápio',
      value: 'Ver',
      icon: <TrendingUp />,
      color: '#9c27b0',
      onClick: () => navigate('/menu')
    }
  ], [customerOrders.length, activeCustomerOrders.length, getCustomerCashback, navigate]);

  const metricsToShow = isOwner ? ownerMetrics : customerMetrics;

  return (
    <Box>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 700, 
          mb: { xs: 2, sm: 4 },
          fontSize: { xs: '1.75rem', sm: '2.125rem' }
        }}
      >
        Dashboard
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {metricsToShow.map((metric, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <MetricCard {...metric} delay={index * 100} />
          </Grid>
        ))}
      </Grid>

      {isOwner && (
        <Box sx={{ mt: { xs: 3, sm: 4 } }}>
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            mb={3}
            gap={{ xs: 2, sm: 0 }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Ações Rápidas
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<MonetizationOn />}
              onClick={() => setCloseCashDialog(true)}
              sx={{ 
                background: 'linear-gradient(45deg, #ff6b35 30%, #ff8a50 90%)',
                boxShadow: '0 3px 5px 2px rgba(255, 107, 53, .3)',
                minHeight: 44,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Fechar Caixa do Dia
            </Button>
          </Box>
          
          <Grid container spacing={{ xs: 2, sm: 2 }}>
            <Grid item xs={6} sm={6} md={3}>
              <Card 
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => navigate('/products')}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, sm: 3 },
                  px: { xs: 1, sm: 2 }
                }}>
                  <Inventory sx={{ 
                    fontSize: { xs: 32, sm: 48 }, 
                    color: 'primary.main', 
                    mb: 1 
                  }} />
                  <Typography 
                    variant="h6"
                    sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}
                  >
                    Gestão de Produtos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card 
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => navigate('/stock')}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, sm: 3 },
                  px: { xs: 1, sm: 2 }
                }}>
                  <Assessment sx={{ 
                    fontSize: { xs: 32, sm: 48 }, 
                    color: 'secondary.main', 
                    mb: 1 
                  }} />
                  <Typography 
                    variant="h6"
                    sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}
                  >
                    Controle de Estoque
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card 
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => navigate('/reports')}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, sm: 3 },
                  px: { xs: 1, sm: 2 }
                }}>
                  <TrendingUp sx={{ 
                    fontSize: { xs: 32, sm: 48 }, 
                    color: 'info.main', 
                    mb: 1 
                  }} />
                  <Typography 
                    variant="h6"
                    sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}
                  >
                    Relatórios
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card 
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => navigate('/cashback')}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: { xs: 2, sm: 3 },
                  px: { xs: 1, sm: 2 }
                }}>
                  <AttachMoney sx={{ 
                    fontSize: { xs: 32, sm: 48 }, 
                    color: 'warning.main', 
                    mb: 1 
                  }} />
                  <Typography 
                    variant="h6"
                    sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}
                  >
                    Cashback
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Close Cash Dialog */}
      <Dialog open={closeCashDialog} onClose={() => setCloseCashDialog(false)}>
        <DialogTitle>Fechar Caixa do Dia</DialogTitle>
        <DialogContent>
          <Typography>
            Isso marcará todos os pedidos de hoje como entregues e incluirá no relatório financeiro. Deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseCashDialog(false)}>Cancelar</Button>
          <Button onClick={handleCloseDailyCash} variant="contained" color="primary">
            Fechar Caixa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;