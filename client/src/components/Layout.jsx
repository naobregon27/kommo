import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Contacts as ContactsIcon,
  Sync as SyncIcon,
  LockOutlined as LockIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', requiresAuth: false },
  { text: 'Contactos', icon: <ContactsIcon />, path: '/contacts', requiresAuth: true },
  { text: 'Sincronización', icon: <SyncIcon />, path: '/sync', requiresAuth: true },
];

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useSelector((state) => state.contacts);
  const isAuthenticated = status === 'succeeded';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path, requiresAuth) => {
    if (!requiresAuth || (requiresAuth && isAuthenticated)) {
      navigate(path);
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, #5c33f6 0%, #1a000d 100%)',
        color: '#e0e0ff',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 2,
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: 2 }}>
          Kommo Bot
        </Typography>
      </Toolbar>
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isDisabled = item.requiresAuth && !isAuthenticated;
          const menuItem = (
            <ListItemButton
              key={item.text}
              onClick={() => handleMenuClick(item.path, item.requiresAuth)}
              selected={location.pathname === item.path}
              disabled={isDisabled}
              sx={{
                mb: 1,
                borderRadius: 1,
                mx: 1,
                transition: 'background-color 0.3s, transform 0.2s ease',
                transform: 'translateY(0)',
                opacity: isDisabled ? 0.5 : 1,
                '&.Mui-selected': {
                  backgroundColor: '#7b59f9',
                  color: '#fff',
                  transform: 'translateY(-3px)',
                  '& .MuiListItemIcon-root': {
                    color: '#fff',
                  },
                },
                '&:hover': {
                  backgroundColor: isDisabled ? 'transparent' : '#7b59f9cc',
                  color: '#fff',
                  transform: isDisabled ? 'none' : 'translateY(-3px)',
                  '& .MuiListItemIcon-root': {
                    color: isDisabled ? '#cfcfff' : '#fff',
                  },
                },
                '&.Mui-disabled': {
                  opacity: 0.5,
                }
              }}
            >
              <ListItemIcon
                sx={{ 
                  color: location.pathname === item.path && !isDisabled ? '#fff' : '#cfcfff',
                  opacity: isDisabled ? 0.5 : 1
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {isDisabled && (
                <LockIcon 
                  sx={{ 
                    fontSize: 16, 
                    ml: 1, 
                    opacity: 0.7,
                    color: '#cfcfff' 
                  }} 
                />
              )}
            </ListItemButton>
          );

          return isDisabled ? (
            <Tooltip 
              key={item.text}
              title="Requiere conexión con Google" 
              placement="right"
            >
              <Box>{menuItem}</Box>
            </Tooltip>
          ) : (
            menuItem
          );
        })}
      </List>
      <Box sx={{ p: 2, textAlign: 'center', fontSize: '0.85rem', opacity: 0.6 }}>
        © 2025 Kommo Bot
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #5c33f6 0%, #000000 100%)',
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#3b27a3',
          boxShadow: '0 2px 8px rgba(0,0,0,0.7)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ letterSpacing: 1.2 }}>
            Kommo Bot
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navegación principal"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          color: '#e0e0ff',
          background: 'linear-gradient(135deg, #5c33f6 0%, #000000 100%)',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
