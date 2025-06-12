// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid,
  Dialog, DialogContent, DialogTitle, DialogActions,
  Alert, Snackbar, Paper
} from '@mui/material';
import {
  LogoutOutlined as LogoutIcon, Google as GoogleIcon,
  SyncAlt as SyncIcon, ContactPhone as ContactsIcon,
  Link as LinkIcon // Importa LinkIcon para el botón de Kommo
} from '@mui/icons-material';
import { fetchContacts } from '../store/slices/contactsSlice';
import api from '../config/api';
import { useTheme } from '@mui/material/styles';
import KommoModal from '../components/KommoModal'; // Importa el modal de Kommo

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme(); // Obtén el tema para usar sus colores y sombras

  // Estados de la aplicación
  const { items: contacts, status } = useSelector((state) => state.contacts);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [authWindow, setAuthWindow] = useState(null);
  const [showKommoModal, setShowKommoModal] = useState(false); // Estado para el modal de Kommo
  // NUEVO ESTADO: Para el estado de conexión de Kommo
  // Lo inicializamos como 'disconnected' para que se vea el rojo por defecto.
  const [kommoStatus, setKommoStatus] = useState('disconnected'); // Este estado no afecta al texto del botón de la cabecera con esta petición
  const [kommoConnected, setKommoConnected] = useState(false);
  // Efecto para verificar el estado de autenticación y manejar mensajes de Google Auth
  useEffect(() => {
    checkAuthStatus();
    checkKommoStatus(); // Nueva función para verificar el estado de Kommo

    const handleAuthMessage = async (event) => {
      if (event.origin === window.location.origin && event.data === 'google-auth-success') {
        authWindow?.close();
        setAuthWindow(null);
        await checkAuthStatus();
        setErrorMessage(null);
        setShowSuccessMessage(true);
      }
    };
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [authWindow]);

  // Función para verificar el estado de autenticación (Google)
  const checkAuthStatus = async () => {
    try {
      await dispatch(fetchContacts()).unwrap();
      // Si fetchContacts tiene éxito, significa que Google está conectado.
      // Puedes manejar esto más explícitamente si tu API de Google tiene un endpoint de estado.
    } catch (error) {
      if (!error.message?.includes('No autenticado') && !error.message?.includes('Sesión expirada')) {
        setErrorMessage(error.message || 'Error al verificar autenticación');
      } else {
        // No es un error, simplemente no está autenticado o la sesión expiró.
        setErrorMessage(null);
      }
    }
  };

  const logout = () => {
    localStorage.clear();
    setKommoConnected(false); // Aseguramos que el estado de Kommo también se resetee
    dispatch({ type: 'contacts/clearAll' });
    dispatch({ type: 'messages/clearAll' });
    dispatch({ type: 'sync/clearAll' });
    setErrorMessage(null);
    setShowSuccessMessage(true);
    setTimeout(() => { window.location.href = '/'; }, 1000);
  };

  // Añadir la función para verificar el estado de Kommo
  const checkKommoStatus = async () => {
    try {
      const token = localStorage.getItem('kommoToken');
      if (!token) {
        setKommoStatus('disconnected');
        return;
      }

      setKommoConnected(true)

      // Configurar el token en los headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      /* // Verificar el estado de la conexión
      const response = await api.get('/api/kommo/connection-status'); */

      /* if (response.data.success) {
        setKommoStatus('connected');
        setErrorMessage(null);
      } else {
        setKommoStatus('disconnected');
        throw new Error(response.data.message);
      } */
    } catch (error) {
      console.error('Error al verificar estado de Kommo:', error);
      setKommoStatus('disconnected');
      if (error.response?.status === 401) {
        // Token inválido o expirado, limpiar token
        localStorage.removeItem('kommoToken');
      }
    }
  };

  // Función para cerrar sesión (general)
  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      dispatch({ type: 'contacts/clearAll' });
      dispatch({ type: 'messages/clearAll' });
      dispatch({ type: 'sync/clearAll' });
      localStorage.clear();
      setErrorMessage(null);
      setShowSuccessMessage(true);
      setTimeout(() => { window.location.href = '/'; }, 1000); // Redirigir a la página de inicio
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setErrorMessage('Error al cerrar sesión. Por favor, intenta nuevamente.');
      setShowSuccessMessage(false);
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  // Función para conectar con Google
  const handleConnectGoogle = async () => {
    try {
      const response = await api.get('/api/google');
      if (response.data?.authUrl) {
        // Abre la ventana de autenticación de Google
        const newWindow = window.open(response.data.authUrl, 'Google Auth', 'width=600,height=800,left=' + (window.screenX + (window.outerWidth - 600) / 2) + ',top=' + (window.screenY + (window.outerHeight - 800) / 2));
        setAuthWindow(newWindow);
        // Monitorear si la ventana se cierra
        const checkWindow = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(checkWindow);
            setAuthWindow(null);
            // Si la ventana se cerró sin un mensaje de éxito, podría ser un error o cancelación
            checkAuthStatus(); // Volver a verificar el estado
          }
        }, 500);
      }
    } catch (error) {
      setErrorMessage('Error al conectar con Google. Por favor, intenta nuevamente.');
      setShowSuccessMessage(false);
    }
  };

  // Modificar handleKommoSubmit
  const handleKommoSubmit = async (authData) => {
    try {
      // Guardar el token en localStorage
      localStorage.setItem('kommoToken', authData.token);

      // Configurar el token en los headers
      api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;

      // Verificar la conexión inmediatamente
      await checkKommoStatus();

      setErrorMessage(null);
      setShowSuccessMessage(true);
      setShowKommoModal(false);
    } catch (error) {
      console.error('Error en la autenticación de Kommo:', error);
      setErrorMessage(error.response?.data?.message || 'Error al conectar con Kommo');
      setKommoStatus('disconnected');
    }
  };

  // Añadir función para cerrar sesión de Kommo
  const handleKommoLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      localStorage.removeItem('kommoToken');
      delete api.defaults.headers.common['Authorization'];
      setKommoStatus('disconnected');
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Error al cerrar sesión de Kommo:', error);
      setErrorMessage('Error al cerrar sesión de Kommo');
    }
  };

  // Función específica para cerrar sesión de Google
  const handleGoogleLogout = async () => {
    try {
      await api.post('/api/google/logout');
      dispatch({ type: 'contacts/clearAll' }); // Solo limpiamos los contactos de Google
      setErrorMessage(null);
      setShowSuccessMessage(true);
      checkAuthStatus(); // Verificar el nuevo estado de autenticación
    } catch (error) {
      console.error('Error al cerrar sesión de Google:', error);
      setErrorMessage('Error al cerrar sesión de Google. Por favor, intenta nuevamente.');
      setShowSuccessMessage(false);
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Encabezado del Dashboard y Botones de acción */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Dashboard</Typography>
            <Box> {/* Contenedor para los botones de la esquina superior derecha */}
              {/* Botón de Kommo en la cabecera: CAMBIO DE TEXTO SOLAMENTE */}
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={kommoConnected ? logout : () => setShowKommoModal(true)}
                sx={{
                  mr: 2,
                  // Estilos dinámicos para el botón de Kommo
                  borderColor: kommoConnected ? theme.palette.error.main : theme.palette.info.main, // Borde rojo si CONECTADO y es 'Cerrar Sesión Kommo', azul si 'Conectar Kommo'
                  color: kommoConnected ? theme.palette.error.main : theme.palette.info.main,     // Texto e ícono rojos si CONECTADO y es 'Cerrar Sesión Kommo', azul si 'Conectar Kommo'
                  '&:hover': {
                    borderColor: kommoConnected ? theme.palette.error.dark : theme.palette.info.dark,
                    color: kommoConnected ? theme.palette.error.dark : theme.palette.info.dark,
                    bgcolor: theme.palette.action.hover,
                  }
                }}
              >
                {kommoConnected ? 'Cerrar Sesión Kommo' : 'Conectar Kommo'}
              </Button>
              {/* Botón de Cerrar Sesión Google */}
              {status === 'succeeded' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<GoogleIcon />}
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  Cerrar Sesión Google
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        {/* BARRA PRINCIPAL "Vincular Kommo" - Mantiene el estilo oscuro con hover gris */}
        <Grid item xs={12}>
          {!kommoConnected ?
            (<Button
              variant="contained"
              onClick={() => setShowKommoModal(true)}
              sx={{
                width: '100%',
                minHeight: '150px',
                padding: '20px 30px',
                borderRadius: '12px',
                boxShadow: theme.shadows[8],
                mb: 3,
                bgcolor: 'rgba(30, 30, 30, 1)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textTransform: 'none',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: theme.shadows[10],
                  bgcolor: 'rgba(45, 45, 45, 1)',
                },
                '& .MuiButton-startIcon, & .MuiButton-endIcon': {
                  margin: 0,
                },
              }}
            >
              <LinkIcon sx={{
                fontSize: 40,
                mb: 0.5,
                color: 'grey.400' // Icono gris cuando está desconectado
              }} />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  mb: 0.5,
                  color: 'white'
                }}
              >
                Vincular Kommo
              </Typography>
              <Typography
                variant="h6"
                color="error.main" // Texto de estado rojo
              >
                Desconectado
              </Typography>
            </Button>) : (
              // Este es el botón para cerrar sesión de Kommo, ahora con estética VERDE cuando está conectado
              <Button
                variant="contained"
                onClick={logout} // Aquí se llama a la función 'logout'
                sx={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '20px 30px',
                  borderRadius: '12px',
                  boxShadow: theme.shadows[8],
                  mb: 3,
                  bgcolor: 'rgba(30, 30, 30, 1)', // Fondo oscuro
                  color: 'white', // Texto blanco
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textTransform: 'none',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.shadows[10],
                    bgcolor: 'rgba(45, 45, 45, 1)', // Hover a gris más claro
                  },
                  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
                    margin: 0,
                  },
                }}
              >
                <LinkIcon sx={{
                  fontSize: 40,
                  mb: 0.5,
                  color: 'success.main' // Icono VERDE cuando está conectado
                }} />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 'bold',
                    lineHeight: 1.2,
                    mb: 0.5,
                    color: 'white'
                  }}
                >
                  Cerrar Sesión Kommo
                </Typography>
                <Typography
                  variant="h6"
                  color="success.main" // Texto de estado VERDE
                >
                  Conectado (Haz clic para desconectar)
                </Typography>
              </Button>
            )}
        </Grid>

        {/* Tarjeta: Contactos Sincronizados - Aplicando el estilo oscuro con hover gris */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2, height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              // Fondos oscuros y efecto hover a gris
              bgcolor: 'rgba(30, 30, 30, 1)',
              color: 'white', // Texto blanco por defecto en toda la tarjeta
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
                cursor: 'pointer',
                bgcolor: 'rgba(45, 45, 45, 1)', // Hover a gris más claro
              },
            }}
            onClick={() => navigate('/contacts')}
          >
            <ContactsIcon sx={{ fontSize: 60, color: 'success.main' }} />
            <Typography variant="h6" align="center" sx={{ color: 'white' }}>Contactos Sincronizados</Typography>
            <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>{contacts.length}</Typography>
            <Typography variant="body2" align="center" sx={{ color: 'grey.400' }}>Total de contactos disponibles para sincronizar</Typography>
          </Paper>
        </Grid>

        {/* Tarjeta: Estado de Conexión Google - Aplicando el estilo oscuro con hover gris */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              // Fondos oscuros y efecto hover a gris
              bgcolor: 'rgba(30, 30, 30, 1)',
              color: 'white', // Texto blanco por defecto en toda la tarjeta
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
                cursor: 'pointer',
                bgcolor: 'rgba(45, 45, 45, 1)', // Hover a gris más claro
              },
            }}
          >
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <GoogleIcon sx={{ fontSize: 60, color: status === 'succeeded' ? 'success.main' : 'grey.400' }} />
                <Typography variant="h6" sx={{ color: 'white' }}>Estado de Conexión</Typography>
                <Typography variant="body1" color={status === 'succeeded' ? 'success.main' : 'error.main'}>
                  {status === 'succeeded' ? 'Conectado' : 'No Conectado'}
                </Typography>
                {status !== 'succeeded' && (
                  <Button variant="contained" startIcon={<GoogleIcon />} onClick={handleConnectGoogle}>
                    Conectar con Google
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tarjeta: Sincronización - Aplicando el estilo oscuro con hover gris */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              // Fondos oscuros y efecto hover a gris
              bgcolor: 'rgba(30, 30, 30, 1)',
              color: 'white', // Texto blanco por defecto en toda la tarjeta
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
                cursor: 'pointer',
                bgcolor: 'rgba(45, 45, 45, 1)', // Hover a gris más claro
              },
            }}
            onClick={() => navigate('/sync')}
          >
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <SyncIcon sx={{ fontSize: 60, color: status === 'succeeded' ? 'info.main' : 'grey.400' }} />
                <Typography variant="h6" sx={{ color: 'white' }}>Sincronización</Typography>
                <Button
                  variant="contained" color="primary" onClick={() => navigate('/sync')} startIcon={<SyncIcon />}
                  disabled={status !== 'succeeded'}
                  sx={{ '&.Mui-disabled': { bgcolor: 'rgba(0, 0, 0, 0.12)', color: 'rgba(0, 0, 0, 0.26)' } }}
                >
                  {status === 'succeeded' ? 'Ir a Sincronización' : 'Requiere Conexión con Google'}
                </Button>
                {status !== 'succeeded' && (
                  <Typography variant="body2" align="center" sx={{ color: 'grey.400' }}>
                    Conecta tu cuenta de Google para acceder a la sincronización
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación de cierre de sesión de Google */}
      <Dialog open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar cierre de sesión de Google</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas cerrar la sesión de Google?
            Esto desconectará tu cuenta de Google y no podrás acceder a tus contactos hasta que vuelvas a conectarte.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutConfirm(false)}>Cancelar</Button>
          <Button onClick={handleGoogleLogout} color="error" variant="contained">
            Cerrar Sesión de Google
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes de éxito */}
      <Snackbar open={showSuccessMessage} autoHideDuration={6000} onClose={() => setShowSuccessMessage(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setShowSuccessMessage(false)} severity="success" sx={{ width: '100%' }}>
          Operación realizada con éxito.
        </Alert>
      </Snackbar>

      {/* Snackbar para mensajes de error */}
      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Componente Modal para Kommo */}
      <KommoModal isOpen={showKommoModal} onClose={() => setShowKommoModal(false)} onSubmit={handleKommoSubmit} />
    </Box>
  );
}

export default Dashboard;