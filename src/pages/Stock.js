import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton } from '@mui/material';
import { Add, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useDataStore } from '../store/useStore';
import { useFirebaseData } from '../hooks/useFirebase';
import EmptyState from '../components/EmptyState';

const StockMovementDialog = ({ open, onClose, onSave, products }) => {
  const [formData, setFormData] = useState({
    productId: '',
    type: 'IN',
    quantity: '',
    unitCost: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      quantity: parseInt(formData.quantity),
      unitCost: parseFloat(formData.unitCost),
      totalCost: parseInt(formData.quantity) * parseFloat(formData.unitCost)
    });
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const selectedProduct = products.find(p => p.id === formData.productId);

  React.useEffect(() => {
    if (!open) {
      setFormData({
        productId: '',
        type: 'IN',
        quantity: '',
        unitCost: '',
        reason: ''
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Movimentação de Estoque</DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Produto"
            fullWidth
            variant="outlined"
            value={formData.productId}
            onChange={handleInputChange('productId')}
            required
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            select
            margin="dense"
            label="Tipo de Movimentação"
            fullWidth
            variant="outlined"
            value={formData.type}
            onChange={handleInputChange('type')}
            required
          >
            <MenuItem value="IN">Entrada</MenuItem>
            <MenuItem value="OUT">Saída</MenuItem>
          </TextField>
          
          <TextField
            margin="dense"
            label="Quantidade"
            type="number"
            fullWidth
            variant="outlined"
            inputProps={{ min: 1 }}
            value={formData.quantity}
            onChange={handleInputChange('quantity')}
            required
          />
          
          <TextField
            margin="dense"
            label="Custo Unitário"
            type="number"
            fullWidth
            variant="outlined"
            inputProps={{ step: 0.01, min: 0 }}
            value={formData.unitCost}
            onChange={handleInputChange('unitCost')}
            required
          />
          
          <TextField
            margin="dense"
            label="Motivo"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={formData.reason}
            onChange={handleInputChange('reason')}
            required
            placeholder="Ex: Compra de fornecedor, Venda, Perda, etc."
          />
          
          {formData.quantity && formData.unitCost && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Valor Total: R$ {(parseInt(formData.quantity || 0) * parseFloat(formData.unitCost || 0)).toFixed(2)}
              </Typography>
              {selectedProduct && (
                <Typography variant="body2" color="text.secondary">
                  Produto: {selectedProduct.name}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            Registrar Movimentação
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Stock = () => {
  const { stock, products } = useDataStore();
  const { addStockMovement } = useFirebaseData();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddMovement = () => {
    setDialogOpen(true);
  };

  const handleSaveMovement = async (movementData) => {
    try {
      await addStockMovement(movementData);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error adding stock movement:', error);
      alert('Erro ao registrar movimentação: ' + error.message);
    }
  };

  const getStockStatus = (item) => {
    if (item.currentStock <= 0) return { label: 'Esgotado', color: 'error' };
    if (item.currentStock <= item.minStock) return { label: 'Baixo', color: 'warning' };
    return { label: 'OK', color: 'success' };
  };

  const handleQuickMovement = async (stockItem, type) => {
    const quantity = prompt(`Quantidade para ${type === 'IN' ? 'entrada' : 'saída'}:`);
    const cost = prompt('Custo unitário:');
    const reason = prompt('Motivo:');
    
    if (quantity && cost && reason) {
      try {
        await addStockMovement({
          productId: stockItem.productId,
          type,
          quantity: parseInt(quantity),
          unitCost: parseFloat(cost),
          totalCost: parseInt(quantity) * parseFloat(cost),
          reason
        });
      } catch (error) {
        alert('Erro ao registrar movimentação: ' + error.message);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Controle de Estoque
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddMovement}
          size="large"
        >
          Nova Movimentação
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Produto</strong></TableCell>
              <TableCell align="center"><strong>Estoque Atual</strong></TableCell>
              <TableCell align="center"><strong>Estoque Mínimo</strong></TableCell>
              <TableCell align="center"><strong>Custo Unitário</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stock.map((item) => {
              const status = getStockStatus(item);
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {item.productName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {item.currentStock}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{item.minStock}</TableCell>
                  <TableCell align="center">
                    R$ {item.unitCost?.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={status.label} 
                      color={status.color} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleQuickMovement(item, 'IN')}
                        title="Entrada rápida"
                      >
                        <TrendingUp />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleQuickMovement(item, 'OUT')}
                        title="Saída rápida"
                      >
                        <TrendingDown />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {stock.length === 0 && (
        <EmptyState
          icon="📦"
          title="Nenhum item no estoque"
          description="Os itens de estoque são criados automaticamente quando você adiciona produtos"
        />
      )}

      <StockMovementDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveMovement}
        products={products.filter(p => !p.isDeleted)}
      />
    </Box>
  );
};

export default Stock;