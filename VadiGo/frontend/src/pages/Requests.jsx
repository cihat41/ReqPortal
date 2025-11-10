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
  Collapse,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { requestsAPI, formTemplatesAPI } from '../services/api';

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [formTemplates, setFormTemplates] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    priority: '',
    category: '',
    formTemplateId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  useEffect(() => {
    fetchFormTemplates();
  }, []);

  const fetchFormTemplates = async () => {
    try {
      const response = await formTemplatesAPI.getAll();
      setFormTemplates(response.data);
    } catch (err) {
      console.error('Form templates yüklenirken hata:', err);
    }
  };

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

  const handleClearFilters = () => {
    setFilters({
      status: '',
      search: '',
      priority: '',
      category: '',
      formTemplateId: '',
      startDate: '',
      endDate: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            Filtreler
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {hasActiveFilters && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Temizle
              </Button>
            )}
            <Button
              size="small"
              startIcon={<FilterIcon />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Basit Filtre' : 'Gelişmiş Filtre'}
            </Button>
          </Box>
        </Box>

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

        <Collapse in={showAdvancedFilters}>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Öncelik"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="Low">Düşük</MenuItem>
                <MenuItem value="Medium">Orta</MenuItem>
                <MenuItem value="High">Yüksek</MenuItem>
                <MenuItem value="Critical">Kritik</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kategori"
                placeholder="Kategori ara..."
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={formTemplates}
                getOptionLabel={(option) => option.name || ''}
                value={formTemplates.find(ft => ft.id === filters.formTemplateId) || null}
                onChange={(e, newValue) => handleFilterChange('formTemplateId', newValue?.id || '')}
                renderInput={(params) => (
                  <TextField {...params} label="Form Şablonu" placeholder="Form şablonu seçin..." />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Başlangıç Tarihi"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Bitiş Tarihi"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Collapse>
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

