import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Save as SaveIcon, Send as SendIcon } from '@mui/icons-material';
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

const CreateRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    estimatedCost: '',
    justification: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      setLoading(true);
      setError('');

      const requestData = {
        ...formData,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        status: isDraft ? 'Draft' : 'Submitted',
      };

      await requestsAPI.create(requestData);
      navigate('/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Talep oluşturulurken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.title && formData.description && formData.category;

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Başlık */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600} sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          Yeni Talep Oluştur
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lütfen talep bilgilerinizi eksiksiz doldurun
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
                onClick={() => navigate('/requests')}
                disabled={loading}
                sx={{
                  minWidth: { xs: '100%', sm: 120 },
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                İptal
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<SaveIcon />}
                onClick={() => handleSubmit(true)}
                disabled={loading || !formData.title}
                sx={{
                  minWidth: { xs: '100%', sm: 200 },
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                Taslak Olarak Kaydet
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={() => handleSubmit(false)}
                disabled={loading || !isValid}
                sx={{
                  minWidth: { xs: '100%', sm: 120 },
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                Gönder
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CreateRequest;

