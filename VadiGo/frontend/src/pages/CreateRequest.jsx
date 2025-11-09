import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import { Save as SaveIcon, Send as SendIcon } from '@mui/icons-material';
import { requestsAPI, formTemplatesAPI } from '../services/api';

const priorities = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Medium', label: 'Orta' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Critical', label: 'Kritik' },
];

// Validation helper function
const validateField = (field, value) => {
  if (!field.validationRules) return { isValid: true, error: '' };

  try {
    const rules = JSON.parse(field.validationRules);

    // Required check
    if (field.isRequired && (!value || value === '')) {
      return { isValid: false, error: 'Bu alan zorunludur' };
    }

    // Skip other validations if value is empty and not required
    if (!value || value === '') return { isValid: true, error: '' };

    // Min length
    if (rules.minLength && value.length < rules.minLength) {
      return { isValid: false, error: `En az ${rules.minLength} karakter olmalıdır` };
    }

    // Max length
    if (rules.maxLength && value.length > rules.maxLength) {
      return { isValid: false, error: `En fazla ${rules.maxLength} karakter olmalıdır` };
    }

    // Min value (for numbers)
    if (rules.min !== undefined && parseFloat(value) < rules.min) {
      return { isValid: false, error: `En az ${rules.min} olmalıdır` };
    }

    // Max value (for numbers)
    if (rules.max !== undefined && parseFloat(value) > rules.max) {
      return { isValid: false, error: `En fazla ${rules.max} olmalıdır` };
    }

    // Regex pattern
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        return { isValid: false, error: rules.patternMessage || 'Geçersiz format' };
      }
    }

    // Email format
    if (field.fieldType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, error: 'Geçerli bir email adresi giriniz' };
      }
    }

    return { isValid: true, error: '' };
  } catch {
    return { isValid: true, error: '' };
  }
};

