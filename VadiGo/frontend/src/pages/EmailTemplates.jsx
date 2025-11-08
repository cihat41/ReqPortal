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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import api from '../services/api';

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [variables, setVariables] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    eventType: '',
    subject: '',
    body: '',
    isActive: true,
  });

  useEffect(() => {
    loadTemplates();
    loadEventTypes();
    loadVariables();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await api.get('/emailtemplates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Şablonlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventTypes = async () => {
    try {
      const response = await api.get('/emailtemplates/event-types');
      setEventTypes(response.data);
    } catch (error) {
      console.error('Olay tipleri yüklenemedi:', error);
    }
  };

  const loadVariables = async () => {
    try {
      const response = await api.get('/emailtemplates/variables');
      setVariables(response.data);
    } catch (error) {
      console.error('Değişkenler yüklenemedi:', error);
    }
  };

  const handleOpenDialog = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      loadTemplateDetails(template.id);
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        eventType: '',
        subject: '',
        body: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const loadTemplateDetails = async (id) => {
    try {
      const response = await api.get(`/emailtemplates/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Şablon detayları yüklenemedi:', error);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTemplate) {
        await api.put(`/emailtemplates/${editingTemplate.id}`, formData);
      } else {
        await api.post('/emailtemplates', formData);
      }
      loadTemplates();
      handleCloseDialog();
    } catch (error) {
      console.error('Şablon kaydedilemedi:', error);
      alert('Şablon kaydedilemedi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu şablonu pasif hale getirmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/emailtemplates/${id}`);
      loadTemplates();
    } catch (error) {
      console.error('Şablon silinemedi:', error);
      alert('Şablon silinemedi');
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template-body');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.body;
      const newText = text.substring(0, start) + variable + text.substring(end);
      setFormData({ ...formData, body: newText });
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Yükleniyor...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          E-posta Şablonları
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Şablon
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Şablon Adı</TableCell>
              <TableCell>Olay Tipi</TableCell>
              <TableCell>Konu</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <Typography fontWeight={500}>
                    {template.name}
                  </Typography>
                </TableCell>
                <TableCell>{template.eventType}</TableCell>
                <TableCell>{template.subject}</TableCell>
                <TableCell>
                  <Chip
                    label={template.isActive ? 'Aktif' : 'Pasif'}
                    color={template.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(template)}
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Şablonu Düzenle' : 'Yeni Şablon'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Şablon Adı"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <TextField
                  select
                  label="Olay Tipi"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  required
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Konu"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
                <TextField
                  id="template-body"
                  label="İçerik (HTML)"
                  multiline
                  rows={12}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Aktif"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Kullanılabilir Değişkenler
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Değişkeni eklemek için tıklayın
              </Typography>
              {Object.entries(variables).map(([category, vars]) => (
                <Accordion key={category} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                      {category}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {vars.map((variable) => (
                        <Button
                          key={variable}
                          size="small"
                          variant="outlined"
                          onClick={() => insertVariable(variable)}
                          sx={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
                        >
                          {variable}
                        </Button>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.eventType || !formData.subject || !formData.body}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

