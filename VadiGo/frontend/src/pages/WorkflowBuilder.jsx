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
  FormControlLabel,
  Switch,
  Grid,
  Divider,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import api from '../services/api';

const STEP_TYPES = {
  Sequential: 'Sıralı',
  Parallel: 'Paralel',
};

export default function WorkflowBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    conditions: '',
    isActive: true,
    priority: 0,
    steps: [],
  });

  useEffect(() => {
    loadRoles();
    loadUsers();
    if (id) {
      loadWorkflow();
    }
  }, [id]);

  const loadRoles = async () => {
    try {
      const response = await api.get('/users/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Roller yüklenemedi:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users?isActive=true');
      setUsers(response.data);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    }
  };

  const loadWorkflow = async () => {
    try {
      const response = await api.get(`/approvalworkflows/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('İş akışı yüklenemedi:', error);
    }
  };

  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          stepOrder: formData.steps.length + 1,
          stepType: 'Sequential',
          roleId: null,
          userId: null,
          timeoutHours: null,
          isEscalationEnabled: false,
          escalationRoleId: null,
          escalationUserId: null,
        },
      ],
    });
  };

  const handleRemoveStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    // Reorder steps
    newSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    setFormData({ ...formData, steps: newSteps });
  };

  const handleMoveStep = (index, direction) => {
    const newSteps = [...formData.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Reorder
    newSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    
    setFormData({ ...formData, steps: newSteps });
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = async () => {
    try {
      if (id) {
        await api.put(`/approvalworkflows/${id}`, formData);
      } else {
        await api.post('/approvalworkflows', formData);
      }
      navigate('/admin/workflows');
    } catch (error) {
      console.error('İş akışı kaydedilemedi:', error);
      alert('İş akışı kaydedilemedi');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        {id ? 'İş Akışını Düzenle' : 'Yeni İş Akışı'}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Akış Bilgileri
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Akış Adı"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <TextField
                  label="Açıklama"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <TextField
                  label="Kategori"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
                <TextField
                  label="Koşullar (JSON)"
                  multiline
                  rows={3}
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  placeholder='{"amount": ">1000", "priority": "High"}'
                />
                <TextField
                  label="Öncelik"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
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
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Onay Adımları ({formData.steps.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddStep}
                >
                  Adım Ekle
                </Button>
              </Box>

              {formData.steps.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography>Henüz adım eklenmemiş</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddStep}
                    sx={{ mt: 2 }}
                  >
                    İlk Adımı Ekle
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {formData.steps.map((step, index) => (
                    <Paper key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Adım {step.stepOrder}
                        </Typography>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveStep(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUpIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveStep(index, 'down')}
                            disabled={index === formData.steps.length - 1}
                          >
                            <ArrowDownIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveStep(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            select
                            label="Adım Tipi"
                            value={step.stepType}
                            onChange={(e) => handleStepChange(index, 'stepType', e.target.value)}
                          >
                            {Object.entries(STEP_TYPES).map(([key, value]) => (
                              <MenuItem key={key} value={key}>
                                {value}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Zaman Aşımı (Saat)"
                            value={step.timeoutHours || ''}
                            onChange={(e) => handleStepChange(index, 'timeoutHours', e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            select
                            label="Rol"
                            value={step.roleId || ''}
                            onChange={(e) => handleStepChange(index, 'roleId', e.target.value || null)}
                          >
                            <MenuItem value="">Seçiniz</MenuItem>
                            {roles.map((role) => (
                              <MenuItem key={role.id} value={role.id}>
                                {role.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            select
                            label="Kullanıcı"
                            value={step.userId || ''}
                            onChange={(e) => handleStepChange(index, 'userId', e.target.value || null)}
                          >
                            <MenuItem value="">Seçiniz</MenuItem>
                            {users.map((user) => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={step.isEscalationEnabled}
                            onChange={(e) => handleStepChange(index, 'isEscalationEnabled', e.target.checked)}
                          />
                        }
                        label="Eskalasyon Aktif"
                      />

                      {step.isEscalationEnabled && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              select
                              label="Eskalasyon Rolü"
                              value={step.escalationRoleId || ''}
                              onChange={(e) => handleStepChange(index, 'escalationRoleId', e.target.value || null)}
                            >
                              <MenuItem value="">Seçiniz</MenuItem>
                              {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                  {role.name}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              select
                              label="Eskalasyon Kullanıcısı"
                              value={step.escalationUserId || ''}
                              onChange={(e) => handleStepChange(index, 'escalationUserId', e.target.value || null)}
                            >
                              <MenuItem value="">Seçiniz</MenuItem>
                              {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                  {user.firstName} {user.lastName}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        </Grid>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button onClick={() => navigate('/admin/workflows')}>
              İptal
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.name || !formData.category}
            >
              Kaydet
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

