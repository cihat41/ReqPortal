import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Chip,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import api from '../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityName: '',
    action: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.entityName) params.append('entityName', filters.entityName);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/auditlogs?${params.toString()}`);
      // Backend paginated response dönüyor: { data: [...], totalCount: ... }
      setLogs(response.data.data || []);
    } catch (error) {
      console.error('Loglar yüklenemedi:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const actionColors = {
    Create: 'success',
    Update: 'info',
    Delete: 'error',
    Approve: 'success',
    Reject: 'error',
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Yükleniyor...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Sistem Logları
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Varlık Tipi"
                value={filters.entityName}
                onChange={(e) => setFilters({ ...filters, entityName: e.target.value })}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="Request">Talep</MenuItem>
                <MenuItem value="Approval">Onay</MenuItem>
                <MenuItem value="User">Kullanıcı</MenuItem>
                <MenuItem value="FormTemplate">Form Şablonu</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="İşlem"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="Create">Oluşturma</MenuItem>
                <MenuItem value="Update">Güncelleme</MenuItem>
                <MenuItem value="Delete">Silme</MenuItem>
                <MenuItem value="Approve">Onaylama</MenuItem>
                <MenuItem value="Reject">Reddetme</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Başlangıç Tarihi"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Bitiş Tarihi"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Tarih/Saat</TableCell>
              <TableCell>Kullanıcı</TableCell>
              <TableCell>Varlık</TableCell>
              <TableCell>İşlem</TableCell>
              <TableCell>Detaylar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.createdAt).toLocaleString('tr-TR')}
                </TableCell>
                <TableCell>
                  {log.user ? `${log.user.firstName} ${log.user.lastName}` : '-'}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {log.entityName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {log.entityId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.action}
                    color={actionColors[log.action] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {log.changes && (
                    <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap' }}>
                      {log.changes}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {logs.length === 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Kayıt bulunamadı
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

