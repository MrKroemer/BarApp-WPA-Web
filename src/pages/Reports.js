import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp } from '@mui/icons-material';
import { useDataStore } from '../store/useStore';
import EmptyState from '../components/EmptyState';
import { SalesChart, ProductsChart, StatusChart } from '../components/Charts';
import { format, subDays } from 'date-fns';

const Reports = () => {
  const { orders, products } = useDataStore();
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());

  const filteredOrders = orders.filter(order => {
    const orderDate = order.timestamp?.toDate();
    return orderDate && orderDate >= startDate && orderDate <= endDate && order.status === 'DELIVERED';
  });

  // Sales by day
  const salesByDay = filteredOrders.reduce((acc, order) => {
    const date = order.timestamp.toDate().toLocaleDateString('pt-BR');
    acc[date] = (acc[date] || 0) + (order.totalAmount || 0);
    return acc;
  }, {});

  const salesData = Object.entries(salesByDay).map(([date, amount]) => ({
    date,
    amount
  }));

  // Product sales
  const productSales = filteredOrders.reduce((acc, order) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        let productName = item.name || item.productName;
        if (!productName && item.productId) {
          const product = products.find(p => p.id === item.productId);
          productName = product?.name;
        }
        if (!productName || productName === 'Produto') return;
        acc[productName] = (acc[productName] || 0) + item.quantity;
      });
    }
    return acc;
  }, {});

  const productData = Object.entries(productSales).map(([name, quantity]) => ({
    name,
    quantity
  }));

  // Revenue by product
  const revenueByProduct = filteredOrders.reduce((acc, order) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        let productName = item.name || item.productName;
        if (!productName && item.productId) {
          const product = products.find(p => p.id === item.productId);
          productName = product?.name;
        }
        if (!productName || productName === 'Produto') return;
        acc[productName] = (acc[productName] || 0) + (item.price * item.quantity);
      });
    }
    return acc;
  }, {});

  const revenueData = Object.entries(revenueByProduct).map(([name, revenue]) => ({
    name,
    revenue
  }));

  // Summary metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalItems = filteredOrders.reduce((sum, order) => {
    if (order.items && Array.isArray(order.items)) {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }
    return sum;
  }, 0);

  const COLORS = ['#ff6b35', '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336'];

  return (
    <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          Relatórios Financeiros
        </Typography>

        {/* Date Filter */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filtro de Período
            </Typography>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Data Inicial"
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Data Final"
                type="date"
                value={endDate.toISOString().split('T')[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="outlined">
                Aplicar Filtro
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  R$ {totalRevenue.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Receita Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                  {totalOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de Pedidos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 700 }}>
                  R$ {averageOrderValue.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ticket Médio
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                  {totalItems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Itens Vendidos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Sales Trend */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vendas por Dia
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Vendas']} />
                    <Line type="monotone" dataKey="amount" stroke="#ff6b35" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue by Product */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Receita por Produto
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Receita']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Product Quantity */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Produtos Mais Vendidos (Quantidade)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {filteredOrders.length === 0 && (
          <EmptyState
            icon="📈"
            title="Nenhum dado encontrado para o período selecionado"
            description="Ajuste o filtro de datas ou aguarde mais vendas"
          />
        )}
        
        <Box sx={{ pb: 4 }} />
    </Box>
  );
};

export default Reports;