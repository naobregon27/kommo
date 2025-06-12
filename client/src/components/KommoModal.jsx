// src/components/KommoModal.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, CircularProgress,
  Alert, Tabs, Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import api from '../config/api'; // Importar la instancia de axios

const KommoModal = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    kommo_client_secret: '',
    kommo_client_id: '',
    kommo_redirect_uri: 'https://crm-server-q3jg.onrender.com/api/kommo/callback',
    kommo_base_url: '',
    kommo_auth_token: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const theme = useTheme();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (activeTab === 'register') {
      if (!formData.username || !formData.password || !formData.kommo_client_secret || 
          !formData.kommo_client_id || !formData.kommo_base_url || !formData.kommo_auth_token) {
        setError('Todos los campos son obligatorios');
        return;
      }

      const esValida = /^https:\/\/.*kommo\.com$/.test(formData.kommo_base_url);
      if (!esValida) {
        return alert("dominio de kommo invalido; debe empezar con https:// y terminar con kommo.com")
      }
      
    } else {
      if (!formData.username || !formData.password) {
        setError('Usuario y contraseña son requeridos');
        return;
      }
    }

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const endpoint = activeTab === 'register' ? 'register' : 'login';
      const response = await api.post(`/api/auth/${endpoint}`, 
        activeTab === 'register' ? formData : {
          username: formData.username,
          password: formData.password
        }
      );

      const { token, user, kommo_credentials } = response.data;

      // Guardar el token en localStorage
      localStorage.setItem('kommoToken', token);
      
      // Configurar el token en los headers por defecto de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setSuccessMessage(activeTab === 'register' ? '¡Registro exitoso!' : '¡Conexión exitosa!');
      
      // Llamar a onSubmit con los datos necesarios
      onSubmit({
        token,
        user,
        kommo_credentials
      });

      // Cerrar el modal después de un breve delay
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Error en autenticación:', error);
      setError(error.response?.data?.error || error.message || 'Error en la autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: '',
      password: '',
      kommo_client_secret: '',
      kommo_client_id: '',
      kommo_redirect_uri: 'https://crm-server-q3jg.onrender.com/api/kommo/callback',
      kommo_base_url: '',
      kommo_auth_token: ''
    });
    setError('');
    setSuccessMessage('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: theme.shadows[10],
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'none',
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: theme.palette.secondary.dark, color: theme.palette.text.primary, borderTopLeftRadius: '12px', borderTopRightRadius: '12px', p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
          {activeTab === 'register' ? 'Registrarse en Kommo' : 'Iniciar Sesión en Kommo'}
        </Typography>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab value="login" label="Iniciar Sesión" />
          <Tab value="register" label="Registrarse" />
        </Tabs>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 3, pb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.secondary }}>
          {activeTab === 'register' ? 'Ingresa tus datos de registro y credenciales de Kommo' : 'Ingresa tus credenciales de acceso'}
        </Typography>
        
        <TextField
          autoFocus
          margin="dense"
          name="username"
          label="Nombre de Usuario"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.username}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ style: { color: theme.palette.primary.light } }}
          InputProps={{ style: { color: theme.palette.text.primary, backgroundColor: 'rgba(255,255,255,0.05)' } }}
        />

        <TextField
          margin="dense"
          name="password"
          label="Contraseña"
          type="password"
          fullWidth
          variant="outlined"
          value={formData.password}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
          InputLabelProps={{ style: { color: theme.palette.primary.light } }}
          InputProps={{ style: { color: theme.palette.text.primary, backgroundColor: 'rgba(255,255,255,0.05)' } }}
        />

        {activeTab === 'register' && (
          <>
            <TextField
              margin="dense"
              name="kommo_base_url"
              label="Dominio de Kommo"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.kommo_base_url}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputLabelProps={{ style: { color: theme.palette.primary.light } }}
              InputProps={{ style: { color: theme.palette.text.primary, backgroundColor: 'rgba(255,255,255,0.05)' } }}
              placeholder="miempresa.kommo.com"
            />

            <TextField
              margin="dense"
              name="kommo_client_id"
              label="Client ID de Kommo"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.kommo_client_id}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputLabelProps={{ style: { color: theme.palette.primary.light } }}
              InputProps={{ style: { color: theme.palette.text.primary, backgroundColor: 'rgba(255,255,255,0.05)' } }}
            />

            <TextField
              margin="dense"
              name="kommo_client_secret"
              label="Client Secret de Kommo"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.kommo_client_secret}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputLabelProps={{ style: { color: theme.palette.primary.light } }}
              InputProps={{ style: { color: theme.palette.text.primary, backgroundColor: 'rgba(255,255,255,0.05)' } }}
            />

            <TextField
              margin="dense"
              name="kommo_auth_token"
              label="Token de Autenticación de Kommo"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.kommo_auth_token}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputLabelProps={{ style: { color: theme.palette.primary.light } }}
              InputProps={{ style: { color: theme.palette.text.primary, backgroundColor: 'rgba(255,255,255,0.05)' } }}
            />
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mt: 1 }}>
            {successMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          color="primary"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            activeTab === 'register' ? 'Registrarse' : 'Iniciar Sesión'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KommoModal;