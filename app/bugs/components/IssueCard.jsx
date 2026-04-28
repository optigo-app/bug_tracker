import { Box, Typography, Stack, Tooltip, Button } from '@mui/material';
import { Building2, Paperclip } from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

export default function IssueCard({ bug, isSelected, onClick, reassignInfo, onUndoReassign }) {
  const hasComments = bug.commentCount > 0;
  const hasAttach = bug.attachmentCount > 0;

  // Timer state for reassignment undo
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (reassignInfo?.timestamp && reassignInfo.bugId === bug.id) {
      const elapsed = Date.now() - reassignInfo.timestamp;
      const remaining = Math.max(0, 60000 - elapsed); // 1 minute in ms
      setTimeLeft(Math.ceil(remaining / 1000));

      if (remaining > 0) {
        const timer = setInterval(() => {
          const newElapsed = Date.now() - reassignInfo.timestamp;
          const newRemaining = Math.max(0, 60000 - newElapsed);
          setTimeLeft(Math.ceil(newRemaining / 1000));
          if (newRemaining <= 0) clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
      }
    } else {
      setTimeLeft(0);
    }
  }, [reassignInfo, bug.id]);

  return (
    <Box
      onClick={onClick}
      sx={{
        px: 2.5,
        py: 2,
        cursor: 'pointer',
        bgcolor: isSelected ? '#eef2ff' : 'white',
        borderBottom: '1px solid #E5E7EB',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        ...(isSelected && {
          boxShadow: 'inset 0 0 0 1px rgba(99, 102, 241, 0.1)'
        }),
        '&:hover': {
          bgcolor: isSelected ? '#e0e7ff' : '#F9FAFB',
          transform: 'translateX(2px)'
        }
      }}
    >
      {/* Row 1: ID, Project & Labels */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {bug.bugNo && (
            <Typography sx={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#7367f0',
              bgcolor: 'rgba(115, 103, 240, 0.1)',
              px: 0.6, py: 0.15, borderRadius: '4px',
              fontFamily: 'monospace'
            }}>
              {bug.bugNo ?? ''}
            </Typography>
          )}
          {bug.taskNo && (
            <Tooltip title={bug.taskName || 'Task'} arrow>
              <Typography sx={{
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#6b7280',
                bgcolor: '#e5e7eb',
                px: 0.6, py: 0.15, borderRadius: '4px',
                fontFamily: 'monospace',
                cursor: 'help'
              }}>
                {bug.taskNo}
              </Typography>
            </Tooltip>
          )}
          {bug.projectName && (
            <Stack direction="row" spacing={0.4} alignItems="center" sx={{ color: '#A5A3AE' }}>
              <Building2 size={11} />
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{bug.projectName}</Typography>
            </Stack>
          )}
        </Stack>

        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          {hasAttach && (
            <Box sx={{ bgcolor: 'rgba(115, 103, 240, 0.08)', borderRadius: '4px', p: 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Paperclip size={11} color="#7367f0" />
            </Box>
          )}
          {hasComments && (
            <Box sx={{ bgcolor: 'rgba(115, 103, 240, 0.08)', borderRadius: '4px', p: 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
              <MessageSquare size={11} color="#7367f0" />
              <Typography sx={{ fontSize: '0.6rem', color: '#7367f0', fontWeight: 700 }}>{bug.commentCount}</Typography>
            </Box>
          )}
        </Box>
      </Stack>

      {/* Row 2: Title */}
      <Typography
        sx={{
          fontSize: '0.85rem', fontWeight: 700, color: '#2F2B3D', lineHeight: 1.3,
          mb: 0.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis'
        }}
      >
        {bug.title}
      </Typography>

      {/* Row 3: Description snippet */}
      <Typography sx={{
        fontSize: '0.7rem',
        color: '#6F6B7D',
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        mb: 1,
        lineHeight: 1.3,
        textOverflow: 'ellipsis'
      }}>
        {bug.description || 'No description provided'}
      </Typography>

      {/* Row 4: Footer - Status, Priority & Date */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={0.75} alignItems="center">
          <StatusBadge status={bug.status} />
          <PriorityBadge priority={bug.priority} />
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {timeLeft > 0 && (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onUndoReassign?.();
              }}
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                px: 1,
                py: 0.25,
                minWidth: 'auto',
                height: 20,
                bgcolor: '#FEF3C7',
                color: '#D97706',
                borderRadius: 1,
                textTransform: 'none',
                '&:hover': { bgcolor: '#FDE68A' }
              }}
            >
              Undo ({timeLeft}s)
            </Button>
          )}
          <Typography sx={{ fontSize: '0.65rem', color: '#A5A3AE', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {new Date(bug.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
