import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardActions, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, IconButton, Menu, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Add, MoreVert, Edit, Delete, Visibility } from '@mui/icons-material';
import { useDataStore, useUIStore } from '../store/useStore';
import { useFirebaseData } from '../hooks/useFirebase';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedCard from '../components/AnimatedCard';

const ProductCard = ({ product, onEdit, onDelete, onToggleAvailability }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AnimatedCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          height: { xs: 180, sm: 200 },
          background: (product.imageUrl && product.imageUrl.length > 0) ? 'none' : 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: { xs: 40, sm: 48 },
          overflow: 'hidden'
        }}
      >
        {(product.imageUrl && product.imageUrl.length > 0) ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              console.log('Erro ao carregar imagem:', product.imageUrl);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '🍺';
            }}
          />
        ) : (
          '🍺'
        )}
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.description}
        </Typography>
        
        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>
          R$ {product.price?.toFixed(2)}
        </Typography>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip 
            label={product.isAvailable ? 'Disponível' : 'Indisponível'}
            color={product.isAvailable ? 'success' : 'error'}
            size="small"
          />
          {product.category && (
            <Chip label={product.category} variant="outlined" size="small" />
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onEdit(product); handleMenuClose(); }}>
          <Edit sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={() => { onToggleAvailability(product); handleMenuClose(); }}>
          <Visibility sx={{ mr: 1 }} /> 
          {product.isAvailable ? 'Desativar' : 'Ativar'}
        </MenuItem>
        <MenuItem onClick={() => { onDelete(product); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Excluir
        </MenuItem>
      </Menu>
    </AnimatedCard>
  );
};

const ProductDialog = ({ open, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);

  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        isAvailable: product.isAvailable !== false,
        imageUrl: product.imageUrl || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        isAvailable: true,
        imageUrl: ''
      });
      setImageFile(null);
    }
  }, [product, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.name === 'Produto') {
      alert('Nome do produto é obrigatório e não pode ser genérico');
      return;
    }
    
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      alert('Preço deve ser um número válido maior que zero');
      return;
    }
    
    let imageUrl = formData.imageUrl;
    if (imageFile) {
      if (imageFile.size > 1000000) { // 1MB
        alert('Imagem muito grande. Use uma imagem menor que 1MB.');
        return;
      }
      
      try {
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target.result;
            if (result && result.length < 1500000) { // Limite base64
              resolve(result);
            } else {
              reject(new Error('Imagem processada muito grande'));
            }
          };
          reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
          reader.readAsDataURL(imageFile);
        });
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        alert('Erro ao processar imagem. Tente uma imagem menor.');
        return;
      }
    }
    
    onSave({
      ...formData,
      name: formData.name.trim(),
      price: price,
      imageUrl: imageUrl
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: '90vh', sm: '80vh' }
        }
      }}
    >
      <DialogTitle>
        {product ? 'Editar Produto' : 'Adicionar Produto'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do produto"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange('name')}
            required
            error={formData.name === 'Produto'}
            helperText={formData.name === 'Produto' ? 'Nome genérico não permitido' : ''}
          />
          
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange('description')}
          />
          
          <TextField
            margin="dense"
            label="Preço"
            type="number"
            fullWidth
            variant="outlined"
            inputProps={{ step: 0.01, min: 0 }}
            value={formData.price}
            onChange={handleInputChange('price')}
            required
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Categoria</InputLabel>
            <Select
              value={formData.category}
              label="Categoria"
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              <MenuItem value="Bebidas">Bebidas</MenuItem>
              <MenuItem value="Cervejas">Cervejas</MenuItem>
              <MenuItem value="Vinhos">Vinhos</MenuItem>
              <MenuItem value="Destilados">Destilados</MenuItem>
              <MenuItem value="Refrigerantes">Refrigerantes</MenuItem>
              <MenuItem value="Petiscos">Petiscos</MenuItem>
              <MenuItem value="Pratos Principais">Pratos Principais</MenuItem>
              <MenuItem value="Sobremesas">Sobremesas</MenuItem>
              <MenuItem value="Outros">Outros</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Imagem do Produto
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ marginBottom: 16 }}
            />
            {(formData.imageUrl || imageFile) && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl}
                  alt="Preview"
                  style={{ maxWidth: 200, maxHeight: 150, objectFit: 'cover', borderRadius: 8 }}
                />
              </Box>
            )}
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.isAvailable}
                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
              />
            }
            label="Produto disponível"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        
        <DialogActions sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
          p: { xs: 2, sm: 1 }
        }}>
          <Button 
            onClick={onClose}
            sx={{ 
              minHeight: 44,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{ 
              minHeight: 44,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {product ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Products = () => {
  const { products } = useDataStore();
  const { addProduct, updateProduct } = useFirebaseData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      setDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      await updateProduct(product.id, { isAvailable: !product.isAvailable });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
      try {
        await updateProduct(product.id, { isDeleted: true });
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const activeProducts = products.filter(p => !p.isDeleted);

  return (
    <Box>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }}
        mb={{ xs: 3, sm: 4 }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.75rem', sm: '2.125rem' }
          }}
        >
          Gestão de Produtos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddProduct}
          size="large"
          sx={{ 
            minHeight: 44,
            width: { xs: '100%', sm: 'auto' },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Adicionar Produto
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {activeProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onToggleAvailability={handleToggleAvailability}
            />
          </Grid>
        ))}
      </Grid>

      {activeProducts.length === 0 && (
        <EmptyState
          icon="🍺"
          title="Nenhum produto cadastrado"
          description="Adicione seu primeiro produto para começar"
          actionLabel="Adicionar Produto"
          onAction={handleAddProduct}
        />
      )}

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </Box>
  );
};

export default Products;