// Dynamic Form Field Renderer Component
const DynamicFormField = ({ field, value, onChange, allValues }) => {
  const [validationError, setValidationError] = useState('');

  // Validate on value change
  useEffect(() => {
    const validation = validateField(field, value);
    setValidationError(validation.error);
  }, [value, field]);

  // Check visibility condition
  const isVisible = () => {
    if (!field.dependsOn || !field.visibilityCondition) return true;

    try {
      const condition = JSON.parse(field.visibilityCondition);
      const dependentValue = allValues[field.dependsOn];

      // Simple equality check
      if (condition.equals !== undefined) {
        return dependentValue === condition.equals;
      }

      // Array contains check
      if (condition.in !== undefined) {
        return condition.in.includes(dependentValue);
      }

      return true;
    } catch {
      return true;
    }
  };

  if (!isVisible()) return null;

  const commonSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'background.paper',
    },
  };

  // Parse options for dropdown, radio, checkbox
  let options = [];
  if (field.options) {
    try {
      options = JSON.parse(field.options);
    } catch {
      options = [];
    }
  }

  const renderField = () => {
    switch (field.fieldType) {
      case 'text':
      case 'email':
        return (
          <TextField
            fullWidth
            required={field.isRequired}
            type={field.fieldType}
            placeholder={field.placeholder || ''}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            error={!!validationError}
            helperText={validationError || field.helpText}
            sx={commonSx}
          />
        );

      case 'number':
      case 'currency':
        return (
          <TextField
            fullWidth
            required={field.isRequired}
            type="number"
            placeholder={field.placeholder || ''}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            error={!!validationError}
            helperText={validationError || field.helpText}
            disabled={!!field.calculationFormula}
            slotProps={{
              htmlInput: { min: 0, step: field.fieldType === 'currency' ? 0.01 : 1 },
              input: {
                readOnly: !!field.calculationFormula,
              },
            }}
            sx={{
              ...commonSx,
              ...(field.calculationFormula && {
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'action.hover',
                },
              }),
            }}
          />
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            required={field.isRequired}
            multiline
            rows={4}
            placeholder={field.placeholder || ''}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            error={!!validationError}
            helperText={validationError || field.helpText}
            sx={commonSx}
          />
        );

      case 'date':
        return (
          <TextField
            fullWidth
            required={field.isRequired}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            helperText={field.helpText}
            slotProps={{
              inputLabel: { shrink: true }
            }}
            sx={commonSx}
          />
        );

      case 'datetime':
        return (
          <TextField
            fullWidth
            required={field.isRequired}
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            helperText={field.helpText}
            slotProps={{
              inputLabel: { shrink: true }
            }}
            sx={commonSx}
          />
        );

      case 'dropdown':
        return (
          <TextField
            fullWidth
            required={field.isRequired}
            select
            placeholder={field.placeholder || 'Seçin'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            helperText={field.helpText}
            sx={commonSx}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        );

      case 'radio':
        return (
          <FormControl component="fieldset" required={field.isRequired}>
            <RadioGroup value={value} onChange={(e) => onChange(e.target.value)}>
              {options.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {field.helpText && <FormHelperText>{field.helpText}</FormHelperText>}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl component="fieldset" required={field.isRequired}>
            {options.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={(value || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = value || [];
                      if (e.target.checked) {
                        onChange([...currentValues, option]);
                      } else {
                        onChange(currentValues.filter((v) => v !== option));
                      }
                    }}
                  />
                }
                label={option}
              />
            ))}
            {field.helpText && <FormHelperText>{field.helpText}</FormHelperText>}
          </FormControl>
        );

      case 'file':
        return (
          <Box>
            <Button variant="outlined" component="label" fullWidth>
              {value ? 'Dosya Değiştir' : 'Dosya Seç'}
              <input
                type="file"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Store the actual File object, not just the name
                    onChange(file);
                  }
                }}
              />
            </Button>
            {value && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2">
                  📎 {value.name || value}
                </Typography>
                {value.size && (
                  <Typography variant="caption" color="text.secondary">
                    {(value.size / 1024).toFixed(2)} KB
                  </Typography>
                )}
              </Box>
            )}
            {field.helpText && <FormHelperText>{field.helpText}</FormHelperText>}
          </Box>
        );

      default:
        return (
          <TextField
            fullWidth
            required={field.isRequired}
            placeholder={field.placeholder || ''}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            helperText={field.helpText}
            sx={commonSx}
          />
        );
    }
  };

  return (
    <Grid size={{ xs: 12, md: field.fieldType === 'textarea' ? 12 : 6 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
        {field.label} {field.isRequired && '*'}
      </Typography>
      {renderField()}
    </Grid>
  );
};

const CreateRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDetails, setTemplateDetails] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    slaHours: '',
  });

  const [dynamicFormData, setDynamicFormData] = useState({});

  // Fetch active form templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await formTemplatesAPI.getAll({ isActive: true });
        setTemplates(response.data || []);
      } catch (err) {
        console.error('Form şablonları yüklenirken hata:', err);
        setError('Form şablonları yüklenemedi');
      }
    };
    fetchTemplates();
  }, []);

  // Calculate fields with formulas
  useEffect(() => {
    if (!templateDetails?.fields) return;

    const calculatedFields = templateDetails.fields.filter(f => f.calculationFormula);
    if (calculatedFields.length === 0) return;

    const newDynamicFormData = { ...dynamicFormData };
    let hasChanges = false;

    calculatedFields.forEach(field => {
      try {
        // Replace field names with their values in the formula
        let formula = field.calculationFormula;

        // Find all field names in the formula (alphanumeric + underscore)
        const fieldNames = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];

        // Replace each field name with its value
        fieldNames.forEach(fieldName => {
          const value = dynamicFormData[fieldName];
          if (value !== undefined && value !== null && value !== '') {
            // Replace field name with its numeric value
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              formula = formula.replace(new RegExp(`\\b${fieldName}\\b`, 'g'), numValue);
            }
          }
        });

        // Evaluate the formula (only if all variables are replaced with numbers)
        if (!/[a-zA-Z_]/.test(formula)) {
          // eslint-disable-next-line no-eval
          const result = eval(formula);
          if (!isNaN(result) && isFinite(result)) {
            const roundedResult = Math.round(result * 100) / 100; // Round to 2 decimals
            if (newDynamicFormData[field.name] !== roundedResult) {
              newDynamicFormData[field.name] = roundedResult;
              hasChanges = true;
            }
          }
        }
      } catch (error) {
        console.error(`Calculation error for field ${field.name}:`, error);
      }
    });

    if (hasChanges) {
      setDynamicFormData(newDynamicFormData);
    }
  }, [dynamicFormData, templateDetails]);

  // Fetch template details when selected
  useEffect(() => {
    const fetchTemplateDetails = async () => {
      if (!selectedTemplate) {
        setTemplateDetails(null);
        setDynamicFormData({});
        return;
      }

      try {
        setLoadingTemplate(true);
        const response = await formTemplatesAPI.getById(selectedTemplate);
        setTemplateDetails(response.data);

        // Initialize dynamic form data with default values
        const initialData = {};
        response.data.fields?.forEach(field => {
          if (field.defaultValue) {
            initialData[field.name] = field.defaultValue;
          }
        });
        setDynamicFormData(initialData);
      } catch (err) {
        console.error('Form şablonu detayları yüklenirken hata:', err);
        setError('Form şablonu detayları yüklenemedi');
      } finally {
        setLoadingTemplate(false);
      }
    };
    fetchTemplateDetails();
  }, [selectedTemplate]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDynamicFieldChange = (fieldName, value) => {
    setDynamicFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      setLoading(true);
      setError('');

      // Validate required dynamic fields
      if (!isDraft && templateDetails) {
        const requiredFields = templateDetails.fields?.filter(f => f.isRequired) || [];
        const missingFields = requiredFields.filter(f => !dynamicFormData[f.name]);

        if (missingFields.length > 0) {
          setError(`Lütfen zorunlu alanları doldurun: ${missingFields.map(f => f.label).join(', ')}`);
          setLoading(false);
          return;
        }
      }

      // Separate files from form data
      const files = {};
      const cleanFormData = {};

      Object.entries(dynamicFormData).forEach(([key, value]) => {
        if (value instanceof File) {
          files[key] = value;
          cleanFormData[key] = value.name; // Store filename in formData
        } else {
          cleanFormData[key] = value;
        }
      });

      const requestData = {
        title: formData.title,
        description: formData.description,
        type: templateDetails?.category || 'Genel',
        category: templateDetails?.category || 'Genel',
        priority: formData.priority,
        justification: formData.description, // Use description as justification
        estimatedCost: null,
        slaHours: formData.slaHours ? parseInt(formData.slaHours) : null,
        formTemplateId: selectedTemplate,
        formData: JSON.stringify(cleanFormData),
        saveAsDraft: isDraft,
      };

      const response = await requestsAPI.create(requestData);
      const requestId = response.data.id;

      // Upload files if any
      if (Object.keys(files).length > 0) {
        for (const [fieldName, file] of Object.entries(files)) {
          const formData = new FormData();
          formData.append('file', file);

          try {
            await fetch(`/api/attachments/upload/${requestId}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: formData
            });
          } catch (uploadErr) {
            console.error(`Failed to upload file for ${fieldName}:`, uploadErr);
            // Continue with other files even if one fails
          }
        }
      }

      navigate('/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Talep oluşturulurken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.title && formData.description && selectedTemplate;

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Başlık */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600} sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          Yeni Talep Oluştur
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lütfen talep bilgilerinizi eksiksiz doldurun
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={3}>
          {/* Form Şablonu Seçimi */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              Form Şablonu *
            </Typography>
            <TextField
              fullWidth
              required
              select
              placeholder="Form şablonu seçin"
              value={selectedTemplate || ''}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            >
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name} {template.description && `- ${template.description}`}
                </MenuItem>
              ))}
            </TextField>
            {templateDetails && (
              <FormHelperText>
                Kategori: {templateDetails.category}
              </FormHelperText>
            )}
          </Grid>

          {/* Başlık */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              Talep Başlığı *
            </Typography>
            <TextField
              fullWidth
              required
              placeholder="Örn: Yeni bilgisayar talebi"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid>

          {/* Öncelik */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              Öncelik
            </Typography>
            <TextField
              fullWidth
              select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.value} value={priority.value}>
                  {priority.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* SLA Süresi */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              SLA Süresi (Saat)
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="24"
              value={formData.slaHours}
              onChange={(e) => handleChange('slaHours', e.target.value)}
              slotProps={{
                htmlInput: { min: 1, step: 1 }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid> 
          
          {/* Açıklama */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
              Açıklama *
            </Typography>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              placeholder="Talep detaylarını açıklayın..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid>

          {/* Dinamik Form Alanları */}
          {loadingTemplate && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            </Grid>
          )}

          {!loadingTemplate && templateDetails && templateDetails.fields && templateDetails.fields.length > 0 && (
            <>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                  Form Alanları
                </Typography>
              </Grid>
              {templateDetails.fields
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <DynamicFormField
                    key={field.id}
                    field={field}
                    value={dynamicFormData[field.name] || ''}
                    onChange={(value) => handleDynamicFieldChange(field.name, value)}
                    allValues={dynamicFormData}
                  />
                ))}
            </>
          )}

          {/* Butonlar */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'flex-end',
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate('/requests')}
                disabled={loading}
                sx={{
                  minWidth: { xs: '100%', sm: 120 },
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                İptal
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<SaveIcon />}
                onClick={() => handleSubmit(true)}
                disabled={loading || !formData.title}
                sx={{
                  minWidth: { xs: '100%', sm: 200 },
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                Taslak Olarak Kaydet
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={() => handleSubmit(false)}
                disabled={loading || !isValid}
                sx={{
                  minWidth: { xs: '100%', sm: 120 },
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                Gönder
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CreateRequest;

