import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Logout as LogoutIcon,
  AccountCircle,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  History as HistoryIcon,
  AccountTree as AccountTreeIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../NotificationBell';

const drawerWidth = 240;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Taleplerim', icon: <AssignmentIcon />, path: '/requests' },
    { text: 'Onaylarım', icon: <CheckCircleIcon />, path: '/approvals' },
  ];

  const adminMenuItems = [
    { text: 'Form Şablonları', icon: <DescriptionIcon />, path: '/admin/form-templates' },
    { text: 'Onay Akışları', icon: <AccountTreeIcon />, path: '/admin/workflows' },
    { text: 'Kullanıcılar', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Raporlar', icon: <AssessmentIcon />, path: '/admin/reports' },
    { text: 'Email Şablonları', icon: <EmailIcon />, path: '/admin/email-templates' },
    { text: 'Email Ayarları', icon: <SettingsIcon />, path: '/admin/email-settings' },
    { text: 'Audit Logları', icon: <HistoryIcon />, path: '/admin/audit-logs' },
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo ve Başlık - Mantis Style */}
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ color: 'white', mb: 0.5 }}>
          Talep Sistemi
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Yönetim Paneli
        </Typography>
      </Box>

      {/* Kullanıcı Bilgisi - Mantis Style */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              width: 44,
              height: 44,
              fontWeight: 600,
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ color: 'white' }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {user?.email}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Menü Öğeleri - Mantis Style */}
      <List sx={{ flex: 1, pt: 2, px: 1 }}>
        {menuItems.map((item) => {
          const isActive = isActivePath(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  color: 'white',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.25)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'white',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        {/* Admin Menüsü */}
        {user?.roles?.includes('Admin') && (
          <>
            <ListItem disablePadding sx={{ mb: 0.5, mt: 2 }}>
              <ListItemButton
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Yönetim"
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                />
                {adminMenuOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            {adminMenuOpen && adminMenuItems.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5, pl: 2 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setMobileOpen(false);
                    }}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      color: 'white',
                      '&.Mui-selected': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.25)',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'white',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </>
        )}
      </List>

      {/* Çıkış Butonu - Mantis Style */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Çıkış Yap"
            primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find((item) => isActivePath(item.path))?.text ||
             adminMenuItems.find((item) => isActivePath(item.path))?.text ||
             'Dashboard'}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Yeni Talep Butonu */}
            {!isMobile && (
              <IconButton
                color="primary"
                onClick={() => navigate('/requests/create')}
                sx={{
                  bgcolor: 'primary.lighter',
                  '&:hover': { bgcolor: 'primary.light', color: 'white' },
                }}
              >
                <AddIcon />
              </IconButton>
            )}

            {/* Bildirimler */}
            <NotificationBell />

            {/* Kullanıcı Menüsü */}
            {!isMobile && (
              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                }
                label={`${user?.firstName} ${user?.lastName}`}
                onClick={handleMenuOpen}
                sx={{ cursor: 'pointer', fontWeight: 500 }}
              />
            )}
            {isMobile && (
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            )}

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <MenuItem onClick={handleLogout} sx={{ mt: 1 }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography color="error.main">Çıkış Yap</Typography>
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;

