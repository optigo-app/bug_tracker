import { Box, Typography } from '@mui/material';
import { statusColors } from '@/utils/glocalfunc';

export default function StatusBadge({ status }) {
  // Handle string status values (normalized labelname)
  const statusLabel = typeof status === 'string' ? status : (status?.label || status);

  // Use global statusColors based on label (lowercase for matching)
  const normalizedKey = statusLabel;
  const colorConfig = statusColors[normalizedKey];

  return (
    <Box sx={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      bgcolor: colorConfig?.backgroundColor, 
      borderRadius: '16px', 
      px: 1, 
      py: 0.35 
    }}>
      <Typography sx={{ 
        fontSize: '0.65rem', 
        fontWeight: 700, 
        color: colorConfig?.color, 
        lineHeight: 1,
        letterSpacing: '0.02em',
      }}>
        {statusLabel}
      </Typography>
    </Box>
  );
}
  