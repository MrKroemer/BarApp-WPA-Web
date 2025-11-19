import React, { useState, useEffect, useRef } from 'react';
import { Box, Card, TextField, Button, Typography, Alert, Switch, FormControlLabel } from '@mui/material';
import { QrCodeScanner, Google } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const AuthForm = () => {
  const [userType, setUserType] = useState('customer'); // 'customer', 'owner'
  const [step, setStep] = useState('user-type'); // 'user-type', 'qr', 'info', 'owner-login'
  const [qrScanned, setQrScanned] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerCode, setOwnerCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const { loginWithQR, loginWithEmail, loginWithGoogle } = useAuth();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Erro ao acessar câmera');
    }
  };

  const scanQR = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // Simular scan QR - em produção usar biblioteca como jsQR
      setQrScanned(true);
      setStep('info');
      
      // Parar câmera
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nome e telefone são obrigatórios');
      return;
    }
    await completeCustomerLogin();
  };

  const handleOwnerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (ownerCode !== 'STITCH2024OWNER') {
        throw new Error('Código de proprietário inválido');
      }
      await loginWithEmail(email, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const completeCustomerLogin = async () => {
    setLoading(true);
    try {
      await loginWithQR({ name, phone, isOwner: false });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (step === 'qr') {
      startCamera();
    }
  }, [step]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const renderQRStep = () => (
    <>
      <Typography variant="h6" align="center" sx={{ mb: 2, color: '#fff' }}>
        Escaneie o QR Code da mesa
      </Typography>
      
      <Box sx={{ position: 'relative', mb: 2 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: '100%', borderRadius: 8 }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Box>
      
      <Button
        fullWidth
        variant="contained"
        startIcon={<QrCodeScanner />}
        onClick={scanQR}
        sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
      >
        Escanear QR Code
      </Button>
    </>
  );

  const renderUserTypeStep = () => (
    <>
      <Typography variant="h6" align="center" sx={{ mb: 3, color: '#fff' }}>
        Como você quer entrar?
      </Typography>
      
      <Button
        fullWidth
        variant="contained"
        onClick={() => { setUserType('customer'); setStep('qr'); }}
        sx={{ mb: 2, bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
      >
        Sou Cliente (QR Code)
      </Button>
      
      <Button
        fullWidth
        variant="outlined"
        onClick={() => { setUserType('owner'); setStep('owner-login'); }}
        sx={{ color: '#fff', borderColor: '#fff' }}
      >
        Sou Proprietário
      </Button>
    </>
  );

  const renderInfoStep = () => (
    <>
      <Typography variant="h6" align="center" sx={{ mb: 2, color: '#fff' }}>
        Seus dados
      </Typography>
      
      <form onSubmit={handleInfoSubmit}>
        <TextField
          fullWidth
          label="Nome"
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
          sx={{ mb: 2 }}
          required
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
        >
          Entrar
        </Button>
      </form>
    </>
  );

  const renderOwnerLoginStep = () => (
    <>
      <Typography variant="h6" align="center" sx={{ mb: 2, color: '#fff' }}>
        Login do Proprietário
      </Typography>
      
      <form onSubmit={handleOwnerSubmit}>
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
        
        <TextField
          fullWidth
          label="Código de Proprietário"
          value={ownerCode}
          onChange={(e) => setOwnerCode(e.target.value)}
          sx={{ mb: 2 }}
          required
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: '#ff6b35', '&:hover': { bgcolor: '#e55a2b' } }}
        >
          Entrar
        </Button>
      </form>
      
      <Button
        fullWidth
        variant="text"
        onClick={() => setStep('user-type')}
        sx={{ mt: 1, color: '#ff6b35' }}
      >
        Voltar
      </Button>
    </>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#211111', p: 2 }}>
      <Card sx={{ maxWidth: 400, width: '100%', p: 3, bgcolor: '#2a2a2a' }}>
        <Typography variant="h4" align="center" sx={{ mb: 3, color: '#fff', fontWeight: 'bold' }}>
          Bar do Bode
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {step === 'user-type' && renderUserTypeStep()}
        {step === 'qr' && renderQRStep()}
        {step === 'info' && renderInfoStep()}
        {step === 'owner-login' && renderOwnerLoginStep()}
        
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={handleGoogleLogin}
          disabled={loading}
          sx={{ mt: 2, color: '#fff', borderColor: '#fff' }}
        >
          Entrar com Google
        </Button>
      </Card>
    </Box>
  );
};

export default AuthForm;