import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../services/api';

export default function WorkflowManagement() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await api.get('/approvalworkflows');
      setWorkflows(response.data);
    } catch (error) {
      console.error('İş akışları yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu iş akışını pasif hale getirmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/approvalworkflows/${id}`);
      loadWorkflows();
    } catch (error) {
      console.error('İş akışı silinemedi:', error);
      alert('İş akışı silinemedi');
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Yükleniyor...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Onay Akışları
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/workflows/new')}
        >
          Yeni Akış
        </Button>
      </Box>

      {workflows.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Henüz onay akışı tanımlanmamış
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Taleplerin otomatik olarak doğru kişilere yönlendirilmesi için onay akışları oluşturun
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/workflows/new')}
            >
              İlk Akışı Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Akış Adı</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Adım Sayısı</TableCell>
                <TableCell>Öncelik</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <Typography fontWeight={500}>
                      {workflow.name}
                    </Typography>
                    {workflow.description && (
                      <Typography variant="caption" color="text.secondary">
                        {workflow.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={workflow.category} size="small" />
                  </TableCell>
                  <TableCell>{workflow.stepCount}</TableCell>
                  <TableCell>{workflow.priority}</TableCell>
                  <TableCell>
                    <Chip
                      label={workflow.isActive ? 'Aktif' : 'Pasif'}
                      color={workflow.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/workflows/${workflow.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(workflow.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

