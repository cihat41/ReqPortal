import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import api from '../services/api';

export default function EmailSettings() {
  const [settings, setSettings] = useState({
    id: 0,
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    enableSsl: true,
  });
  const [testEmail, setTestEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings/email');
      console.log('Backend\'den gelen ayarlar:', response.data);
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Gönderilen ayarlar:', settings);
      const response = await api.post('/settings/email', settings);
      console.log('Yanıt:', response.data);
      setMessage({ type: 'success', text: 'E-posta ayarları başarıyla kaydedildi' });
    } catch (error) {
      console.error('Ayarlar kaydedilemedi:', error);
      console.error('Hata detayı:', error.response?.data);
      setMessage({ type: 'error', text: 'Ayarlar kaydedilemedi' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Lütfen test e-posta adresi girin' });
      return;
    }

    setTesting(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.post('/settings/email/test', { email: testEmail });
      setMessage({ type: 'success', text: 'Test e-postası gönderildi' });
    } catch (error) {
      console.error('Test e-postası gönderilemedi:', error);
      setMessage({ type: 'error', text: 'Test e-postası gönderilemedi' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        E-posta Ayarları
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                SMTP Ayarları
              </Typography>
              
              {message.text && (
                <Alert severity={message.type} sx={{ mb: 2 }}>
                  {message.text}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="SMTP Sunucusu"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                  helperText="E-posta sağlayıcınızın SMTP sunucu adresi"
                />
                
                <TextField
                  label="SMTP Port"
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 587 })}
                  helperText="Genellikle 587 (TLS) veya 465 (SSL)"
                />
                
                <TextField
                  label="Kullanıcı Adı"
                  value={settings.smtpUsername}
                  onChange={(e) => setSettings({ ...settings, smtpUsername: e.target.value })}
                  placeholder="user@example.com"
                  helperText="SMTP kimlik doğrulama için kullanıcı adı"
                />
                
                <TextField
                  label="Şifre"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                  helperText="SMTP kimlik doğrulama için şifre"
                />
                
                <TextField
                  label="Gönderen E-posta"
                  type="email"
                  value={settings.fromEmail}
                  onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                  placeholder="noreply@example.com"
                  helperText="E-postaların gönderileceği adres"
                />
                
                <TextField
                  label="Gönderen Adı"
                  value={settings.fromName}
                  onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                  placeholder="Talep Yönetim Sistemi"
                  helperText="E-postalarda görünecek gönderen adı"
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test E-postası
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                SMTP ayarlarınızı test etmek için bir e-posta adresi girin
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Test E-posta Adresi"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
                
                <Button
                  variant="outlined"
                  startIcon={<SendIcon />}
                  onClick={handleTestEmail}
                  disabled={testing || !testEmail}
                >
                  {testing ? 'Gönderiliyor...' : 'Test E-postası Gönder'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Popüler SMTP Ayarları
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2">Gmail</Typography>
                  <Typography variant="caption" color="text.secondary">
                    smtp.gmail.com:587<br />
                    Not: Uygulama şifresi kullanın
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2">Outlook</Typography>
                  <Typography variant="caption" color="text.secondary">
                    smtp-mail.outlook.com:587
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2">SendGrid</Typography>
                  <Typography variant="caption" color="text.secondary">
                    smtp.sendgrid.net:587
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

