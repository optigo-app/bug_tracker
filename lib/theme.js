'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7367f0',
      light: '#EEF2FF',
      dark: '#5e54d0',
    },
    secondary: {
      main: '#6366F1',
    },
    background: {
      default: '#fafafa', // Grey background as requested by user
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
    }
  },
  shape: {
    borderRadius: 8, // Set to 8px as requested
  },
  typography: {
    fontFamily: '"Public Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
    '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
    ...Array(20).fill('none')
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          boxShadow: 'none',
          borderRadius: 8,
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 8,
        },
        outlined: {
          borderColor: '#F1F5F9', // Even lighter border
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          backgroundColor: '#CBD5E1',
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '0 0 0 8px rgba(203, 213, 225, 0.16)',
          },
        },
        track: {
          backgroundColor: '#CBD5E1',
          border: 'none',
        },
        rail: {
          backgroundColor: '#F1F5F9',
        },
      },
    }
  },
});

export default theme;
