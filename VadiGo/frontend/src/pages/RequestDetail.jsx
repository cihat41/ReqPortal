import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { requestsAPI } from '../services/api';
import RequestAttachments from '../components/RequestAttachments';
import RequestComments from '../components/RequestComments';
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

const priorityLabels = {
  Low: 'Düşük',
  Medium: 'Orta',
  High: 'Yüksek',
  Critical: 'Kritik',
};

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await requestsAPI.getById(id);
      setRequest(response.data);
    } catch (err) {
      setError('Talep yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await requestsAPI.delete(id);
      navigate('/requests');
    } catch (err) {
      setError('Talep silinirken bir hata oluştu.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !request) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Talep bulunamadı.'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/requests')}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/requests')}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Geri Dön
        </Button>
        {request.status === 'Draft' && (
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
          }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/requests/${id}/edit`)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Düzenle
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Sil
            </Button>
          </Box>
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          gap: 2,
          mb: 2
        }}>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {request.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={statusLabels[request.status] || request.status}
              color={statusColors[request.status] || 'default'}
            />
            <SlaIndicator request={request} />
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Kategori
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                {request.category}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Öncelik
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                {priorityLabels[request.priority] || request.priority}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Oluşturma Tarihi
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                {new Date(request.createdAt).toLocaleString('tr-TR')}
              </Typography>
            </Box>
          </Grid>

          {request.updatedAt && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Son Güncelleme
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                  {new Date(request.updatedAt).toLocaleString('tr-TR')}
                </Typography>
              </Box>
            </Grid>
          )}

          {request.estimatedCost && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, bgcolor: '#f0f7ff', borderRadius: 2, border: '1px solid #bbdefb' }}>
                <Typography variant="caption" color="primary.dark" fontWeight={600}>
                  Tahmini Maliyet
                </Typography>
                <Typography variant="body1" fontWeight={600} color="primary.main" sx={{ mt: 0.5 }}>
                  {request.estimatedCost.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 3, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                📝 Açıklama
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                {request.description}
              </Typography>
            </Box>
          </Grid>

          {request.justification && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 3, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe082' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom color="warning.dark">
                  💡 Gerekçe
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                  {request.justification}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <RequestAttachments
          requestId={request.id}
          canUpload={request.status === 'Draft' || request.status === 'Submitted'}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <RequestComments requestId={request.id} />
      </Box>

      {request.approvals && request.approvals.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Onay Geçmişi
          </Typography>
          {request.approvals.map((approval, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {approval.approverName}
                  </Typography>
                  <Chip
                    label={approval.status}
                    color={approval.status === 'Approved' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                {approval.comments && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {approval.comments}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {new Date(approval.approvedAt).toLocaleString('tr-TR')}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}
    </Container>
  );
};

export default RequestDetail;

