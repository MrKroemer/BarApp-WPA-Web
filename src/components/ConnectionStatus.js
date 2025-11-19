import React from 'react';
import { Alert, Snackbar, Chip } from '@mui/material';
import { WifiOff, Wifi, CloudQueue } from '@mui/icons-material';
import { useOffline } from '../hooks/useOffline';

const ConnectionStatus = () => {
  const { isOnline, offlineQueue } = useOffline();

  return (
    <>
      {/* Status Chip */}
      <Chip
        icon={isOnline ? <Wifi /> : <WifiOff />}
        label={isOnline ? 'Online' : 'Offline'}
        color={isOnline ? 'success' : 'error'}
        variant="outlined"
        size="small"
        sx={{ 
          position: 'fixed',
          top: 80,
          right: 16,
          zIndex: 1300
        }}
      />

      {/* Offline Queue Indicator */}
      {offlineQueue > 0 && (
        <Chip
          icon={<CloudQueue />}
          label={`${offlineQueue} ações pendentes`}
          color="warning"
          variant="filled"
          size="small"
          sx={{ 
            position: 'fixed',
            top: 120,
            right: 16,
            zIndex: 1300
          }}
        />
      )}

      {/* Offline Alert */}
      <Snackbar
        open={!isOnline}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" variant="filled">
          Você está offline. Algumas funcionalidades podem estar limitadas.
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConnectionStatus;