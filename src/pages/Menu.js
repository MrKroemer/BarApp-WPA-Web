import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Badge, Fab, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Divider, IconButton, Chip, TextField, MenuItem } from '@mui/material';
import { ShoppingCart, Add, Remove, Delete, FilterList } from '@mui/icons-material';
import { useDataStore, useAuthStore } from '../store/useStore';
import { useFirebaseData } from '../hooks/useFirebase';
import AnimatedCard from '../components/AnimatedCard';
import EmptyState from '../components/EmptyState';

const CartDialog = ({ open, onClose, cart, onUpdateCart, onClearCart, onCheckout }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleQuantityChange = (productId, change) => {
    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean);
    
    onUpdateCart(updatedCart);
  };

  const handleRemoveItem = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    onUpdateCart(updatedCart);
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Carrinho de Compras
          <IconButton onClick={onClearCart} color="error" size="small">
            <Delete />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {cart.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
            Seu carrinho está vazio
          </Typography>
        ) : (
          <List>
            {cart.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem>
                  <ListItemText
                    primary={item.name}
                    secondary={`R$ ${item.price.toFixed(2)} cada`}
                  />
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      <Remove />
                    </IconButton>
                    <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      <Add />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleRemoveItem(item.id)}
                      sx={{ ml: 1 }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < cart.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
        
        {cart.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6" textAlign="center">
              Total: R$ {total.toFixed(2)}
            </Typography>
          </Box>
        )}
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
          Continuar Comprando
        </Button>
        {cart.length > 0 && (
          <Button 
            variant="contained" 
            onClick={onCheckout}
            sx={{ 
              minHeight: 44,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Finalizar Pedido
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const Menu = () => {
  const { products } = useDataStore();
  const { userProfile } = useAuthStore();
  const { createOrder } = useFirebaseData();
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Garantir que todos os produtos disponíveis sejam carregados
  const availableProducts = products.filter(p => {
    const isAvailable = p.isAvailable !== false; // Considera true se undefined
    const isNotDeleted = !p.isDeleted;
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return isAvailable && isNotDeleted && matchesCategory && matchesSearch;
  });

  // Obter categorias únicas
  const categories = [...new Set(products.filter(p => p.category).map(p => p.category))];

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        customerName: userProfile?.name || 'Cliente'
      };

      await createOrder(orderData);
      setCart([]);
      setCartOpen(false);
      alert('Pedido realizado com sucesso!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erro ao realizar pedido: ' + error.message);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

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
        Cardápio
      </Typography>

      {/* Filtros */}
      <Box sx={{ 
        mb: { xs: 3, sm: 4 }, 
        display: 'flex', 
        gap: { xs: 1, sm: 2 }, 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }
      }}>
        <TextField
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: { sm: 200 }, width: { xs: '100%', sm: 'auto' } }}
        />
        
        <TextField
          select
          label="Categoria"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          size="small"
          sx={{ minWidth: { sm: 150 }, width: { xs: '100%', sm: 'auto' } }}
        >
          <MenuItem value="all">Todas</MenuItem>
          {categories.map(category => (
            <MenuItem key={category} value={category}>{category}</MenuItem>
          ))}
        </TextField>
        
        <Chip 
          icon={<FilterList />}
          label={`${availableProducts.length} produtos`}
          variant="outlined"
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        />
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {availableProducts.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <AnimatedCard 
              delay={index * 50}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Box
                sx={{
                  height: { xs: 180, sm: 200 },
                  background: product.imageUrl ? 'none' : 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
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
                      console.log('Erro ao carregar imagem do produto:', product.name);
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '🍺';
                    }}
                  />
                ) : (
                  '🍺'
                )}
              </Box>
              
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                  {product.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {product.description}
                </Typography>
                
                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
                  R$ {product.price?.toFixed(2)}
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                  onClick={() => addToCart(product)}
                  size="large"
                  sx={{ 
                    minHeight: 44,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Adicionar ao Carrinho
                </Button>
              </CardContent>
            </AnimatedCard>
          </Grid>
        ))}
      </Grid>

      {availableProducts.length === 0 && (
        <EmptyState
          icon="🍽️"
          title={searchTerm || categoryFilter !== 'all' ? 'Nenhum produto encontrado' : 'Cardápio indisponível'}
          description={searchTerm || categoryFilter !== 'all' 
            ? 'Tente ajustar os filtros de busca'
            : 'Não há produtos disponíveis no momento'
          }
        />
      )}

      {/* Floating Cart Button */}
      {getCartItemCount() > 0 && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => setCartOpen(true)}
          aria-label={`Carrinho com ${getCartItemCount()} itens`}
        >
          <Badge badgeContent={getCartItemCount()} color="error">
            <ShoppingCart />
          </Badge>
        </Fab>
      )}

      <CartDialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateCart={setCart}
        onClearCart={clearCart}
        onCheckout={handleCheckout}
      />
    </Box>
  );
};

export default Menu;