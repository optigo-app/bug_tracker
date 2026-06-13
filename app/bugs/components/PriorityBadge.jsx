import { Box, Typography } from '@mui/material';
import { priorityColors } from '@/utils/glocalfunc';

export default function PriorityBadge({ priority, py = 0.35 , px = 1, fontSize = '0.65rem'}) {
  // Handle string priority values (normalized labelname)
  const priorityLabel = typeof priority === 'string' ? priority : (priority?.label || priority);

  // Use global priorityColors based on label (lowercase for matching)
  const normalizedKey = String(priorityLabel || '').toLowerCase();
  const colorConfig = priorityColors[normalizedKey] || priorityColors.normal || { color: '#6D6B77', backgroundColor: '#fafafa' };

  return (
    <Box sx={{
      display: 'inline-flex', 
      alignItems: 'center', 
      bgcolor: colorConfig.backgroundColor || colorConfig.bg,
      borderRadius: '16px', 
      px: px, 
      py: py
    }}>
      <Typography sx={{
        fontSize: fontSize, 
        fontWeight: 600,
        color: colorConfig.color,
        lineHeight: 1, 
        letterSpacing: '0.02em',
        textTransform: 'capitalize'
      }}>
        {priorityLabel}
      </Typography>
    </Box>
  );
}
