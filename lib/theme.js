'use client';

import { createTheme, alpha } from '@mui/material/styles';

const PRIMARY_MAIN = '#7367F0';
const PRIMARY_LIGHT = '#8B80F8';
const PRIMARY_DARK = '#5E54D0';

const theme = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: PRIMARY_MAIN,
      light: PRIMARY_LIGHT,
      dark: PRIMARY_DARK,
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#6366F1',
      contrastText: '#FFFFFF',
    },

    success: {
      main: '#22C55E',
    },

    error: {
      main: '#EF4444',
    },

    warning: {
      main: '#F59E0B',
    },

    info: {
      main: '#0EA5E9',
    },

    background: {
      default: '#F8F7FC',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#2F3349',
      secondary: '#6D6B77',
      disabled: '#A8AAAE',
    },

    divider: '#E7E7E8',

    grey: {
      50: '#FAFAFA',
      100: '#F5F5F7',
      200: '#ECECEE',
      300: '#E1E2E5',
      400: '#C9C9CE',
      500: '#A8AAAE',
      600: '#7D7F85',
      700: '#6D6B77',
      800: '#444050',
      900: '#2F3349',
    },
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: [
      'Public Sans',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),

    h1: {
      fontWeight: 700,
      color: '#2F3349',
    },

    h2: {
      fontWeight: 700,
      color: '#2F3349',
    },

    h3: {
      fontWeight: 700,
      color: '#2F3349',
    },

    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
      color: '#2F3349',
    },

    h5: {
      fontWeight: 700,
      color: '#2F3349',
    },

    h6: {
      fontWeight: 600,
      color: '#2F3349',
    },

    subtitle1: {
      fontWeight: 600,
      color: '#444050',
    },

    body1: {
      color: '#444050',
    },

    body2: {
      color: '#6D6B77',
    },

    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  shadows: [
    'none',
    '0px 2px 8px rgba(0,0,0,0.05)',
    '0px 4px 12px rgba(0,0,0,0.06)',
    '0px 6px 18px rgba(0,0,0,0.08)',
    '0px 8px 24px rgba(0,0,0,0.08)',
    '0px 10px 30px rgba(0,0,0,0.10)',
    ...Array(19).fill('0px 10px 30px rgba(0,0,0,0.10)'),
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8F7FC',
          color: '#444050',
          scrollBehavior: 'smooth',
        },

        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },

        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#D4D4D8',
          borderRadius: '10px',
        },

        '*::-webkit-scrollbar-track': {
          backgroundColor: '#F1F1F4',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 10,
          boxShadow:
            'rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow:
            'rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px',
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          fontSize: '14px',
          transition: 'all 0.2s ease-in-out',
        },

        containedPrimary: {
          background:
            'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367F0 100%)',

          color: '#FFFFFF',

          '&:hover': {
            background: '#685DD8',
          },
        },

        containedError: {
          background:
            'linear-gradient(270deg, rgba(255, 72, 66, 0.8) 0%, #D90429 100%)',

          '&:hover': {
            background: '#C20225',
          },
        },

        outlined: {
          borderColor: '#DADCE0',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #ECECEE',
          background: '#FFFFFF',
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,

          '&.Mui-selected': {
            background:
              'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367F0 100%)',
            color: '#FFFFFF',

            '&:hover': {
              background:
                'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367F0 100%)',
            },

            '& .MuiListItemIcon-root': {
              color: '#FFFFFF',
            },
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',

          '& fieldset': {
            borderColor: '#DADCE0',
          },

          '&:hover fieldset': {
            borderColor: PRIMARY_MAIN,
          },

          '&.Mui-focused fieldset': {
            borderColor: PRIMARY_MAIN,
            boxShadow: `0 0 0 3px ${alpha(PRIMARY_MAIN, 0.12)}`,
          },
        },

        input: {
          padding: '10px 14px',
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8F7FC',
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#444050',
          fontWeight: 700,
          borderBottom: '1px solid #ECECEE',
        },

        body: {
          borderBottom: '1px solid #F1F1F4',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#2F3349',
          fontSize: '12px',
        },
      },
    },

    MuiSlider: {
      styleOverrides: {
        thumb: {
          backgroundColor: PRIMARY_MAIN,

          '&:hover, &.Mui-focusVisible': {
            boxShadow: `0 0 0 8px ${alpha(PRIMARY_MAIN, 0.16)}`,
          },
        },

        track: {
          border: 'none',
          backgroundColor: PRIMARY_MAIN,
        },

        rail: {
          backgroundColor: '#E5E7EB',
        },
      },
    },
  },
});

export default theme;