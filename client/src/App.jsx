import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store';
import { fetchContacts } from './store/slices/contactsSlice';

import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Contacts from './pages/Contacts.jsx';
import Sync from './pages/Sync.jsx';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8c7bff',  // violeta claro
      light: '#a79fff',
      dark: '#6a4bcd',
      contrastText: '#fff',
    },
    secondary: {
      main: '#6a4bcd',  // violeta oscuro
      light: '#8c7bff',
      dark: '#4b369e',
      contrastText: '#fff',
    },
    background: {
      default: 'transparent',  // para usar fondo CSS externo
      paper: '#1a1a1a',        // fondo de tarjetas y superficies
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#aaaaff',
    },
    success: { main: '#4CAF50' },
    error: { main: '#D32F2F' },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: { fontSize: '2.8rem', fontWeight: 700, color: '#e0e0e0' },
    h2: { fontSize: '2rem', fontWeight: 600, color: '#ccc' },
    h3: { fontSize: '1.75rem', fontWeight: 500, color: '#bbb' },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background-color: transparent;
        }
      `,
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: '8px',
          transition: 'all 0.3s ease-in-out',
        },
        containedPrimary: {
          boxShadow: '0 4px 10px rgba(140,123,255,0.3)',
          '&:hover': {
            boxShadow: '0 6px 15px rgba(140,123,255,0.5)',
            transform: 'translateY(-2px)',
          },
        },
        outlinedPrimary: {
          '&:hover': {
            backgroundColor: 'rgba(140,123,255,0.1)',
            borderColor: '#8c7bff',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          backgroundColor: '#2c2c54',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: '4px 0 10px rgba(0,0,0,0.4)',
          backgroundColor: '#222244',
        },
      },
    },
  },
});

function AuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authStatus = params.get('auth');
    
    if (authStatus) {
      window.history.replaceState({}, document.title, window.location.pathname);
      if (authStatus === 'success') {
        store.dispatch(fetchContacts());
      }
      navigate('/');
    }
  }, [location, navigate]);

  return null;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/sync" element={<Sync />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthHandler />
          <Layout>
            <AppContent />
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
