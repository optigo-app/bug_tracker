'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/auto-login';
  const isBugsPage = pathname?.startsWith('/bugs');
  const [collapsed, setCollapsed] = useState(false);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="layout-container">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <Box
        component="main"
        className="main-content"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          bgcolor: '#F8FAFC',
          overflow: 'hidden', // Always hide main scroll to let children handle it
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Header />
        <Box
          sx={{
            p: { xs: 0 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0, // CRITICAL: Allow this flex child to be smaller than its content
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0, // CRITICAL: Propagate minHeight: 0 to nested flexbox
              overflow: 'hidden' // Ensure this box doesn't grow
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </div>
  );
}
