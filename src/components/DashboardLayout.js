import React from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemIcon, ListItemText, IconButton, Chip, Button } from '@mui/material';
import { Menu as MenuIcon, Dashboard, Inventory, Assessment, ShoppingCart, People, TrendingUp, CardGiftcard, Restaurant, Receipt, Person, Logout, DarkMode, LightMode } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../store/useStore';
import { useAuth } from '../hooks/useFirebase';
import { useTheme } from '../utils/ThemeContext';
import { canAccessRoute } from '../utils/permissions';

const DRAWER_WIDTH = 280;
const MOBILE_DRAWER_WIDTH = 260;

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { user, userProfile } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { darkMode, toggleTheme } = useTheme();

  const isOwner = userProfile?.isOwner;

  const ownerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Produtos', icon: <Inventory />, path: '/products' },
    { text: 'Estoque', icon: <Assessment />, path: '/stock' },
    { text: 'Pedidos', icon: <ShoppingCart />, path: '/orders' },
    { text: 'Clientes', icon: <People />, path: '/customers' },
    { text: 'Relatórios', icon: <TrendingUp />, path: '/reports' },
    { text: 'Cashback', icon: <CardGiftcard />, path: '/cashback' }
  ];

  const customerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Cardápio', icon: <Restaurant />, path: '/menu' },
    { text: 'Meus Pedidos', icon: <Receipt />, path: '/my-orders' },
    { text: 'Perfil', icon: <Person />, path: '/profile' }
  ];

  const menuItems = isOwner ? ownerMenuItems : customerMenuItems;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
          🍺 Bar do Bode
        </Typography>
      </Box>
      
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {menuItems
          .filter(item => canAccessRoute(userProfile, item.path))
          .map((item) => (
            <ListItem
              key={item.path}
              button
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === item.path ? 'primary.dark' : 'action.hover'
                }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ color: location.pathname === item.path ? 'white' : 'inherit' }}
              />
            </ListItem>
          ))
        }
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Bar do Bode
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={isOwner ? 'Proprietário' : 'Cliente'}
              color={isOwner ? 'secondary' : 'primary'}
              variant="outlined"
            />
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {userProfile?.name || user?.displayName}
            </Typography>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
            <Button
              color="inherit"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Sair
            </Button>
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: MOBILE_DRAWER_WIDTH,
              backgroundColor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider'
            }
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              backgroundColor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider'
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 7, sm: 8 },
          minHeight: { xs: 'calc(100vh - 7rem)', sm: 'calc(100vh - 8rem)' },
          overflow: 'auto',
          pb: { xs: 3, sm: 3 }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;