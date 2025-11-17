import React, { useState } from 'react';
import { Box, Card, TextField, Button, Typography, Alert, Switch, FormControlLabel } from '@mui/material';
import { Google } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [ownerCode, setOwnerCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        if (isOwner && ownerCode !== 'STITCH2024OWNER') {
          throw new Error('Código de proprietário inválido');
        }
        await registerWithEmail(email, password, name, isOwner);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#211111', p: 2 }}>
      <Card sx={{ maxWidth: 400, width: '100%', p: 3, bgcolor: '#2a2a2a' }}>
        <Typography variant="h4" align="center" sx={{ mb: 3, color: '#fff', fontWeight: 'bold' }}>
          Bar do Bode
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <TextField
              fullWidth
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
          )}
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          
          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          
          {!isLogin && (
            <>
              <FormControlLabel
                control={<Switch checked={isOwner} onChange={(e) => setIsOwner(e.target.checked)} />}
                label="Sou proprietário"
                sx={{ mb: 2, color: '#fff' }}
              />
              
              {isOwner && (
                <TextField
                  fullWidth
                  label="Código de Proprietário"
                  value={ownerCode}
                  onChange={(e) => setOwnerCode(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
              )}
            </>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mb: 2, bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
          >
            {isLogin ? 'Entrar' : 'Registrar'}
          </Button>
        </form>
        
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={handleGoogleLogin}
          disabled={loading}
          sx={{ mb: 2, color: '#fff', borderColor: '#fff' }}
        >
          Entrar com Google
        </Button>
        
        <Button
          fullWidth
          variant="text"
          onClick={() => setIsLogin(!isLogin)}
          sx={{ color: '#ff6b35' }}
        >
          {isLogin ? 'Criar conta' : 'Já tenho conta'}
        </Button>
      </Card>
    </Box>
  );
};

export default AuthForm;