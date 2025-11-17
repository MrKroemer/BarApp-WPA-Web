import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ 
  icon = '📋', 
  title = 'Nenhum item encontrado', 
  description = 'Não há dados para exibir no momento',
  actionLabel,
  onAction
}) => {
  return (
    <Box textAlign="center" py={8}>
      <Typography variant="h1" sx={{ fontSize: 64, mb: 2 }}>
        {icon}
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;