import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SnackbarContent
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  UploadFile as UploadFileIcon // <-- Nueva importación: Ícono para el botón de importar archivos
} from '@mui/icons-material';
import {
  fetchContacts,
  selectContact,
  clearSelectedContacts,
} from '../store/slices/contactsSlice';

function Contacts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, status, error, selectedContactIds } = useSelector((state) => state.contacts);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authStatus = params.get('auth');
    const authError = params.get('error');

    if (authStatus === 'success') {
      setShowWelcomeDialog(true);
      window.history.replaceState({}, document.title, '/contacts');
      dispatch(fetchContacts());
    } else if (authError) {
      setSnackbarMessage('Error en la autenticación. Por favor, intenta de nuevo.');
      setSnackbarOpen(true);
      window.history.replaceState({}, document.title, '/contacts');
    }
  }, [location, dispatch]);

  const handleRefreshContacts = () => {
    dispatch(fetchContacts());
  };

  const handleSelectContact = (contactId) => {
    dispatch(selectContact(contactId));
  };

  const handleSyncSelected = () => {
    if (selectedContactIds.length > 0) {
      navigate('/sync');
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('contacts', file);

        const response = await fetch('https://crm-server-q3jg.onrender.com/api/contacts/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('kommoToken')}` // Usando kommoToken que es el que usamos en la app
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al subir el archivo');
        }

        const result = await response.json();
        setSnackbarMessage(`${result.message}. ${result.contactsAdded} contactos agregados.`);
        setSnackbarOpen(true);
        
        // Actualizar la lista de contactos
        dispatch(fetchContacts());
      } catch (error) {
        console.error('Error:', error);
        setSnackbarMessage('Error al procesar el archivo: ' + error.message);
        setSnackbarOpen(true);
      } finally {
        setIsUploading(false);
      }
    }
    event.target.value = '';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #5c33f6 0%, #000000 100%)',
        padding: 3,
        color: '#e0e0ff'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Contactos</Typography>
        <Box>
          <input
            type="file"
            id="import-contacts-file-input"
            accept=".txt,.tex"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={() => document.getElementById('import-contacts-file-input').click()}
            sx={{ mr: 2 }}
            startIcon={isUploading ? <CircularProgress size={24} color="inherit" /> : <UploadFileIcon />}
            disabled={isUploading}
          >
            {isUploading ? 'Importando...' : 'Importar Contactos'}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleRefreshContacts}
            sx={{ mr: 2 }}
            startIcon={<RefreshIcon />}
          >
            Actualizar Contactos
          </Button>
          <Button
            variant="outlined"
            onClick={() => dispatch(clearSelectedContacts())}
            disabled={selectedContactIds.length === 0}
          >
            Limpiar Selección
          </Button>
        </Box>
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle1" color="textSecondary">
          {selectedContactIds.length > 0
            ? `Contactos seleccionados (${selectedContactIds.length}/${items.length})`
            : `Ningún contacto seleccionado (0/${items.length})`}
        </Typography>
      </Box>

      {(status === 'loading' || isUploading) && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      )}

      {status === 'failed' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefreshContacts}>
              Reintentar
            </Button>
          }
        >
          Error al cargar contactos: {error}
        </Alert>
      )}

      {status === 'succeeded' && items.length === 0 && (
        <Alert severity="info">
          No se encontraron contactos. Si acabas de autenticarte, haz clic en "Actualizar Contactos".
        </Alert>
      )}

      {status === 'succeeded' && items.length > 0 && (
        <Grid container spacing={3}>
          {items.map((contact) => {
            const isSelected = selectedContactIds.includes(contact.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={contact.id}>
                <Card
                  sx={{
                    backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.08)' : 'rgba(0,0,0,0)',
                    border: isSelected ? '2px solid #2196F3' : '1px solid rgba(0, 0, 0, 0.12)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectContact(contact.id)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectContact(contact.id);
                        }}
                        color="primary"
                      />
                      <Box flex={1}>
                        <Typography variant="h6">{contact.name}</Typography>
                        <Typography color="textSecondary">{contact.phoneNumber || contact.phoneNumbers?.[0]?.value}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <Tooltip title={selectedContactIds.length > 0 ? 'Sincronizar seleccionados' : 'Selecciona contactos para sincronizar'}>
          <span>
            <Fab
              color="secondary"
              onClick={handleSyncSelected}
              disabled={selectedContactIds.length === 0}
              sx={{
                opacity: selectedContactIds.length > 0 ? 1 : 0.6,
                transition: 'opacity 0.3s ease'
              }}
            >
              <SendIcon />
            </Fab>
          </span>
        </Tooltip>
      </Box>

      <Dialog
        open={showWelcomeDialog}
        onClose={() => setShowWelcomeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>¡Autenticación Exitosa!</DialogTitle>
        <DialogContent>
          <Typography>
            Has sido autenticado correctamente con Google. Tus contactos se cargarán automáticamente.
            Si no ves tus contactos, haz clic en el botón "Actualizar Contactos".
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWelcomeDialog(false)} color="primary">
            Entendido
          </Button>
          <Button
            onClick={() => {
              handleRefreshContacts();
              setShowWelcomeDialog(false);
            }}
            color="primary"
            variant="contained"
          >
            Actualizar Contactos
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarMessage.includes('Error') ? 'error' : 'success'}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Contacts;
