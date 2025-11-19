import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const GuestLayout = ({ children }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('guestUser');
    localStorage.removeItem('guestProfile');
    navigate('/');
    window.location.reload();
  };

  const guestProfile = JSON.parse(localStorage.getItem('guestProfile') || '{}');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ bgcolor: '#211111' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#fff' }}>
            Bar do Bode - {guestProfile.name}
          </Typography>
          <Button
            color="inherit"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ color: '#fff' }}
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default GuestLayout;