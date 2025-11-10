import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Checkbox,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Undo as ReturnIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from '@mui/icons-material';
import { approvalsAPI } from '../services/api';

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

const Approvals = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApprovals, setSelectedApprovals] = useState([]);
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: '',
    approvalId: null,
    approvalIds: [],
    requestTitle: '',
    isBulk: false,
  });
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError('');
      const [pendingRes, historyRes] = await Promise.all([
        approvalsAPI.getPending(),
        approvalsAPI.getHistory(),
      ]);
      setPendingApprovals(pendingRes.data);
      setApprovalHistory(historyRes.data);
    } catch (err) {
      setError('Onaylar yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApproval = (approvalId) => {
    setSelectedApprovals(prev =>
      prev.includes(approvalId)
        ? prev.filter(id => id !== approvalId)
        : [...prev, approvalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApprovals.length === pendingApprovals.length) {
      setSelectedApprovals([]);
    } else {
      setSelectedApprovals(pendingApprovals.map(a => a.id));
    }
  };

  const handleOpenDialog = (type, approvalId, requestTitle) => {
    setActionDialog({ open: true, type, approvalId, approvalIds: [], requestTitle, isBulk: false });
    setComments('');
  };

  const handleOpenBulkDialog = (type) => {
    if (selectedApprovals.length === 0) {
      setError('Lütfen en az bir onay seçin.');
      return;
    }
    setActionDialog({
      open: true,
      type,
      approvalId: null,
      approvalIds: selectedApprovals,
      requestTitle: `${selectedApprovals.length} talep`,
      isBulk: true
    });
    setComments('');
  };

  const handleCloseDialog = () => {
    setActionDialog({ open: false, type: '', approvalId: null, approvalIds: [], requestTitle: '', isBulk: false });
    setComments('');
  };

  const handleAction = async () => {
    try {
      setActionLoading(true);
      const { type, approvalId, approvalIds, isBulk } = actionDialog;
      const data = { comments };

      if (isBulk) {
        // Bulk operation
        const promises = approvalIds.map(id => {
          if (type === 'approve') {
            return approvalsAPI.approve(id, data);
          } else if (type === 'reject') {
            return approvalsAPI.reject(id, data);
          } else if (type === 'return') {
            return approvalsAPI.return(id, data);
          }
          return Promise.resolve();
        });
        await Promise.all(promises);
        setSelectedApprovals([]);
      } else {
        // Single operation
        if (type === 'approve') {
          await approvalsAPI.approve(approvalId, data);
        } else if (type === 'reject') {
          await approvalsAPI.reject(approvalId, data);
        } else if (type === 'return') {
          await approvalsAPI.return(approvalId, data);
        }
      }

      handleCloseDialog();
      fetchApprovals();
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getActionTitle = () => {
    switch (actionDialog.type) {
      case 'approve':
        return 'Talebi Onayla';
      case 'reject':
        return 'Talebi Reddet';
      case 'return':
        return 'Talebi İade Et';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
        Onaylarım
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Bekleyen (${pendingApprovals.length})`} />
          <Tab label="Geçmiş" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Box>
          {pendingApprovals.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={selectedApprovals.length === pendingApprovals.length ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
                onClick={handleSelectAll}
              >
                {selectedApprovals.length === pendingApprovals.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
              </Button>
              {selectedApprovals.length > 0 && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleOpenBulkDialog('approve')}
                  >
                    Toplu Onayla ({selectedApprovals.length})
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => handleOpenBulkDialog('reject')}
                  >
                    Toplu Reddet ({selectedApprovals.length})
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="warning"
                    startIcon={<ReturnIcon />}
                    onClick={() => handleOpenBulkDialog('return')}
                  >
                    Toplu İade ({selectedApprovals.length})
                  </Button>
                </>
              )}
            </Box>
          )}

          {pendingApprovals.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography color="text.secondary">
                Bekleyen onay bulunmamaktadır.
              </Typography>
            </Paper>
          ) : (
            pendingApprovals.map((approval) => (
              <Card
                key={approval.id}
                elevation={0}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0px 8px 24px rgba(94, 53, 177, 0.15)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                      <Checkbox
                        checked={selectedApprovals.includes(approval.id)}
                        onChange={() => handleSelectApproval(approval.id)}
                        sx={{ mt: -1, mr: 1 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {approval.request.title}
                        </Typography>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <Typography variant="caption" color="text.secondary">
                            Talep Eden
                          </Typography>
                          <Typography variant="body2">
                            {approval.request.requesterName}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <Typography variant="caption" color="text.secondary">
                            Departman
                          </Typography>
                          <Typography variant="body2">
                            {approval.request.requesterDepartment}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <Typography variant="caption" color="text.secondary">
                            Kategori
                          </Typography>
                          <Typography variant="body2">
                            {approval.request.category}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <Typography variant="caption" color="text.secondary">
                            Öncelik
                          </Typography>
                          <Typography variant="body2">
                            {priorityLabels[approval.request.priority]}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        {approval.request.description}
                      </Typography>
                      {approval.request.estimatedCost && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Tahmini Maliyet:</strong>{' '}
                          {approval.request.estimatedCost.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </Typography>
                      )}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    justifyContent: 'flex-end',
                    mt: 2
                  }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/requests/${approval.requestId}`)}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Detayları Gör
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      startIcon={<ReturnIcon />}
                      onClick={() => handleOpenDialog('return', approval.id, approval.request.title)}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      İade Et
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<RejectIcon />}
                      onClick={() => handleOpenDialog('reject', approval.id, approval.request.title)}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Reddet
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<ApproveIcon />}
                      onClick={() => handleOpenDialog('approve', approval.id, approval.request.title)}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Onayla
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {tabValue === 1 && (
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
                <TableCell sx={{ minWidth: 150, fontWeight: 600 }}>Talep Başlığı</TableCell>
                <TableCell sx={{ minWidth: 120, fontWeight: 600 }}>Kategori</TableCell>
                <TableCell sx={{ minWidth: 100, fontWeight: 600 }}>Karar</TableCell>
                <TableCell sx={{ minWidth: 150, fontWeight: 600 }}>Yorumlar</TableCell>
                <TableCell sx={{ minWidth: 100, fontWeight: 600 }}>Tarih</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {approvalHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      Onay geçmişi bulunmamaktadır.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                approvalHistory.map((approval) => (
                  <TableRow key={approval.id} hover>
                    <TableCell>{approval.request.title}</TableCell>
                    <TableCell>{approval.request.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={approval.status}
                        color={approval.status === 'Approved' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{approval.comments || '-'}</TableCell>
                    <TableCell>
                      {new Date(approval.approvedAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={actionDialog.open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{getActionTitle()}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>{actionDialog.requestTitle}</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Yorumlar"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Kararınız hakkında yorum ekleyin (opsiyonel)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={actionLoading}>
            İptal
          </Button>
          <Button
            onClick={handleAction}
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            Onayla
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Approvals;

