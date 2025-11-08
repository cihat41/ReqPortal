import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Card,
  CardContent,
  Stack,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
import SlaIndicator from '../components/SlaIndicator';

const statusColors = {
  Draft: 'default',
  Submitted: 'info',
  PendingApproval: 'warning',
  Approved: 'success',
  Rejected: 'error',
  Cancelled: 'default',
};

const statusLabels = {
  Draft: 'Taslak',
  Submitted: 'Gönderildi',
  PendingApproval: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Cancelled: 'İptal Edildi',
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Sadece kullanıcı yüklendiyse ve token varsa API çağrısı yap
    if (!authLoading && user && localStorage.getItem('token')) {
      fetchDashboardStats();
    }
  }, [authLoading, user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Dashboard verileri yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Stat kartları için veri
  const statCards = [
    {
      title: 'Toplam Talepler',
      value: stats?.requestStats?.total || 0,
      icon: DescriptionIcon,
      color: '#1976d2',
      bgColor: '#e3f2fd',
      onClick: () => navigate('/requests'),
    },
    {
      title: 'Bekleyen',
      value: stats?.requestStats?.pending || 0,
      icon: HourglassEmptyIcon,
      color: '#ed6c02',
      bgColor: '#fff3e0',
    },
    {
      title: 'Onaylanan',
      value: stats?.requestStats?.approved || 0,
      icon: CheckCircleIcon,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Onaylarım',
      value: stats?.approvalStats?.pending || 0,
      icon: AssignmentIcon,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
      onClick: () => navigate('/approvals'),
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Başlık ve Yeni Talep Butonu */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: { xs: 3, md: 4 }
      }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
            Hoş Geldiniz, {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Talep yönetim sisteminize genel bakış
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/requests/create')}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Yeni Talep
        </Button>
      </Box>

      {/* İstatistik Kartları - Mantis Style */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: card.onClick ? 'pointer' : 'default',
                borderRadius: 3,
                background: `linear-gradient(135deg, ${card.bgColor} 0%, ${card.bgColor}dd 100%)`,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': card.onClick
                  ? {
                      transform: 'translateY(-8px)',
                      boxShadow: `0px 12px 32px ${card.color}40`,
                    }
                  : {},
              }}
              onClick={card.onClick}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    sx={{
                      bgcolor: card.color,
                      width: 60,
                      height: 60,
                      boxShadow: `0px 4px 12px ${card.color}40`,
                    }}
                  >
                    <card.icon sx={{ color: 'white', fontSize: 30 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                      {card.title}
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color={card.color} sx={{ mt: 1 }}>
                      {card.value}
                    </Typography>
                  </Box>
                </Stack>
                {card.onClick && (
                  <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', color: card.color }}>
                    <TrendingUpIcon sx={{ fontSize: 18, mr: 0.5 }} />
                    <Typography variant="caption" fontWeight={600}>
                      Detayları Gör
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Son Talepler Tablosu - Mantis Style */}
      <Paper
        elevation={0}
        sx={{
          mt: { xs: 3, md: 4 },
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3
        }}>
          <Typography variant="h5" fontWeight={600} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Son Taleplerim
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/requests')}
            sx={{
              borderRadius: 2,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Tümünü Gör
          </Button>
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 500, sm: 650 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Başlık</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Kategori</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>SLA</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Tarih</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!stats?.recentRequests || stats.recentRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 4 }}>
                      <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">
                        Henüz talep bulunmamaktadır.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/requests/create')}
                        sx={{ mt: 2 }}
                      >
                        İlk Talebi Oluştur
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={() => navigate(`/requests/${request.id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {request.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {request.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[request.status] || request.status}
                        color={statusColors[request.status] || 'default'}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <SlaIndicator request={request} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(request.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Dashboard;

