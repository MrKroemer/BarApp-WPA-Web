import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useAuthStore } from '../store/useStore';
import { canAccessRoute } from '../utils/permissions';

const ProtectedRoute = ({ children, requiredRoute }) => {
  const { userProfile } = useAuthStore();

  if (!canAccessRoute(userProfile, requiredRoute)) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="400px"
        textAlign="center"
        p={4}
      >
        <Lock sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Acesso Negado
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Você não tem permissão para acessar esta página.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.history.back()}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;