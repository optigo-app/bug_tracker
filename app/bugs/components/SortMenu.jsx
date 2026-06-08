import { Menu, Box, Typography, Stack, MenuItem } from '@mui/material';

export default function SortMenu({ anchorEl, open, onClose, sortBy, setSortBy }) {
  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'priority-high', label: 'Priority: High to Low' },
    { id: 'priority-low', label: 'Priority: Low to High' }
  ];

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 180, mt: 1, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-2nd-color)', textTransform: 'uppercase', mb: 1 }}>
          Sort By
        </Typography>
        <Stack spacing={0.5}>
          {sortOptions.map(opt => (
            <MenuItem
              key={opt.id}
              onClick={() => { setSortBy(opt.id); onClose(); }}
              selected={sortBy === opt.id}
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
