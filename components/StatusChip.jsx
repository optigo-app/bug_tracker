import React from 'react';
import { Chip, Typography } from '@mui/material';
import { AlertCircle } from 'lucide-react';

const chipStyles = {
  category: {
    fontWeight: 600,
    fontSize: '0.75rem',
    color: '#475569',
    bgcolor: '#EAECEF',
    borderRadius: '8px'
  },
  priority: {
    fontWeight: 700,
    fontSize: '0.75rem',
    borderRadius: '8px',
    textTransform: 'uppercase'
  },
  status: {
    fontWeight: 600,
    fontSize: '0.75rem',
    borderRadius: '8px',
    textTransform: 'uppercase'
  },
  bugCount: {
    fontWeight: 700,
    fontSize: '0.75rem',
    color: '#EA5455',
    bgcolor: 'rgba(234, 84, 85, 0.1)',
    border: '1px solid rgba(234, 84, 85, 0.2)',
    borderRadius: '8px',
    '& .MuiChip-icon': {
      marginLeft: '4px',
      marginRight: '-4px'
    }
  }
};

const priorityColors = {
  high: { color: '#EA5455', backgroundColor: '#FEF2F2' },
  medium: { color: '#FF9F43', backgroundColor: '#FEF5E7' },
  low: { color: '#28C76F', backgroundColor: '#F0FDF4' },
  critical: { color: '#DC2626', backgroundColor: '#FEE2E2' }
};

const statusColors = {
  open: { color: 'var(--text-2nd-color)', backgroundColor: '#EAECEF' },
  'in progress': { color: '#7367f0', backgroundColor: '#EFF6FF' },
  completed: { color: '#10B981', backgroundColor: '#F0FDF4' },
  closed: { color: '#10B981', backgroundColor: '#F0FDF4' },
  pending: { color: '#FF9F43', backgroundColor: '#FEF5E7' },
  rejected: { color: '#EF4444', backgroundColor: '#FEF2F2' }
};

export default function StatusChip({ type = 'category', label, count, color, bgColor, sx }) {
  const getStyle = () => {
    if (type === 'priority' && color) {
      return { ...chipStyles.priority, color, backgroundColor: bgColor };
    }
    if (type === 'status' && color) {
      return { ...chipStyles.status, color, backgroundColor: bgColor };
    }
    return chipStyles[type] || chipStyles.category;
  };

  const getPriorityStyle = (label) => {
    const key = label?.toLowerCase();
    return priorityColors[key] || { color: '#A8AAAE', backgroundColor: '#F2F2F3' };
  };

  const getStatusStyle = (label) => {
    const key = label?.toLowerCase();
    return statusColors[key] || { color: '#4B465C', backgroundColor: '#EAECEF' };
  };

  const finalStyle = (() => {
    if (type === 'priority') {
      const style = getPriorityStyle(label);
      return { ...chipStyles.priority, color: style.color, backgroundColor: style.backgroundColor };
    }
    if (type === 'status') {
      const style = getStatusStyle(label);
      return { ...chipStyles.status, color: style.color, backgroundColor: style.backgroundColor };
    }
    return getStyle();
  })();

  if (type === 'bugCount' && count > 0) {
    return (
      <Chip
        icon={<AlertCircle size={12} style={{ color: '#EA5455' }} />}
        label={count}
        size="small"
        sx={{ ...chipStyles.bugCount, ...sx }}
      />
    );
  }

  if (!label && type !== 'bugCount') {
    return <Typography sx={{ fontSize: '0.8rem', color: '#A8AAAE', fontStyle: 'italic' }}>-</Typography>;
  }

  return (
    <>
      {label &&
        <Chip
          label={label || '-'}
          size="small"
          sx={finalStyle}
        />
      }
    </>
  );
}
