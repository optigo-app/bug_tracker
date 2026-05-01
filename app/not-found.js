'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        px: 2,
        animation: 'fadeIn 1s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: '80px', md: '120px' },
          fontWeight: 800,
          color: '#dc3545',
          mb: 1,
          animation: 'slideIn 0.5s ease-out, pulse 2s infinite',
          '@keyframes slideIn': {
            from: { transform: 'translateY(-20px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
          },
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' },
          },
        }}
      >
        404
      </Typography>
      
      <Typography
        sx={{
          fontSize: { xs: '24px', md: '36px' },
          fontWeight: 700,
          color: '#343a40',
          mb: 2,
          animation: 'slideIn 0.5s ease-out 0.2s both',
        }}
      >
        Oops! Page Not Found
      </Typography>
      
      <Typography
        sx={{
          fontSize: { xs: '14px', md: '18px' },
          color: '#6c757d',
          maxWidth: 500,
          mb: 4,
          animation: 'slideIn 0.5s ease-out 0.4s both',
        }}
      >
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      
      <Button
        component={Link}
        href="/"
        startIcon={<Home size={18} />}
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: '#7367f0',
          color: 'white',
          borderRadius: 2,
          fontSize: '16px',
          fontWeight: 600,
          textTransform: 'none',
          animation: 'slideIn 0.5s ease-out 0.6s both',
          transition: 'background-color 0.3s ease, transform 0.3s ease',
          '&:hover': {
            bgcolor: '#5b52d0',
            transform: 'scale(1.05)',
          },
        }}
      >
        Home
      </Button>
    </Box>
  );
}
