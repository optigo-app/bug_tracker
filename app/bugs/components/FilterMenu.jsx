import { Menu, Box, Typography, Stack, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';

export default function FilterMenu({ anchorEl, open, onClose, statusFilter, setStatusFilter }) {
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const data = sessionStorage.getItem('taskbugstatusData');
      if (data) {
        const parsed = JSON.parse(data);
        setStatusOptions(parsed.map(item => ({
          id: String(item.id),
          label: item.labelname || item.label || item.name || item.id
        })));
      }
    } catch (error) {
      console.error('Error loading status options:', error);
    }
  }, []);
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 180, mt: 1, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', mb: 1 }}>
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
            All Statuses
          </MenuItem>
          {statusOptions.map(opt => (
            <MenuItem
              key={opt.id}
              onClick={() => { setStatusFilter(opt.id); onClose(); }}
              selected={statusFilter === opt.id}
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
