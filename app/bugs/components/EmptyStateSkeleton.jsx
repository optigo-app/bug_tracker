import { Box, Stack, Skeleton, Typography, Button } from '@mui/material';
import { Fade } from '@mui/material';
import { Plus, Inbox } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function EmptyStateSkeleton({ onCreate, isDeveloper = false }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <Fade in={true} timeout={300}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'column',
        gap: 3,
        p: 4
      }}>
        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Inbox size={40} color="#d0d0d0" />
        </Box>
        
        <Stack spacing={1} alignItems="center" textAlign="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            No Bug Selected
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-2nd-color)', fontWeight: 500, maxWidth: 300 }}>
            Select a bug from the list to view details, or create a new bug to get started.
          </Typography>
        </Stack>

        {onCreate && !isDeveloper && (
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={onCreate}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              px: 3,
              py: 1,
              background: 'linear-gradient(270deg, #7367f0 0%, #8e85f3 100%)',
              boxShadow: '0 4px 12px 0 rgba(115, 103, 240, 0.3)',
              textTransform: 'none',
              '&:hover': {
                boxShadow: '0 6px 16px 0 rgba(115, 103, 240, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s'
            }}
          >
            Create Bug
          </Button>
        )}
      </Box>
    </Fade>
  );
}
