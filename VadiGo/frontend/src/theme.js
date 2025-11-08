import { createTheme } from '@mui/material/styles';
import { trTR } from '@mui/material/locale';

// Mantis Modern Corporate Dashboard Theme
const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: {
        main: '#5e35b1',        // Purple - Mantis primary
        light: '#7e57c2',
        dark: '#4527a0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#1e88e5',        // Blue - Mantis secondary
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#ffffff',
      },
      error: {
        main: '#f44336',
        light: '#ef5350',
        dark: '#d32f2f',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
      success: {
        main: '#00c853',
        light: '#69f0ae',
        dark: '#00a152',
      },
      background: {
        default: '#f8fafc',     // Light gray - modern
        paper: '#ffffff',
      },
      text: {
        primary: '#2c3e50',
        secondary: '#546e7a',
        disabled: 'rgba(0, 0, 0, 0.38)',
      },
      divider: '#e0e0e0',
      gradient: {
        primary: 'linear-gradient(135deg, #5e35b1 0%, #1e88e5 100%)',
        secondary: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        'Public Sans',
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.6,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.75,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.57,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
      },
    },
    shape: {
      borderRadius: 12,        // Mantis uses 12px
    },
    spacing: 8,
    shadows: [
      'none',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 4px 8px rgba(0,0,0,0.08)',
      '0px 8px 16px rgba(0,0,0,0.1)',
      '0px 12px 24px rgba(0,0,0,0.12)',
      '0px 16px 32px rgba(0,0,0,0.15)',
      '0px 20px 40px rgba(0,0,0,0.18)',
      '0px 24px 48px rgba(0,0,0,0.2)',
      '0px 2px 8px rgba(94, 53, 177, 0.15)',
      '0px 4px 12px rgba(94, 53, 177, 0.2)',
      '0px 8px 24px rgba(94, 53, 177, 0.25)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 4px 8px rgba(0,0,0,0.08)',
      '0px 8px 16px rgba(0,0,0,0.1)',
      '0px 12px 24px rgba(0,0,0,0.12)',
      '0px 16px 32px rgba(0,0,0,0.15)',
      '0px 20px 40px rgba(0,0,0,0.18)',
      '0px 24px 48px rgba(0,0,0,0.2)',
      '0px 2px 8px rgba(94, 53, 177, 0.15)',
      '0px 4px 12px rgba(94, 53, 177, 0.2)',
      '0px 8px 24px rgba(94, 53, 177, 0.25)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 4px 8px rgba(0,0,0,0.08)',
      '0px 8px 16px rgba(0,0,0,0.1)',
      '0px 12px 24px rgba(0,0,0,0.12)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 12px rgba(94, 53, 177, 0.25)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: 'rgba(94, 53, 177, 0.04)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
              transform: 'translateY(-4px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
          },
          elevation2: {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.08)',
          },
          elevation3: {
            boxShadow: '0px 8px 16px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#5e35b1',
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px',
                },
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.75rem',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            backgroundColor: '#f8fafc',
            color: '#2c3e50',
            borderBottom: '2px solid #e0e0e0',
          },
          root: {
            borderBottom: '1px solid #f0f0f0',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: '#f8fafc',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            background: 'linear-gradient(135deg, #5e35b1 0%, #1e88e5 100%)',
            color: '#ffffff',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: 'inherit',
            minWidth: 40,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 1px 4px rgba(0,0,0,0.08)',
            backgroundColor: '#ffffff',
            color: '#2c3e50',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
    },
  },
  trTR // Türkçe yerelleştirme
);

export default theme;

