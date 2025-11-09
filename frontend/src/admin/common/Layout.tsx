import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Settings,
  ExitToApp,
  MonitorHeart,
  Assessment,
  Notifications,
} from '@mui/icons-material';

const drawerWidth = 260;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user: authUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const user = authUser || { name: 'Admin', email: 'admin@example.com' };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems: MenuItem[] = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Services', icon: <MonitorHeart />, path: '/admin/services' },
    { text: 'Analytics', icon: <Assessment />, path: '/admin/analytics' },
    { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
  ];

  const drawer = (
    <div>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 48, height: 48 }}>
          SC
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Senior Connect
          </Typography>
          <Typography variant="caption">Admin Portal</Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ mt: 2 }} />
      <List>
        <ListItem disablePadding sx={{ px: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: 'error.main',
            }}
          >
            <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text ||
              'Admin Portal'}
          </Typography>

          <IconButton color="inherit" sx={{ mr: 2 }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user.name?.charAt(0) || user.email?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2">{user.name || 'Admin'}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {user.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => navigate('/settings')}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
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
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
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
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;