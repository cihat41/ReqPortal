import { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stack,
  Grid,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // localStorage'a yazma işleminin tamamlanması için kısa bir gecikme
        await new Promise(resolve => setTimeout(resolve, 200));
        // Tam sayfa yenileme ile dashboard'a git
        // Bu sayede localStorage'daki token kesinlikle yüklenmiş olur
        window.location.href = '/dashboard';
      } else {
        setError(result.error || 'Giriş yapılamadı');
        setLoading(false);
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        background: 'linear-gradient(135deg, #5e35b1 0%, #1e88e5 100%)',
        position: 'relative',
        overflow: 'hidden',
        m: 0,
        p: 0,
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          top: '-300px',
          left: '-300px',
          animation: 'pulse 8s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          bottom: '-200px',
          right: '-200px',
        }}
      />

      <Container
        maxWidth={false}
        disableGutters
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 3, md: 4 },
          px: { xs: 2, md: 4 },
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <Box sx={{ maxWidth: 1200, width: '100%' }}>
          <Grid container spacing={0} sx={{ boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.3)', borderRadius: { xs: 3, md: 4 }, overflow: 'hidden', width: '100%' }}>
          {/* Sol Panel - Bilgi */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              p: { xs: 4, md: 6 },
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Box sx={{ mb: 6 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <LoginIcon sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Talep Yönetim
              </Typography>
              <Typography variant="h3" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                Sistemi
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 400 }}>
                Modern, hızlı ve güvenli talep yönetimi
              </Typography>
            </Box>

            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircleIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Hızlı Onay Süreci
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Taleplerinizi kolayca oluşturun ve anlık takip edin
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <SecurityIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Güvenli Platform
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Verileriniz şifreli ve güvende tutuluyor
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <SpeedIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Anlık Bildirimler
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Tüm güncellemelerden anında haberdar olun
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>

          {/* Sağ Panel - Login Form */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ background: 'white', minHeight: { xs: 'auto', md: '650px' } }}>
            <Box sx={{ p: { xs: 4, sm: 5, md: 6 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: 480, mx: 'auto' }}>
              {/* Mobile Logo */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #5e35b1 0%, #1e88e5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LoginIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                  Hoş Geldiniz
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}>
                  Devam etmek için giriş yapın
                </Typography>
              </Box>

              {/* Hata Mesajı */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={3}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="E-posta Adresi"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#fafafa',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                      },
                    },
                  }}
                />

                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Şifre"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={loading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#fafafa',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                      },
                    },
                  }}
                />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 1,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #5e35b1 0%, #1e88e5 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4527a0 0%, #1565c0 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 8px 16px rgba(94, 53, 177, 0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Giriş Yap'
                    )}
                  </Button>
                </Stack>
              </Box>

              {/* Demo Bilgisi */}
              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  bgcolor: '#f0f7ff',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: '#bbdefb',
                }}
              >
                <Typography variant="body2" color="primary.dark" fontWeight={600} gutterBottom>
                  📌 Demo Hesap Bilgileri
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  <strong>E-posta:</strong> admin@test.com
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Şifre:</strong> Admin123!
                </Typography>
              </Box>
            </Box>
          </Grid>
          </Grid>

          {/* Footer */}
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', mt: 4 }}>
            © 2025 Talep Yönetim Sistemi. Tüm hakları saklıdır.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;

