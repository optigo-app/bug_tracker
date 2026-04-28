import { Box, Stack, Skeleton } from '@mui/material';
import { Fade } from '@mui/material';

export default function BugDetailSkeleton() {
  return (
    <Fade in={true} timeout={300}>
      <Box sx={{ p: 4, height: '100%' }}>
        {/* Header Skeleton */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" width="120px" height="28px" sx={{ bgcolor: '#f0f0f0', borderRadius: 1.5 }} />
          <Skeleton variant="rectangular" width="100%" height="36px" sx={{ bgcolor: '#f0f0f0', borderRadius: 1.5 }} />
        </Stack>

        {/* Metadata Skeleton */}
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" width="100%" height="70vh" sx={{ bgcolor: '#f0f0f0', borderRadius: 1.5 }} />
        </Stack>

        {/* Description Skeleton */}
        <Stack spacing={1.5} sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" width="100%" height="16px" sx={{ bgcolor: '#f0f0f0', borderRadius: 1.5 }} />
          <Skeleton variant="rectangular" width="100%" height="16px" sx={{ bgcolor: '#f0f0f0', borderRadius: 1.5 }} />
          <Skeleton variant="rectangular" width="80%" height="16px" sx={{ bgcolor: '#f0f0f0', borderRadius: 1.5 }} />
        </Stack>

        {/* Comments Section Skeleton */}
        <Stack spacing={2}>
          <Skeleton variant="rectangular" width="100px" height="20px" sx={{ bgcolor: '#f0f0f0', borderRadius: 1.5 }} />
          {[1, 2, 3].map((i) => (
            <Stack key={i} spacing={1.5} sx={{ p: 2, bgcolor: '#FAFBFC', borderRadius: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: '#f0f0f0' }} />
                <Skeleton variant="rectangular" width="120px" height={16} sx={{ bgcolor: '#f0f0f0', borderRadius: 1.5 }} />
              </Stack>
              <Skeleton variant="rectangular" width="100%" height={14} sx={{ bgcolor: '#f0f0f0', borderRadius: 1.5 }} />
              <Skeleton variant="rectangular" width="80%" height={14} sx={{ bgcolor: '#f0f0f0', borderRadius: 1.5 }} />
            </Stack>
          ))}
        </Stack>
      </Box>
    </Fade>
  );
}
