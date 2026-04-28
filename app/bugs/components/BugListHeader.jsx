import { Box, Stack, InputBase, IconButton, Tooltip, Chip, Button } from '@mui/material';
import { Filter, SortAsc } from 'lucide-react';

export default function BugListHeader({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  setFilterAnchorEl,
  setSortAnchorEl
}) {
  return (
    <Box sx={{
      p: 2,
      bgcolor: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 5
    }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 1,
          px: 1,
          py: 0.35,
          flex: 1.5,
          border: '1px solid #E2E8F0',
          transition: 'all 0.2s ease',
          '&:focus-within': {
            borderColor: '#6366F1',
            bgcolor: 'white',
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
          },
          '&:hover': {
            borderColor: '#CBD5E1',
            bgcolor: 'white'
          }
        }}>
          <InputBase
            placeholder="Search bugs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              ml: 0.2,
              flex: 1,
              fontSize: '0.85rem',
              fontWeight: 500,
              '& input::placeholder': {
                opacity: 1,
                fontWeight: 500
              }
            }}
          />
        </Box>

        <Tooltip title="Filter by status">
          <IconButton
            size="small"
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            sx={{
              bgcolor: statusFilter !== 'ALL' ? 'rgba(99, 102, 241, 0.1)' : '#F8FAFC',
              color: statusFilter !== 'ALL' ? '#6366F1' : '#64748B',
              border: '1px solid',
              borderColor: statusFilter !== 'ALL' ? '#6366F1' : '#E2E8F0',
              borderRadius: 1.5,
              width: 36,
              height: 36,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: statusFilter !== 'ALL' ? 'rgba(99, 102, 241, 0.15)' : 'white',
                borderColor: '#6366F1',
                color: '#6366F1',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)'
              }
            }}
          >
            <Filter size={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Sort bugs">
          <IconButton
            size="small"
            onClick={(e) => setSortAnchorEl(e.currentTarget)}
            sx={{
              bgcolor: '#F8FAFC',
              color: '#64748B',
              border: '1px solid #E2E8F0',
              borderRadius: 1.5,
              width: 36,
              height: 36,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'white',
                borderColor: '#6366F1',
                color: '#6366F1',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)'
              }
            }}
          >
            <SortAsc size={16} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Active Filters */}
      {(statusFilter !== 'ALL' || search) && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
          {statusFilter !== 'ALL' && (
            <Chip
              label={`Status: ${statusFilter.replace('_', ' ')}`}
              size="small"
              onDelete={() => setStatusFilter('ALL')}
              sx={{
                height: 26,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366F1',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 1.5,
                '& .MuiChip-deleteIcon': {
                  fontSize: '0.75rem',
                  '&:hover': {
                    color: '#DC2626'
                  }
                }
              }}
            />
          )}
          {search && (
            <Chip
              label={`Search: "${search}"`}
              size="small"
              onDelete={() => setSearch('')}
              sx={{
                height: 26,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366F1',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 1.5,
                '& .MuiChip-deleteIcon': {
                  fontSize: '0.75rem',
                  '&:hover': {
                    color: '#DC2626'
                  }
                }
              }}
            />
          )}
          {(statusFilter !== 'ALL' || search) && (
            <Button
              size="small"
              onClick={() => { setStatusFilter('ALL'); setSearch(''); }}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'none',
                '&:hover': { color: '#DC2626' }
              }}
            >
              Clear all
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
}
