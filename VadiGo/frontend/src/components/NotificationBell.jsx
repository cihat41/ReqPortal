import { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Cancel,
  Info,
  Warning,
  Delete,
  DoneAll,
} from '@mui/icons-material';
import { notificationsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotificationBell = () => {
  const { user, loading: authLoading } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Bildirim sayısı alınamadı:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll({ pageSize: 10 });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
    }
  };

  useEffect(() => {
    // Sadece kullanıcı yüklendiyse ve token varsa API çağrısı yap
    if (!authLoading && user && localStorage.getItem('token')) {
      fetchUnreadCount();
      // Her 30 saniyede bir bildirim sayısını güncelle
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [authLoading, user]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    // Bildirimi okundu olarak işaretle
    if (!notification.isRead) {
      try {
        await notificationsAPI.markAsRead(notification.id);
        fetchUnreadCount();
        fetchNotifications();
      } catch (error) {
        console.error('Bildirim işaretlenemedi:', error);
      }
    }

    // İlgili sayfaya yönlendir
    if (notification.relatedRequestId) {
      navigate(`/requests/${notification.relatedRequestId}`);
      handleClose();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Bildirimler işaretlenemedi:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Tüm bildirimleri silmek istediğinizden emin misiniz?')) {
      try {
        await notificationsAPI.clearAll();
        fetchUnreadCount();
        fetchNotifications();
      } catch (error) {
        console.error('Bildirimler silinemedi:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'RequestApproved':
        return <CheckCircle color="success" />;
      case 'RequestRejected':
        return <Cancel color="error" />;
      case 'ApprovalPending':
        return <Warning color="warning" />;
      case 'SlaViolation':
        return <Warning color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Bildirimler</Typography>
          <Box>
            <IconButton size="small" onClick={handleMarkAllRead} title="Tümünü okundu işaretle">
              <DoneAll fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleClearAll} title="Tümünü temizle">
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Bildirim yok</Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                borderLeft: notification.isRead ? 'none' : '4px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(notification.createdAt)}
                    </Typography>
                  </>
                }
                primaryTypographyProps={{
                  fontWeight: notification.isRead ? 'normal' : 'bold',
                }}
              />
            </MenuItem>
          ))
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button size="small" onClick={() => { navigate('/notifications'); handleClose(); }}>
                Tümünü Görüntüle
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;

