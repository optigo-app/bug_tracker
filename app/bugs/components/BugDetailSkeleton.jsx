import { Box, Stack, Fade } from '@mui/material';

export default function BugDetailSkeleton() {
  return (
    <Fade in={true} timeout={300}>
      <Box sx={{ p: 4, height: '100%', bgcolor: '#FAFBFD', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 80, height: 28, bgcolor: '#f5f5f5', borderRadius: 1.5 }} />
        <Box sx={{ flex: 1, height: 28, bgcolor: '#f5f5f5', borderRadius: 1.5 }} />
      </Box>

      {/* Attachments Placeholder */}
      <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ width: 14, height: 14, bgcolor: '#f5f5f5', borderRadius: '50%' }} />
          <Box sx={{ width: 100, height: 14, bgcolor: '#f5f5f5', borderRadius: 1 }} />
        </Box>
        <Box sx={{ width: '100%', height: '25vh', bgcolor: '#f5f5f5', borderRadius: 2 }} />
      </Box>

      {/* Description */}
      <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ width: 14, height: 14, bgcolor: '#f5f5f5', borderRadius: '50%' }} />
          <Box sx={{ width: 100, height: 14, bgcolor: '#f5f5f5', borderRadius: 1 }} />
        </Box>
        <Stack spacing={1.5}>
          <Box sx={{ width: '100%', height: 16, bgcolor: '#f5f5f5', borderRadius: 1 }} />
          <Box sx={{ width: '100%', height: 16, bgcolor: '#f5f5f5', borderRadius: 1 }} />
          <Box sx={{ width: '80%', height: 16, bgcolor: '#f5f5f5', borderRadius: 1 }} />
        </Stack>
      </Box>

      {/* Comments */}
      <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0', flex: 1 }}>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Box sx={{ width: 14, height: 14, bgcolor: '#f5f5f5', borderRadius: '50%' }} />
          <Box sx={{ width: 150, height: 16, bgcolor: '#f5f5f5', borderRadius: 1 }} />
        </Box>
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#f5f5f5' }} />
              <Box sx={{ flex: 1, p: 1.5, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ width: '40%', height: 14, bgcolor: '#f5f5f5', borderRadius: 1, mb: 1 }} />
                <Box sx={{ width: '90%', height: 14, bgcolor: '#f5f5f5', borderRadius: 1, mb: 0.5 }} />
                <Box sx={{ width: '60%', height: 14, bgcolor: '#f5f5f5', borderRadius: 1 }} />
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
    </Fade>
  );
}
