import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { requestsAPI } from '../services/api';

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

const Requests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await requestsAPI.getAll(filters);
      setRequests(response.data);
    } catch (err) {
      setError('Talepler yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await requestsAPI.delete(id);
      fetchRequests();
    } catch (err) {
      setError('Talep silinirken bir hata oluştu.');
      console.error(err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3
      }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          Taleplerim
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/requests/create')}
          sx={{
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Yeni Talep
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Ara"
              placeholder="Başlık veya açıklama ara..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Durum"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="Draft">Taslak</MenuItem>
              <MenuItem value="Submitted">Gönderildi</MenuItem>
              <MenuItem value="PendingApproval">Onay Bekliyor</MenuItem>
              <MenuItem value="Approved">Onaylandı</MenuItem>
              <MenuItem value="Rejected">Reddedildi</MenuItem>
              <MenuItem value="Cancelled">İptal Edildi</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          overflowX: 'auto',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Table sx={{ minWidth: { xs: 650, sm: 750 } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ minWidth: 150, fontWeight: 600 }}>Başlık</TableCell>
              <TableCell sx={{ minWidth: 120, fontWeight: 600 }}>Kategori</TableCell>
              <TableCell sx={{ minWidth: 120, fontWeight: 600 }}>Durum</TableCell>
              <TableCell sx={{ minWidth: 130, fontWeight: 600 }}>Oluşturma Tarihi</TableCell>
              <TableCell align="right" sx={{ minWidth: 120, fontWeight: 600 }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Henüz talep bulunmamaktadır.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>{request.title}</TableCell>
                  <TableCell>{request.category}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[request.status] || request.status}
                      color={statusColors[request.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/requests/${request.id}`)}
                      title="Görüntüle"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {request.status === 'Draft' && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/requests/${request.id}/edit`)}
                          title="Düzenle"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(request.id)}
                          title="Sil"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Requests;

