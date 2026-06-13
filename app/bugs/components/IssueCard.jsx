import { Box, Typography, Stack, Tooltip, Button } from '@mui/material';
import { Building2, Paperclip, MessageSquareText } from 'lucide-react';
import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDate } from '../constants';

export default function IssueCard({ bug, isSelected, onClick, reassignInfo, onUndoReassign }) {
  const hasComments = bug.commentCount > 0;
  const hasAttach = bug.attachmentCount > 0;
  const priority = typeof bug.priority === 'object' ? String(bug.priority?.label || '').toUpperCase() : String(bug.priority || '').toUpperCase();
  const isHighPriority = priority === 'CRITICAL';

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
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        bgcolor: isSelected
          ? '#F0EFFF'
          : isHighPriority
            ? 'rgba(239, 68, 68, 0.03)'
            : 'white',
        borderBottom: '1px solid #e5e7eb',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&:hover': {
          bgcolor: isSelected
            ? '#E8E5FE'
            : isHighPriority
              ? 'rgba(239, 68, 68, 0.06)'
              : '#F9FAFB'
        }
      }}
    >
      <Stack spacing={0.75}>
        {/* Row 1: Top Meta Info & Top Right Chips */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#64748B', flexWrap: 'wrap', rowGap: 0.5 }}>
            {bug.bugNo && (
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#7367f0', fontFamily: 'monospace' }}>
                {bug.bugNo}
              </Typography>
            )}
            {bug.taskNo && (
              <>
                {bug.bugNo && <Typography sx={{ fontSize: '0.7rem', color: '#CBD5E1' }}>•</Typography>}
                <Tooltip title={bug.taskName || 'Task'} arrow>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, fontFamily: 'monospace' }}>
                    {bug.taskNo}
                  </Typography>
                </Tooltip>
              </>
            )}
            {bug.projectName && (
              <>
                {(bug.bugNo || bug.taskNo) && <Typography sx={{ fontSize: '0.7rem', color: '#CBD5E1' }}>•</Typography>}
                <Stack direction="row" spacing={0.4} alignItems="center">
                  <Building2 size={12} />
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{bug.projectName}</Typography>
                </Stack>
              </>
            )}
          </Stack>

          {/* Top Right Comment Chip */}
          {hasComments && (
            <Tooltip title={`${bug.commentCount} comment${bug.commentCount > 1 ? 's' : ''}`} arrow>
              <Box sx={{
                bgcolor: 'rgba(115, 103, 240, 0.08)',
                borderRadius: '6px',
                px: 0.8, py: 0.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.4,
                border: '1px solid rgba(115, 103, 240, 0.12)',
                ml: 1
              }}>
                <MessageSquareText size={11} color="#7367f0" />
                <Typography sx={{ fontSize: '0.65rem', color: '#7367f0', fontWeight: 700 }}>{bug.commentCount}</Typography>
              </Box>
            </Tooltip>
          )}
        </Stack>

        {/* Row 2: Title */}
        <Typography
          sx={{
            fontSize: '0.85rem', fontWeight: 600, color: 'var(-title-color)', lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis'
          }}
        >
          {bug.title}
        </Typography>

        {/* Row 3: Footer */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
          {/* Left Side: Badges & Icons */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Stack direction="row" spacing={0.75} alignItems="center">
              {bug.status && <StatusBadge status={bug.status} />}
              {bug.priority && <PriorityBadge priority={bug.priority} />}
            </Stack>

            {hasAttach && (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: '#94A3B8' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Paperclip size={13} />
                </Box>
              </Stack>
            )}
          </Stack>

          {/* Right Side: Date & Undo */}
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
            <Typography sx={{ fontSize: '0.65rem', color: 'var(--text-2nd-color)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {formatDate(bug.entrydate)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
