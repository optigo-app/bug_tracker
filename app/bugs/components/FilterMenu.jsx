import { Menu, Box, Typography, Stack, MenuItem } from '@mui/material';

export default function FilterMenu({ anchorEl, open, onClose, statusFilter, setStatusFilter }) {
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
          {['ALL', 'OPEN', 'IN_PROGRESS', 'TESTING', 'CLOSED', 'REOPENED'].map(s => (
            <MenuItem
              key={s}
              onClick={() => { setStatusFilter(s); onClose(); }}
              selected={statusFilter === s}
              sx={{
                borderRadius: 1, fontSize: '0.75rem', fontWeight: 600,
                minHeight: 32, py: 0.5,
                '&.Mui-selected': { bgcolor: 'rgba(115, 103, 240, 0.08)', color: '#7367f0' }
              }}
            >
              {s.replace('_', ' ')}
            </MenuItem>
          ))}
        </Stack>
      </Box>
    </Menu>
  );
}
