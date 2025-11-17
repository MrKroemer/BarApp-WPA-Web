import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Card, CardContent, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Tabs, Tab } from '@mui/material';
import { Add, Settings } from '@mui/icons-material';
import { useDataStore, useAuthStore } from '../store/useStore';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import CashbackRuleDialog from '../components/CashbackRuleDialog';

const CashbackDialog = ({ open, onClose, customers }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    reason: '',
    orderId: '',
    expirationDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expirationDate = formData.expirationDate ? new Date(formData.expirationDate) : null;
      
      await addDoc(collection(db, 'customer_cashbacks'), {
        customerId: formData.customerId,
        amount: parseFloat(formData.amount),
        reason: formData.reason,
        orderId: formData.orderId || null,
        expirationDate: expirationDate ? Timestamp.fromDate(expirationDate) : null,
        isUsed: false,
        createdAt: Timestamp.now()
      });
      onClose();
      setFormData({ customerId: '', amount: '', reason: '', orderId: '', expirationDate: '' });
    } catch (error) {
      alert('Erro ao adicionar cashback: ' + error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar Cashback</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Cliente"
            value={formData.customerId}
            onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
            margin="normal"
            required
          >
            {customers.map(customer => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Valor"
            type="number"
            inputProps={{ step: 0.01, min: 0 }}
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Motivo"
            multiline
            rows={2}
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="ID do Pedido (opcional)"
            value={formData.orderId}
            onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
            margin="normal"
            placeholder="Ex: abc123def"
          />
          <TextField
            fullWidth
            label="Data de Expiração (opcional)"
            type="date"
            value={formData.expirationDate}
            onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Adicionar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Cashback = () => {
  const { cashbacks, customers, products } = useDataStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [editingRule, setEditingRule] = useState(null);
  const [cashbackRules, setCashbackRules] = useState([]);

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Cliente não encontrado';
  };

  const activeCashbacks = cashbacks.filter(cb => !cb.isUsed);
  const usedCashbacks = cashbacks.filter(cb => cb.isUsed);

  const totalActiveCashback = activeCashbacks.reduce((sum, cb) => sum + (cb.amount || 0), 0);
  const totalUsedCashback = usedCashbacks.reduce((sum, cb) => sum + (cb.amount || 0), 0);

  // Group cashbacks by customer
  const cashbackByCustomer = cashbacks.reduce((acc, cb) => {
    if (!acc[cb.customerId]) {
      acc[cb.customerId] = {
        customerId: cb.customerId,
        customerName: getCustomerName(cb.customerId),
        active: 0,
        used: 0,
        total: 0
      };
    }
    
    if (cb.isUsed) {
      acc[cb.customerId].used += cb.amount || 0;
    } else {
      acc[cb.customerId].active += cb.amount || 0;
    }
    acc[cb.customerId].total += cb.amount || 0;
    
    return acc;
  }, {});

  const customerCashbackData = Object.values(cashbackByCustomer);

  const handleSaveRule = async (ruleData) => {
    try {
      if (editingRule) {
        // Update existing rule
        console.log('Updating rule:', ruleData);
      } else {
        // Create new rule
        await addDoc(collection(db, 'cashback_rules'), {
          ...ruleData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      setRuleDialogOpen(false);
      setEditingRule(null);
    } catch (error) {
      alert('Erro ao salvar regra: ' + error.message);
    }
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setRuleDialogOpen(true);
  };

  const handleAddRule = () => {
    setEditingRule(null);
    setRuleDialogOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Gestão de Cashback
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={handleAddRule}
            size="large"
          >
            Regras de Cashback
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            size="large"
          >
            Adicionar Cashback
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="Histórico de Cashback" />
          <Tab label="Regras Ativas" />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                R$ {totalActiveCashback.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cashback Ativo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                R$ {totalUsedCashback.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cashback Utilizado
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                {activeCashbacks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cashbacks Ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 700 }}>
                {customerCashbackData.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clientes com Cashback
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cashback by Customer */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cashback por Cliente
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell align="right"><strong>Cashback Ativo</strong></TableCell>
                  <TableCell align="right"><strong>Cashback Utilizado</strong></TableCell>
                  <TableCell align="right"><strong>Total Gerado</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customerCashbackData.map((data) => (
                  <TableRow key={data.customerId}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {data.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                        R$ {data.active.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        R$ {data.used.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        R$ {data.total.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* All Cashbacks History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Histórico Completo de Cashback
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell align="right"><strong>Valor</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                  <TableCell><strong>Data de Criação</strong></TableCell>
                  <TableCell><strong>Data de Uso</strong></TableCell>
                  <TableCell><strong>Pedido Origem</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cashbacks.map((cashback) => (
                  <TableRow key={cashback.id}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {getCustomerName(cashback.customerId)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        R$ {cashback.amount?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={cashback.isUsed ? 'Utilizado' : 'Ativo'}
                        color={cashback.isUsed ? 'default' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cashback.createdAt?.toDate().toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cashback.createdAt?.toDate().toLocaleTimeString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {cashback.usedAt ? (
                        <Box>
                          <Typography variant="body2">
                            {cashback.usedAt.toDate().toLocaleDateString('pt-BR')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cashback.usedAt.toDate().toLocaleTimeString('pt-BR')}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {cashback.orderId?.substring(0, 8) || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {cashbacks.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum cashback registrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Os cashbacks são gerados automaticamente quando os pedidos são entregues
          </Typography>
        </Box>
      )}
        </>
      )}

      {currentTab === 1 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Regras de Cashback Configuradas
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddRule}
              >
                Nova Regra
              </Button>
            </Box>
            
            {cashbackRules.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma regra de cashback configurada
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Crie regras personalizadas para automatizar a geração de cashback
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleAddRule}>
                  Criar Primeira Regra
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Nome da Campanha</strong></TableCell>
                      <TableCell align="center"><strong>Tipo</strong></TableCell>
                      <TableCell align="center"><strong>Valor</strong></TableCell>
                      <TableCell align="center"><strong>Status</strong></TableCell>
                      <TableCell align="center"><strong>Ações</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cashbackRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {rule.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {rule.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={rule.calculationType === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {rule.calculationType === 'percentage' ? `${rule.value}%` : `R$ ${rule.value}`}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={rule.status ? 'Ativa' : 'Inativa'}
                            color={rule.status ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            onClick={() => handleEditRule(rule)}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      <CashbackDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        customers={customers}
      />
      
      <CashbackRuleDialog
        open={ruleDialogOpen}
        onClose={() => {
          setRuleDialogOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
        rule={editingRule}
        products={products}
      />
    </Box>
  );
};

export default Cashback;