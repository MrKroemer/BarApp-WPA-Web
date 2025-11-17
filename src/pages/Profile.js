import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Avatar, Grid, Divider, Alert } from '@mui/material';
import { Person, Email, Edit, Save, Cancel } from '@mui/icons-material';
import { useAuthStore } from '../store/useStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import AnimatedCard from '../components/AnimatedCard';

const Profile = () => {
  const { user, userProfile, setUserProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        updatedAt: new Date()
      });
      
      setUserProfile({ ...userProfile, name: formData.name });
      setEditing(false);
      setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Erro ao atualizar perfil: ' + error.message, type: 'error' });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || '',
      email: user?.email || ''
    });
    setEditing(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Meu Perfil
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ text: '', type: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <AnimatedCard delay={0}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: 48
                }}
              >
                {userProfile?.name?.charAt(0)?.toUpperCase() || <Person />}
              </Avatar>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {userProfile?.name || 'Usuário'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {userProfile?.isOwner ? 'Proprietário' : 'Cliente'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Membro desde {userProfile?.createdAt?.toDate().toLocaleDateString('pt-BR')}
              </Typography>
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <AnimatedCard delay={200}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Informações Pessoais
                </Typography>
                {!editing ? (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                    variant="outlined"
                  >
                    Editar
                  </Button>
                ) : (
                  <Box display="flex" gap={1}>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSave}
                      variant="contained"
                      disabled={loading}
                    >
                      Salvar
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      variant="outlined"
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    disabled={!editing}
                    variant={editing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    disabled
                    variant="filled"
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    helperText="O email não pode ser alterado"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Informações da Conta
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ID do Usuário
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {user?.uid}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tipo de Conta
                    </Typography>
                    <Typography variant="body1">
                      {userProfile?.isOwner ? 'Proprietário' : 'Cliente'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Último Login
                    </Typography>
                    <Typography variant="body1">
                      {user?.metadata?.lastSignInTime ? 
                        new Date(user.metadata.lastSignInTime).toLocaleString('pt-BR') : 
                        'Não disponível'
                      }
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Conta Criada
                    </Typography>
                    <Typography variant="body1">
                      {user?.metadata?.creationTime ? 
                        new Date(user.metadata.creationTime).toLocaleString('pt-BR') : 
                        'Não disponível'
                      }
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;