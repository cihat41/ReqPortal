import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [stats, setStats] = useState(null);
  const [slaCompliance, setSlaCompliance] = useState(null);
  const [topRequesters, setTopRequesters] = useState([]);
  const [approvalPerformance, setApprovalPerformance] = useState([]);
  const [requestsOverTime, setRequestsOverTime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // Tarihleri UTC ISO 8601 formatına çevir
      const startDateUTC = new Date(dateRange.startDate + 'T00:00:00Z').toISOString();
      const endDateUTC = new Date(dateRange.endDate + 'T23:59:59Z').toISOString();

      const params = new URLSearchParams({
        startDate: startDateUTC,
        endDate: endDateUTC,
      });

      const [statsRes, slaRes, requestersRes, performanceRes, timeSeriesRes] = await Promise.all([
        api.get(`/reports/dashboard-stats?${params}`),
        api.get(`/reports/sla-compliance?${params}`),
        api.get(`/reports/top-requesters?${params}`),
        api.get(`/reports/approval-performance?${params}`),
        api.get(`/reports/requests-over-time?${params}&groupBy=day`),
      ]);

      setStats(statsRes.data);
      setSlaCompliance(slaRes.data);
      setTopRequesters(requestersRes.data);
      setApprovalPerformance(performanceRes.data);
      setRequestsOverTime(timeSeriesRes.data);
    } catch (error) {
      console.error('Raporlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      // Tarihleri UTC ISO 8601 formatına çevir
      const startDateUTC = new Date(dateRange.startDate + 'T00:00:00Z').toISOString();
      const endDateUTC = new Date(dateRange.endDate + 'T23:59:59Z').toISOString();

      const params = new URLSearchParams({
        startDate: startDateUTC,
        endDate: endDateUTC,
      });

      const response = await api.get(`/reports/export/${format}?${params}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Talepler_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export başarısız:', error);
      alert('Export başarısız');
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Yükleniyor...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Raporlar ve Analizler
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('excel')}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('pdf')}
          >
            PDF
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Başlangıç Tarihi"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Bitiş Tarihi"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {stats && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon color="primary" />
                    <Typography variant="h6">Toplam Talep</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mt: 2 }}>
                    {stats.totalRequests}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" />
                    <Typography variant="h6">Onaylanan</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mt: 2 }}>
                    {stats.requestsByStatus.find(s => s.status === 'Approved')?.count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CancelIcon color="error" />
                    <Typography variant="h6">Reddedilen</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mt: 2 }}>
                    {stats.requestsByStatus.find(s => s.status === 'Rejected')?.count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HourglassEmptyIcon color="warning" />
                    <Typography variant="h6">Ort. Onay Süresi</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ mt: 2 }}>
                    {stats.avgApprovalTimeHours?.toFixed(1) || 0}h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          {stats && (
            <>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Talep Durumları
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.requestsByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {stats.requestsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Kategorilere Göre Talepler
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.requestsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {requestsOverTime.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Zaman İçinde Talepler
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={requestsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {slaCompliance && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  SLA Uyumluluk
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <Typography variant="body2" color="text.secondary">Toplam</Typography>
                    <Typography variant="h6">{slaCompliance.totalWithSla}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <Typography variant="body2" color="text.secondary">Zamanında</Typography>
                    <Typography variant="h6" color="success.main">{slaCompliance.onTime}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <Typography variant="body2" color="text.secondary">Geç</Typography>
                    <Typography variant="h6" color="error.main">{slaCompliance.late}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <Typography variant="body2" color="text.secondary">Gecikmiş</Typography>
                    <Typography variant="h6" color="warning.main">{slaCompliance.overdue}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="body2" color="text.secondary">Uyumluluk Oranı</Typography>
                    <Typography variant="h6">{slaCompliance.complianceRate.toFixed(1)}%</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    En Çok Talep Oluşturanlar
                  </Typography>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 300 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Kullanıcı</TableCell>
                          <TableCell align="right">Talep Sayısı</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topRequesters.map((requester) => (
                          <TableRow key={requester.userId}>
                            <TableCell>{requester.name}</TableCell>
                            <TableCell align="right">{requester.requestCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Onaylayıcı Performansı
                  </Typography>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 300 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Onaylayıcı</TableCell>
                          <TableCell align="right">Toplam</TableCell>
                          <TableCell align="right">Ort. Süre (saat)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {approvalPerformance.map((perf) => (
                          <TableRow key={perf.userId}>
                            <TableCell>{perf.name}</TableCell>
                            <TableCell align="right">{perf.totalApprovals}</TableCell>
                            <TableCell align="right">{perf.avgResponseTimeHours?.toFixed(1) || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

