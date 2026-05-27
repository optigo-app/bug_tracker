import { Box, Stack, InputBase, IconButton, Tooltip, Chip, Button, Tabs, Tab } from '@mui/material';
import { Filter, SortAsc, SlidersHorizontal } from 'lucide-react';

export default function BugListHeader({
  bugCount,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  setFilterAnchorEl,
  setSortAnchorEl,
  statusOptions = [],
  filterScope,
  setFilterScope,
  setAdvFilterOpen,
  advFilters,
  setAdvFilters
}) {
  const isDateFilterActive = (filter) => filter?.startDate && filter?.endDate;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB');

  const hasAdvFilters = advFilters && (
    advFilters.taskNo || advFilters.bugNo || advFilters.status || advFilters.priority ||
    advFilters.assignee || advFilters.reporter ||
    isDateFilterActive(advFilters.startDate) || isDateFilterActive(advFilters.dueDate)
  );

  const handleClearAdvFilter = (key) => {
    if (key === 'startDate' || key === 'dueDate') {
      setAdvFilters({ ...advFilters, [key]: { startDate: '', endDate: '' } });
    } else {
      setAdvFilters({ ...advFilters, [key]: null });
    }
  };
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

        {/* <Tooltip title="Sort bugs">
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
        </Tooltip> */}

        <Tooltip title="Advanced Filters">
          <IconButton
            size="small"
            onClick={() => setAdvFilterOpen(true)}
            sx={{
              bgcolor: hasAdvFilters ? 'rgba(99, 102, 241, 0.1)' : '#F8FAFC',
              color: hasAdvFilters ? '#6366F1' : '#64748B',
              border: '1px solid',
              borderColor: hasAdvFilters ? '#6366F1' : '#E2E8F0',
              borderRadius: 1.5,
              width: 36,
              height: 36,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: hasAdvFilters ? 'rgba(99, 102, 241, 0.15)' : 'white',
                borderColor: '#6366F1',
                color: '#6366F1',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)'
              }
            }}
          >
            <SlidersHorizontal size={16} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Me vs Team Filter Switch */}
      <Tabs
        value={filterScope}
        onChange={(e, val) => setFilterScope(val)}
        variant="fullWidth"
        sx={{
          mt: 1.5,
          minHeight: 34,
          height: 34,
          bgcolor: '#F8FAFC',
          borderRadius: 2,
          p: 0.5,
          border: '1px solid #E2E8F0',
          '& .MuiTabs-flexContainer': {
            height: '100%',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            minHeight: '100%',
            height: '100%',
            borderRadius: 1.5,
            color: '#64748B',
            minWidth: 0,
            padding: '4px 8px',
            transition: 'all 0.15s ease',
            '&:hover': {
              color: '#7367f0',
            },
            '&.Mui-selected': {
              color: '#7367f0',
              bgcolor: 'white',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 1px rgba(0, 0, 0, 0.03)',
              fontWeight: 700,
            }
          },
          '& .MuiTabs-indicator': {
            display: 'none',
          }
        }}
      >
        <Tab label={`Me (${bugCount?.me})`} value="me" />
        <Tab label={`Team (${bugCount?.team})`} value="team" />
      </Tabs>

      {/* Active Filters */}
      {(statusFilter !== 'ALL' || search || hasAdvFilters) && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
          {statusFilter !== 'ALL' && (
            <Chip
              label={`Status: ${statusOptions.find(opt => (opt.value || opt.id) === statusFilter)?.label || statusFilter}`}
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

          {advFilters?.taskNo && (
            <Chip
              label={`Task No: ${advFilters.taskNo}`}
              size="small"
              onDelete={() => handleClearAdvFilter('taskNo')}
              sx={{ height: 26, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 1.5 }}
            />
          )}
          {advFilters?.bugNo && (
            <Chip
              label={`Bug No: ${advFilters.bugNo}`}
              size="small"
              onDelete={() => handleClearAdvFilter('bugNo')}
              sx={{ height: 26, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 1.5 }}
            />
          )}
          {advFilters?.status && (
            <Chip
              label={`Adv Status: ${statusOptions?.find(o => (o.value || o.id) === advFilters.status)?.label || advFilters.status}`}
              size="small"
              onDelete={() => handleClearAdvFilter('status')}
              sx={{ height: 26, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 1.5 }}
            />
          )}
          {advFilters?.priority && (
            <Chip
              label={`Priority Filter`}
              size="small"
              onDelete={() => handleClearAdvFilter('priority')}
              sx={{ height: 26, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 1.5 }}
            />
          )}
          {advFilters?.assignee && (
            <Chip
              label={`Assignee Filter`}
              size="small"
              onDelete={() => handleClearAdvFilter('assignee')}
              sx={{ height: 26, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 1.5 }}
            />
          )}
          {advFilters?.reporter && (
            <Chip
              label={`Reporter Filter`}
              size="small"
              onDelete={() => handleClearAdvFilter('reporter')}
              sx={{ height: 26, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 1.5 }}
            />
          )}
          {isDateFilterActive(advFilters?.startDate) && (
            <Chip
              label={`Start: ${formatDate(advFilters.startDate.startDate)} - ${formatDate(advFilters.startDate.endDate)}`}
              size="small"
              onDelete={() => handleClearAdvFilter('startDate')}
              sx={{ height: 26, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 1.5 }}
            />
          )}
          {isDateFilterActive(advFilters?.dueDate) && (
            <Chip
              label={`Due: ${formatDate(advFilters.dueDate.startDate)} - ${formatDate(advFilters.dueDate.endDate)}`}
              size="small"
              onDelete={() => handleClearAdvFilter('dueDate')}
              sx={{ height: 26, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 1.5 }}
            />
          )}

          {(statusFilter !== 'ALL' || search || hasAdvFilters) && (
            <Button
              size="small"
              onClick={() => {
                setStatusFilter('ALL');
                setSearch('');
                setAdvFilters({ taskNo: '', bugNo: '', status: null, priority: null, assignee: null, reporter: null, startDate: { startDate: '', endDate: '' }, dueDate: { startDate: '', endDate: '' } });
              }}
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
