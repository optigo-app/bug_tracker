import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Stack,
  Box,
  Typography,
  Paper,
  IconButton
} from '@mui/material';
import Draggable from 'react-draggable';
import { FilterX, X } from 'lucide-react';
import CustomDateRangePicker from '@/components/DateRangePicker';

function PaperComponent(props) {
  const nodeRef = React.useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} ref={nodeRef} />
    </Draggable>
  );
}

export default function AdvancedFilterDialog({
  open,
  onClose,
  advFilters,
  setAdvFilters,
  statusOptions,
  priorityOptions,
  developers,
  taskAssignees
}) {
  // Use a local state for the dialog so changes don't apply until "Apply" is clicked
  const [localFilters, setLocalFilters] = useState(advFilters);

  // Sync local filters when dialog opens
  React.useEffect(() => {
    if (open) {
      setLocalFilters(advFilters);
    }
  }, [open, advFilters]);

  const handleApply = () => {
    setAdvFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const cleared = {
      taskNo: '',
      bugNo: '',
      status: null,
      priority: null,
      assignee: null,
      reporter: null,
      startDate: { startDate: '', endDate: '' },
      dueDate: { startDate: '', endDate: '' }
    };
    setLocalFilters(cleared);
    setAdvFilters(cleared);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle
        style={{ cursor: 'move' }}
        id="draggable-dialog-title"
        sx={{
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5
        }}
      >
        <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem' }}>
          Advanced Filters
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#64748B' }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          
          <Stack direction="row" spacing={2}>
            <TextField
              label="Task No"
              size="small"
              fullWidth
              value={localFilters.taskNo}
              onChange={(e) => setLocalFilters({ ...localFilters, taskNo: e.target.value })}
              sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
            />
            <TextField
              label="Bug No"
              size="small"
              fullWidth
              value={localFilters.bugNo}
              onChange={(e) => setLocalFilters({ ...localFilters, bugNo: e.target.value })}
              sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Autocomplete
              size="small"
              fullWidth
              options={statusOptions}
              getOptionLabel={(option) => option.label || option}
              value={statusOptions.find(o => o.value === localFilters.status) || null}
              onChange={(e, val) => setLocalFilters({ ...localFilters, status: val ? (val.value) : null })}
              renderInput={(params) => (
                <TextField {...params} label="Status" sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }} />
              )}
            />
            <Autocomplete
              size="small"
              fullWidth
              options={priorityOptions}
              getOptionLabel={(option) => option.label || option}
              value={priorityOptions.find(o => o.id === localFilters.priority) || null}
              onChange={(e, val) => setLocalFilters({ ...localFilters, priority: val ? val.id : null })}
              renderInput={(params) => (
                <TextField {...params} label="Priority" sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }} />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Autocomplete
              size="small"
              fullWidth
              options={developers}
              getOptionLabel={(option) => option.name || option.id}
              value={developers.find(d => d.id === localFilters.assignee) || null}
              onChange={(e, val) => setLocalFilters({ ...localFilters, assignee: val ? val.id : null })}
              renderInput={(params) => (
                <TextField {...params} label="Assignee" sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }} />
              )}
            />
            <Autocomplete
              size="small"
              fullWidth
              options={developers}
              getOptionLabel={(option) => option.name || option.id}
              value={developers.find(d => d.id === localFilters.reporter) || null}
              onChange={(e, val) => setLocalFilters({ ...localFilters, reporter: val ? val.id : null })}
              renderInput={(params) => (
                <TextField {...params} label="Reporter" sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }} />
              )}
            />
          </Stack>

          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, mb: 0.5, display: 'block' }}>
              Created Date
            </Typography>
            <CustomDateRangePicker
              placeholder="Start Date Range"
              value={localFilters.startDate}
              onChange={(range) => setLocalFilters({ ...localFilters, startDate: range })}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, mb: 0.5, display: 'block' }}>
              Due Date
            </Typography>
            <CustomDateRangePicker
              placeholder="Due Date Range"
              value={localFilters.dueDate}
              onChange={(range) => setLocalFilters({ ...localFilters, dueDate: range })}
            />
          </Box>

        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
        <Button
          onClick={handleClear}
          startIcon={<FilterX size={16} />}
          sx={{
            color: '#64748B',
            textTransform: 'none',
            fontWeight: 600,
            mr: 'auto'
          }}
        >
          Clear Filters
        </Button>
        <Button
          onClick={onClose}
          sx={{
            color: '#64748B',
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{
            bgcolor: '#7367f0',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#6356e0',
              boxShadow: '0 2px 8px rgba(115, 103, 240, 0.3)'
            }
          }}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
}
