import { Box, Typography } from '@mui/material';
import { priorityColors } from '@/utils/glocalfunc';

export default function PriorityBadge({ priority }) {
  // Handle string priority values (normalized labelname)
  const priorityLabel = typeof priority === 'string' ? priority : (priority?.label || priority);

  // Use global priorityColors based on label (lowercase for matching)
  const normalizedKey = priorityLabel.toLowerCase();
  const colorConfig = priorityColors[normalizedKey] || priorityColors.normal || { color: '#6D6B77', backgroundColor: '#F8FAFC' };

  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      bgcolor: colorConfig.backgroundColor || colorConfig.bg,
      px: 1.25, py: 0.45, borderRadius: 2,
      border: `1px solid ${colorConfig.color}20`
    }}>
      <Typography sx={{
        fontSize: '0.68rem', fontWeight: 600,
        color: colorConfig.color,
        lineHeight: 1, letterSpacing: '0.05em'
      }}>
        {priorityLabel}
      </Typography>
    </Box>
  );
}
