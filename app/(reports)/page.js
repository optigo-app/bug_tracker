'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { BarChart3 } from 'lucide-react';

const page = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: '#f5f5f5',
            mb: 3,
          }}
        >
          <BarChart3 size={64} color="#6366F1" />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: '#444050' }}>
          Reports Coming Soon
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-2nd-color)', maxWidth: 500 }}>
          We're working on building comprehensive reports and analytics to help you track task performance, team productivity, and bug trends.
        </Typography>
      </Box>
    </Container>
  );
};

export default page;
