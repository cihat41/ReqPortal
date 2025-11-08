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
  Visibility as ViewIcon,
} from '@mui/icons-material';
import api from '../services/api';

export default function FormTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await api.get('/formtemplates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Form şablonları yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu form şablonunu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/formtemplates/${id}`);
      loadTemplates();
    } catch (error) {
      console.error('Form şablonu silinemedi:', error);
      alert('Form şablonu silinemedi');
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Yükleniyor...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Form Şablonları
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/form-templates/new')}
        >
          Yeni Şablon
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Şablon Adı</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Alan Sayısı</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Versiyon</TableCell>
              <TableCell>Oluşturulma</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <Typography fontWeight={500}>{template.name}</Typography>
                  {template.description && (
                    <Typography variant="caption" color="text.secondary">
                      {template.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{template.category}</TableCell>
                <TableCell>{template.fieldCount}</TableCell>
                <TableCell>
                  <Chip
                    label={template.isActive ? 'Aktif' : 'Pasif'}
                    color={template.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>v{template.version}</TableCell>
                <TableCell>
                  {new Date(template.createdAt).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/admin/form-templates/${template.id}`)}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/admin/form-templates/${template.id}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(template.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {templates.length === 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Henüz form şablonu oluşturulmamış
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/form-templates/new')}
              sx={{ mt: 2 }}
            >
              İlk Şablonu Oluştur
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

