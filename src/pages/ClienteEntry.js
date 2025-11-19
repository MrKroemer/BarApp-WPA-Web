import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, Button, TextField, Alert } from '@mui/material';

const ClienteEntry = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nome e telefone são obrigatórios');
      return;
    }

    setLoading(true);
    
    // Salvar dados do cliente no localStorage
    const customerData = {
      name: name.trim(),
      phone: phone.trim(),
      entryTime: new Date().toISOString(),
      isGuest: true
    };
    
    localStorage.setItem('customerSession', JSON.stringify(customerData));
    
    // Redirecionar para o menu
    navigate('/menu');
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#211111', p: 2 }}>
      <Card sx={{ maxWidth: 400, width: '100%', p: 3, bgcolor: '#2a2a2a' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img 
            src="/bardobode.jpg" 
            alt="Bar do Bode" 
            style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '50%', 
              border: '3px solid #ff6b35',
              objectFit: 'cover'
            }}
          />
        </Box>
        
        <Typography variant="h5" align="center" sx={{ mb: 3, color: '#fff', fontWeight: 'bold' }}>
          Bem-vindo ao Bar do Bode!
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          
          <TextField
            fullWidth
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{ mb: 3 }}
            required
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
          >
            {loading ? 'Entrando...' : 'Entrar no Bar'}
          </Button>
        </form>
      </Card>
    </Box>
  );
};

export default ClienteEntry;