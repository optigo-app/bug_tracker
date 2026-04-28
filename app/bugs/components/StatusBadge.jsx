import { Box, Typography } from '@mui/material';
import { statusColors } from '@/utils/glocalfunc';

export default function StatusBadge({ status }) {
  // Handle string status values (normalized labelname)
  const statusLabel = typeof status === 'string' ? status : (status?.label || status);

  // Use global statusColors based on label (lowercase for matching)
  const normalizedKey = statusLabel.toLowerCase();
  const colorConfig = statusColors[normalizedKey] || { color: '#6D6B77', backgroundColor: '#F8FAFC' };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, bgcolor: colorConfig.backgroundColor, border: `1px solid ${colorConfig.color}30`, borderRadius: 1.5, px: 1, py: 0.35 }}>
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: colorConfig.color, lineHeight: 1 }}>{statusLabel}</Typography>
    </Box>
  );
}
  