import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Send as SendIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { requestsAPI } from '../services/api';

const categories = [
  'İzin Talebi',
  'Satın Alma',
  'IT Destek',
  'İnsan Kaynakları',
  'Finans',
  'Diğer',
];

const priorities = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Medium', label: 'Orta' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Critical', label: 'Kritik' },
];

const EditRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    estimatedCost: '',
    justification: '',
  });

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await requestsAPI.getById(id);
      const request = response.data;
      
      setFormData({
        title: request.title || '',
        description: request.description || '',
        category: request.category || '',
        priority: request.priority || 'Medium',
        estimatedCost: request.estimatedCost || '',
        justification: request.justification || '',
      });
    } catch (err) {
      setError('Talep yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      setSaving(true);
      setError('');

      const requestData = {
        title: formData.title,
        description: formData.description,
        type: formData.category,
        category: formData.category,
        priority: formData.priority,
        justification: formData.justification,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
      };

      await requestsAPI.update(id, requestData);
      navigate(`/requests/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Talep güncellenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const isValid = formData.title && formData.description && formData.category;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Başlık */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/requests/${id}`)}
          sx={{ mb: 2 }}
        >
          Geri Dön
        </Button>
        <Typography variant="h4" gutterBottom fontWeight={600} sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          Talebi Düzenle
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Talep bilgilerinizi güncelleyin
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={3}>
          {/* Başlık */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              Talep Başlığı *
            </Typography>
            <TextField
              fullWidth
              required
              placeholder="Örn: Yeni bilgisayar talebi"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid>

          {/* Kategori ve Öncelik */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              Kategori *
            </Typography>
            <TextField
              fullWidth
              required
              select
              placeholder="Kategori seçin"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              Öncelik
            </Typography>
            <TextField
              fullWidth
              select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.value} value={priority.value}>
                  {priority.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Açıklama */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              Açıklama *
            </Typography>
            <TextField
              fullWidth
              required
              multiline
              rows={5}
              placeholder="Talep detaylarını açıklayın..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid>

          {/* Gerekçe */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              Gerekçe
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Talebin gerekçesini açıklayın..."
              value={formData.justification}
              onChange={(e) => handleChange('justification', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid>

          {/* Tahmini Maliyet */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              Tahmini Maliyet (₺)
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="0.00"
              value={formData.estimatedCost}
              onChange={(e) => handleChange('estimatedCost', e.target.value)}
              slotProps={{
                htmlInput: { min: 0, step: 0.01 }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid>

          {/* Butonlar */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'flex-end',
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate(`/requests/${id}`)}
                disabled={saving}
                sx={{
                  minWidth: { xs: '100%', sm: 120 },
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                İptal
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={() => handleSubmit(false)}
                disabled={saving || !isValid}
                sx={{
                  minWidth: { xs: '100%', sm: 120 },
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                Kaydet
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default EditRequest;

