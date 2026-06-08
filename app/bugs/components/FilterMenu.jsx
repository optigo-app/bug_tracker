import { Menu, Box, Typography, Stack, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import { getStatusOptions } from '@/components/bugModal/constants';

export default function FilterMenu({ anchorEl, open, onClose, statusFilter, setStatusFilter, currentUser }) {
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    setStatusOptions(getStatusOptions(currentUser, true));
  }, [currentUser]);
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 180, mt: 1, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-2nd-color)', textTransform: 'uppercase', mb: 1 }}>
          Status Filter
        </Typography>
        <Stack spacing={0.5}>
          <MenuItem
            key="ALL"
            onClick={() => { setStatusFilter('ALL'); onClose(); }}
            selected={statusFilter === 'ALL'}
            sx={{
              borderRadius: 1, fontSize: '0.75rem', fontWeight: 600,
              minHeight: 32, py: 0.5,
              '&.Mui-selected': { bgcolor: 'rgba(115, 103, 240, 0.08)', color: '#7367f0' }
            }}
          >
            All Status
          </MenuItem>
          {statusOptions.map(opt => (
            <MenuItem
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); onClose(); }}
              selected={statusFilter === opt.value}
              sx={{
                borderRadius: 1, fontSize: '0.75rem', fontWeight: 600,
                minHeight: 32, py: 0.5,
                '&.Mui-selected': { bgcolor: 'rgba(115, 103, 240, 0.08)', color: '#7367f0' }
              }}
            >
              {opt.label}
            </MenuItem>
          ))}
        </Stack>
      </Box>
    </Menu>
  );
}
