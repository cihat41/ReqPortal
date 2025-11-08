import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import api from '../services/api';

const fieldTypes = [
  { value: 'text', label: 'Metin' },
  { value: 'number', label: 'Sayı' },
  { value: 'email', label: 'E-posta' },
  { value: 'date', label: 'Tarih' },
  { value: 'datetime', label: 'Tarih/Saat' },
  { value: 'textarea', label: 'Çok Satırlı Metin' },
  { value: 'dropdown', label: 'Açılır Liste' },
  { value: 'radio', label: 'Radyo Buton' },
  { value: 'checkbox', label: 'Onay Kutusu' },
  { value: 'file', label: 'Dosya' },
  { value: 'currency', label: 'Para Birimi' },
];

export default function FormTemplateBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true,
    defaultWorkflowId: null,
    fields: [],
  });

  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    loadWorkflows();
    if (isEdit) {
      loadTemplate();
    }
  }, [id]);

  const loadWorkflows = async () => {
    try {
      const response = await api.get('/approvalworkflows');
      setWorkflows(response.data.filter(w => w.isActive));
    } catch (error) {
      console.error('Onay akışları yüklenemedi:', error);
    }
  };

  const loadTemplate = async () => {
    try {
      const response = await api.get(`/formtemplates/${id}`);
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        category: response.data.category,
        isActive: response.data.isActive,
        defaultWorkflowId: response.data.defaultWorkflowId || null,
        fields: response.data.fields || [],
      });
    } catch (error) {
      console.error('Şablon yüklenemedi:', error);
    }
  };

  const handleAddField = () => {
    setFormData({
      ...formData,
      fields: [
        ...formData.fields,
        {
          name: '',
          label: '',
          fieldType: 'text',
          order: formData.fields.length,
          isRequired: false,
          placeholder: '',
          helpText: '',
          options: '',
          defaultValue: '',
          dependsOn: '',
          visibilityCondition: '',
        },
      ],
    });
  };

  const handleRemoveField = (index) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
  };

  const handleMoveField = (index, direction) => {
    const newFields = [...formData.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    newFields.forEach((field, i) => field.order = i);
    
    setFormData({ ...formData, fields: newFields });
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], [field]: value };
    setFormData({ ...formData, fields: newFields });
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await api.put(`/formtemplates/${id}`, formData);
      } else {
        await api.post('/formtemplates', formData);
      }
      navigate('/admin/form-templates');
    } catch (error) {
      console.error('Şablon kaydedilemedi:', error);
      alert('Şablon kaydedilemedi');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/form-templates')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={600}>
          {isEdit ? 'Form Şablonunu Düzenle' : 'Yeni Form Şablonu'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Şablon Bilgileri
              </Typography>
              
              <TextField
                fullWidth
                label="Şablon Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Açıklama"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />

              <TextField
                fullWidth
                label="Kategori"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                select
                label="Varsayılan Onay Akışı"
                value={formData.defaultWorkflowId || ''}
                onChange={(e) => setFormData({ ...formData, defaultWorkflowId: e.target.value || null })}
                margin="normal"
                helperText="Bu form şablonu için varsayılan onay akışını seçin (opsiyonel)"
              >
                <MenuItem value="">
                  <em>Seçilmedi</em>
                </MenuItem>
                {workflows.map((workflow) => (
                  <MenuItem key={workflow.id} value={workflow.id}>
                    {workflow.name} ({workflow.category})
                  </MenuItem>
                ))}
              </TextField>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Aktif"
                sx={{ mt: 2 }}
              />

              <Box sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.category}
                >
                  Kaydet
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Form Alanları ({formData.fields.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddField}
                >
                  Alan Ekle
                </Button>
              </Box>

              {formData.fields.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <Typography color="text.secondary">
                    Henüz alan eklenmedi. "Alan Ekle" butonuna tıklayarak başlayın.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {formData.fields.map((field, index) => (
                    <Paper key={index} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle2" color="primary">
                          Alan #{index + 1}
                        </Typography>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveField(index, 'up')}
                            disabled={index === 0}
                          >
                            <UpIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveField(index, 'down')}
                            disabled={index === formData.fields.length - 1}
                          >
                            <DownIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveField(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Alan Adı (name)"
                            value={field.name}
                            onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Etiket (label)"
                            value={field.label}
                            onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            select
                            label="Alan Tipi"
                            value={field.fieldType}
                            onChange={(e) => handleFieldChange(index, 'fieldType', e.target.value)}
                          >
                            {fieldTypes.map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                {type.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.isRequired}
                                onChange={(e) => handleFieldChange(index, 'isRequired', e.target.checked)}
                              />
                            }
                            label="Zorunlu"
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Placeholder"
                            value={field.placeholder}
                            onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
                          />
                        </Grid>
                        {(field.fieldType === 'dropdown' || field.fieldType === 'radio') && (
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Seçenekler (JSON)"
                              value={field.options}
                              onChange={(e) => handleFieldChange(index, 'options', e.target.value)}
                              placeholder='["Seçenek 1", "Seçenek 2"]'
                              helperText="JSON formatında liste"
                            />
                          </Grid>
                        )}
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Varsayılan Değer"
                            value={field.defaultValue || ''}
                            onChange={(e) => handleFieldChange(index, 'defaultValue', e.target.value)}
                            helperText="Bu alanın varsayılan değeri"
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Yardım Metni"
                            value={field.helpText}
                            onChange={(e) => handleFieldChange(index, 'helpText', e.target.value)}
                          />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Divider sx={{ my: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Koşullu Görünürlük
                            </Typography>
                          </Divider>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            select
                            label="Bağımlı Alan (DependsOn)"
                            value={field.dependsOn || ''}
                            onChange={(e) => handleFieldChange(index, 'dependsOn', e.target.value)}
                            helperText="Bu alan hangi alana bağlı?"
                          >
                            <MenuItem value="">
                              <em>Bağımlı değil</em>
                            </MenuItem>
                            {formData.fields
                              .filter((_, i) => i < index)
                              .map((f, i) => (
                                <MenuItem key={i} value={f.name}>
                                  {f.label || f.name}
                                </MenuItem>
                              ))}
                          </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Görünürlük Koşulu (JSON)"
                            value={field.visibilityCondition || ''}
                            onChange={(e) => handleFieldChange(index, 'visibilityCondition', e.target.value)}
                            placeholder='{"equals": "Değer"}'
                            helperText='Örn: {"equals": "Yüksek"}'
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

