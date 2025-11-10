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
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { requestsAPI, formTemplatesAPI } from '../services/api';
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

// Helper function to format field values
const formatFieldValue = (field, value, attachments = []) => {
  if (!value && value !== 0 && value !== false) return '-';

  switch (field.fieldType) {
    case 'currency':
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
      }).format(value);

    case 'date':
      return new Date(value).toLocaleDateString('tr-TR');

    case 'datetime':
      return new Date(value).toLocaleString('tr-TR');

    case 'checkbox':
      return Array.isArray(value) ? value.join(', ') : value;

    case 'number':
      return new Intl.NumberFormat('tr-TR').format(value);

    case 'file':
      // Find matching attachment by filename
      const attachment = attachments.find(att => att.fileName === value);
      if (attachment) {
        const handleDownload = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/attachments/download/${attachment.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (!response.ok) {
              throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } catch (error) {
            console.error('Download error:', error);
            alert('Dosya indirilemedi');
          }
        };

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachFileIcon fontSize="small" color="primary" />
            <Button
              variant="text"
              size="small"
              onClick={handleDownload}
              sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
            >
              {value}
            </Button>
          </Box>
        );
      }
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachFileIcon fontSize="small" />
          <Typography variant="body2">{value}</Typography>
        </Box>
      );

    default:
      return value.toString();
  }
};

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formTemplate, setFormTemplate] = useState(null);
  const [formData, setFormData] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await requestsAPI.getById(id);
      const requestData = response.data;
      setRequest(requestData);

      // Parse FormData if exists
      if (requestData.formData) {
        try {
          setFormData(JSON.parse(requestData.formData));
        } catch (err) {
          console.error('FormData parse hatası:', err);
        }
      }

      // Fetch form template if exists
      if (requestData.formTemplateId) {
        try {
          const templateResponse = await formTemplatesAPI.getById(requestData.formTemplateId);
          setFormTemplate(templateResponse.data);
        } catch (err) {
          console.error('Form şablonu yüklenirken hata:', err);
        }
      }
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

          {/* Form Template Data */}
          {formTemplate && formData && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 3, bgcolor: '#f3e5f5', borderRadius: 2, border: '1px solid #ce93d8' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom color="purple.dark">
                  📋 {formTemplate.name}
                </Typography>
                <Table size="small">
                  <TableBody>
                    {formTemplate.fields
                      ?.sort((a, b) => a.order - b.order)
                      .map((field) => {
                        const value = formData[field.name];
                        if (!value && value !== 0 && value !== false) return null;

                        return (
                          <TableRow key={field.id}>
                            <TableCell sx={{ fontWeight: 600, width: '30%', borderBottom: '1px solid #e0e0e0' }}>
                              {field.label}
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                              {formatFieldValue(field, value, request?.attachments || [])}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
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

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: '#f8fafc',
          }}
        >
          <Tab label="Yorumlar" />
          <Tab label="Onay Akışı" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <RequestComments requestId={request.id} />
          )}

          {tabValue === 1 && (
            <Box>
              {request.approvals && request.approvals.length > 0 ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Onay Akışı Detayları
                  </Typography>

                  {request.workflowName && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <strong>Workflow:</strong> {request.workflowName}
                    </Alert>
                  )}

                  <Stepper orientation="vertical">
                    {request.approvals.map((approval, index) => {
                      const isApproved = approval.status === 'Approved';
                      const isRejected = approval.status === 'Rejected';
                      const isPending = approval.status === 'Pending';

                      return (
                        <Step key={index} active={true} completed={isApproved}>
                          <StepLabel
                            StepIconComponent={() => (
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: isApproved
                                    ? 'success.main'
                                    : isRejected
                                    ? 'error.main'
                                    : 'grey.300',
                                  color: 'white',
                                }}
                              >
                                {isApproved ? (
                                  <CheckCircleIcon />
                                ) : isRejected ? (
                                  <CancelIcon />
                                ) : (
                                  <HourglassEmptyIcon />
                                )}
                              </Box>
                            )}
                          >
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                Level {approval.level} - {approval.approverName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {approval.approverEmail}
                              </Typography>
                            </Box>
                          </StepLabel>
                          <StepContent>
                            <Card variant="outlined" sx={{ mt: 1, mb: 2 }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Chip
                                    label={
                                      isApproved
                                        ? 'Onaylandı'
                                        : isRejected
                                        ? 'Reddedildi'
                                        : 'Bekliyor'
                                    }
                                    color={
                                      isApproved
                                        ? 'success'
                                        : isRejected
                                        ? 'error'
                                        : 'warning'
                                    }
                                    size="small"
                                  />
                                  {approval.approvedAt && (
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(approval.approvedAt).toLocaleString('tr-TR')}
                                    </Typography>
                                  )}
                                </Box>
                                {approval.comments && (
                                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                      Yorum:
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                      {approval.comments}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </StepContent>
                        </Step>
                      );
                    })}
                  </Stepper>
                </>
              ) : (
                <Alert severity="info">
                  Bu talep için henüz onay akışı başlatılmamış.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default RequestDetail;

