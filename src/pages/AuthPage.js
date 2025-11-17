import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Checkbox, FormControlLabel, Alert, Divider } from '@mui/material';
import { Google } from '@mui/icons-material';
import { useAuth } from '../hooks/useFirebase';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    isOwner: false,
    ownerCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name, formData.isOwner, formData.ownerCode);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleOwnerChange = (e) => {
    setFormData(prev => ({
      ...prev,
      isOwner: e.target.checked,
      ownerCode: e.target.checked ? prev.ownerCode : ''
    }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #211111 0%, #1a0f0f 100%)',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', backgroundColor: 'background.paper' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: 'primary.main',
              textShadow: '0 2px 10px rgba(255, 107, 53, 0.3)'
            }}
          >
            🍺 Bar do Bode
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {!isLogin && (
              <TextField
                fullWidth
                label="Nome completo"
                value={formData.name}
                onChange={handleInputChange('name')}
                margin="normal"
                required
                variant="outlined"
              />
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              margin="normal"
              required
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              margin="normal"
              required
              variant="outlined"
            />

            {!isLogin && (
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isOwner}
                      onChange={handleOwnerChange}
                      color="primary"
                    />
                  }
                  label="Sou proprietário"
                />

                {formData.isOwner && (
                  <TextField
                    fullWidth
                    label="Código de proprietário"
                    value={formData.ownerCode}
                    onChange={handleInputChange('ownerCode')}
                    margin="normal"
                    required
                    variant="outlined"
                    placeholder="STITCH2024OWNER"
                  />
                )}
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Registrar')}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}>ou</Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{ mb: 2, py: 1.5 }}
          >
            Entrar com Google
          </Button>

          <Box textAlign="center">
            <Button
              color="primary"
              onClick={() => setIsLogin(!isLogin)}
              sx={{ textTransform: 'none' }}
            >
              {isLogin ? 'Criar conta' : 'Já tenho conta'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthPage;