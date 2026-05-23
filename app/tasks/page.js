'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Avatar,
  Stack,
  Chip,
  InputBase,
  Tooltip,
  CircularProgress,
  Button
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getRandomAvatarColor, getInitials, ImageUrl } from '@/utils/glocalfunc';
import {
  Search, Calendar, Building2,
  Clock, CheckCircle2, AlertCircle, TrendingUp, BarChart3
} from 'lucide-react';
import { fetchTaskDataFullApi } from '@/src/utils/taskApi';
import { useBugContext } from '@/contexts/BugContext';
import { statusColors, priorityColors } from '@/utils/glocalfunc';
import { encodeUrlParams } from '@/utils/urlParams';

export default function TasksPage() {
  const router = useRouter();
  const { fetchBugsGlobal } = useBugContext();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');

  useEffect(() => {
    // Detect if it's a page reload vs navigation
    const navigationEntries = performance.getEntriesByType('navigation');
    const isReload = navigationEntries.length > 0 && navigationEntries[0].type === 'reload';
    
    // Force refresh on reload, use cache on navigation
    fetchTaskData(isReload);
  }, []);

  const fetchTaskData = async (forceRefresh = false) => {
    try {
      const taskData = await fetchTaskDataFullApi();
      const tasks = taskData?.rd || [];

      // Fetch bugs list to count bugs task-wise
      let bugsData = [];
      try {
        bugsData = await fetchBugsGlobal(forceRefresh);
      } catch (bugError) {
        console.error("Error fetching bugs for task page:", bugError);
      }

      processAndSetTasks(tasks, bugsData);
    } catch (error) {
      console.error("Error in fetchTaskData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAndSetTasks = (tasks, bugsData = []) => {
    const priorityData = JSON.parse(sessionStorage.getItem('taskpriorityData') || '[]');
    const statusData = JSON.parse(sessionStorage.getItem('taskstatusData') || '[]');
    const taskProject = JSON.parse(sessionStorage.getItem('taskprojectData') || '[]');
    const taskCategory = JSON.parse(sessionStorage.getItem('taskworkcategoryData') || '[]');
    const taskAssigneeData = JSON.parse(sessionStorage.getItem('taskAssigneeData') || '[]');

    const enhanceTask = (task) => {
      const priority = priorityData?.find((item) => item?.id == task?.priorityid);
      const status = statusData?.find((item) => item?.id == task?.statusid);
      const project = taskProject?.find((item) => item?.id == task?.projectid);
      const category = taskCategory?.find((item) => item?.id == task?.workcategoryid);

      const assigneeIdArray = task?.assigneids?.split(",")?.map((id) => Number(id)) || [];

      const matchedAssignees = taskAssigneeData
        ?.filter((user) => assigneeIdArray?.includes(user.id))
        ?.map((user) => ({
          ...user,
        }));

      const taskIdVal = String(task.taskid || task.id || '');
      const bugCount = bugsData.filter(bug => String(bug.taskId || '') === taskIdVal).length;

      return {
        ...task,
        id: task.taskid || task.id || Math.random(),
        priority: priority ? priority?.labelname : "",
        status: status ? status?.labelname : "",
        taskPr: project ? project?.labelname : "",
        assignee: matchedAssignees ?? [],
        category: category?.labelname,
        startDate: task.StartDate,
        bugCount: bugCount
      };
    };
    
    const finalTasks = tasks?.map((task) => enhanceTask(task)) || [];
    setTasks(finalTasks);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.taskname?.toLowerCase().includes(search.toLowerCase()) ||
      t.taskno?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesProject = projectFilter === 'ALL' || t.taskPr === projectFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  // Active filter count
  const activeFilterCount = [statusFilter, priorityFilter, projectFilter].filter(f => f !== 'ALL').length;

  // Calculate stats
  const stats = {
    total: tasks.length,
    open: tasks.filter(t => !t.status || t.status?.toLowerCase() === 'open').length,
    inProgress: tasks.filter(t => t.status?.toLowerCase() === 'in progress').length,
    completed: tasks.filter(t => t.status?.toLowerCase() === 'completed' || t.status?.toLowerCase() === 'closed').length,
    overdue: tasks.filter(t => t.DeadLineDate && new Date(t.DeadLineDate) < new Date() && t.status?.toLowerCase() !== 'completed').length
  };

  const taskColumns = [
    {
      field: 'taskname',
      headerName: 'TASK TITLE',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography
              sx={{
                fontWeight: 700,
                color: '#7367f0',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                bgcolor: 'rgba(115, 103, 240, 0.08)',
                px: 0.8,
                py: 0.2,
                borderRadius: 1
              }}
            >
              {params.row.taskno}
            </Typography>
            <Typography
              onClick={() => {
                if (params.row.taskno) {
                  const encodedParams = encodeUrlParams({
                    taskno: params.row.taskno,
                    taskname: params.row.taskname || '',
                    taskid: params.row.taskid || params.row.id || '',
                    assigneeids: params.row.assigneids || '',
                    dueDate: params.row.DeadLineDate || ''
                  });
                  router.push(`/bugs?data=${encodedParams}`);
                }
              }}
              sx={{
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#444050',
                lineHeight: 1.2,
                mb: 0.5,
                cursor: 'pointer',
                '&:hover': {
                  color: '#7367f0',
                  textDecoration: 'underline'
                }
              }}
            >
              {params.value}
            </Typography>
          </Stack>
        </Box>
      )
    },
    {
      field: 'taskPr',
      headerName: 'PROJECT',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value ? (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#A8AAAE' }}>
              <Building2 size={12} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>{params.value}</Typography>
            </Stack>
          ) : (
            <Typography sx={{ fontSize: '0.8rem', color: '#A8AAAE' }}>-</Typography>
          )}
        </Box>
      )
    },
     {
      field: 'startDate',
      headerName: 'START DATE',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value ? (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#EA5455' }}>
              <Calendar size={12} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {new Date(params.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </Typography>
            </Stack>
          ) : (
            <Typography sx={{ fontSize: '0.8rem', color: '#A8AAAE' }}>-</Typography>
          )}
        </Box>
      )
    },
    {
      field: 'DeadLineDate',
      headerName: 'DUE DATE',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value ? (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#EA5455' }}>
              <Calendar size={12} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {new Date(params.value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </Typography>
            </Stack>
          ) : (
            <Typography sx={{ fontSize: '0.8rem', color: '#A8AAAE' }}>-</Typography>
          )}
        </Box>
      )
    },
    {
      field: 'assignee',
      headerName: 'TEAM',
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={-1} alignItems="center" sx={{ height: '100%' }}>
          {params.value?.slice(0, 3).map((user, i) => {
            const userImageSrc = ImageUrl(user.id);
            const avatarColor = getRandomAvatarColor(user.firstname);
            return (
              <Tooltip key={user.id || i} title={`${user.firstname} ${user.lastname}`}>
                <Avatar
                  src={userImageSrc}
                  sx={{
                    width: 28, height: 28, border: '2px solid white',
                    fontSize: '0.65rem', fontWeight: 800,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    bgcolor: avatarColor
                  }}
                >
                  {getInitials(user.firstname)}
                </Avatar>
              </Tooltip>
            );
          })}
          {params.value?.length > 3 && (
            <Avatar sx={{ width: 28, height: 28, border: '2px solid white', fontSize: '0.65rem', bgcolor: '#F1F5F9', color: '#6D6B77', fontWeight: 700 }}>
              +{params.value.length - 3}
            </Avatar>
          )}
        </Stack>
      )
    },
    {
      field: 'bugCount',
      headerName: 'BUGS',
      width: 100,
      renderCell: (params) => {
        const count = params.value || 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            {count > 0 ? (
              <Chip
                icon={<AlertCircle size={12} style={{ color: '#EA5455' }} />}
                label={count}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#EA5455',
                  bgcolor: 'rgba(234, 84, 85, 0.1)',
                  border: '1px solid rgba(234, 84, 85, 0.2)',
                  borderRadius: '4px',
                  '& .MuiChip-icon': {
                    marginLeft: '4px',
                    marginRight: '-4px'
                  }
                }}
              />
            ) : (
              <Typography sx={{ fontSize: '0.8rem', color: '#A8AAAE', fontWeight: 500 }}>
                0
              </Typography>
            )}
          </Box>
        );
      }
    },
    {
      field: 'category',
      headerName: 'CATEGORY',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {params.value ? (
            <Chip
              label={params.value}
              size="small"
              sx={{
                fontWeight: 600, fontSize: '0.75rem',
                color: '#475569', bgcolor: '#F1F5F9',
                borderRadius: '4px'
              }}
            />
          ) : (
            <Typography sx={{ fontSize: '0.8rem', color: '#A8AAAE', fontStyle: 'italic' }}>
              No category
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 130,
      renderCell: (params) => {
        const status = params.value?.toLowerCase() || '';
        const style = statusColors[status] || { color: '#4B465C', backgroundColor: '#F1F5F9' };
        return (
          <Chip
            label={params.value || 'Open'}
            size="small"
            sx={{
              fontWeight: 600, fontSize: '0.75rem',
              color: style.color, bgcolor: style.backgroundColor,
              borderRadius: '4px', textTransform: 'uppercase'
            }}
          />
        );
      }
    },
    {
      field: 'priority',
      headerName: 'PRIORITY',
      width: 110,
      renderCell: (params) => {
        const priority = params.value?.toLowerCase() || '';
        const style = priorityColors[priority] || { color: '#A8AAAE', backgroundColor: '#F2F2F3' };
        return (
          <Chip
            label={params.value || 'Medium'}
            size="small"
            sx={{
              fontWeight: 700, fontSize: '0.75rem',
              color: style.color, bgcolor: style.backgroundColor || style.bgcolor,
              borderRadius: '4px', textTransform: 'uppercase'
            }}
          />
        );
      }
    }
  ];

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: '#FAFBFC'
    }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2, bgcolor: 'white', borderBottom: '1px solid #F1F5F9' }}>
        {/* Stats Cards */}
        <Stack direction="row" spacing={2} mb={3}>
          <Paper sx={{ flex: 1, p: 2, borderRadius: 2, border: '1px solid #F1F5F9', bgcolor: '#FAFBFC' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, mb: 0.5 }}>Total Tasks</Typography>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#1A202C' }}>{stats.total}</Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={24} color="#7367f0" />
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ flex: 1, p: 2, borderRadius: 2, border: '1px solid #F1F5F9', bgcolor: '#FAFBFC' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, mb: 0.5 }}>In Progress</Typography>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#7367f0' }}>{stats.inProgress}</Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} color="#7367f0" />
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ flex: 1, p: 2, borderRadius: 2, border: '1px solid #F1F5F9', bgcolor: '#FAFBFC' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, mb: 0.5 }}>Completed</Typography>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981' }}>{stats.completed}</Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} color="#10B981" />
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ flex: 1, p: 2, borderRadius: 2, border: '1px solid #F1F5F9', bgcolor: '#FAFBFC' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, mb: 0.5 }}>Overdue</Typography>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#EF4444' }}>{stats.overdue}</Typography>
              </Box>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={24} color="#EF4444" />
              </Box>
            </Stack>
          </Paper>
        </Stack>

        {/* Filters & Actions */}
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              bgcolor: 'white',
              flex: 1,
              minWidth: 250
            }}
          >
            <Search size={18} color="#94A3B8" />
            <InputBase
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ ml: 1, flex: 1, fontSize: '0.875rem', fontWeight: 500 }}
            />
          </Paper>

          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ 
              minWidth: 140,
              '& .MuiInputBase-root': { borderRadius: 2, fontSize: '0.875rem', bgcolor: 'white' }
            }}
            SelectProps={{ native: true }}
          >
            <option value="ALL">All Status</option>
            {Array.from(new Set(tasks.map(t => t.status))).filter(Boolean).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ 
              minWidth: 140,
              '& .MuiInputBase-root': { borderRadius: 2, fontSize: '0.875rem', bgcolor: 'white' }
            }}
            SelectProps={{ native: true }}
          >
            <option value="ALL">All Priority</option>
            {Array.from(new Set(tasks.map(t => t.priority))).filter(Boolean).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            sx={{ 
              minWidth: 140,
              '& .MuiInputBase-root': { borderRadius: 2, fontSize: '0.875rem', bgcolor: 'white' }
            }}
            SelectProps={{ native: true }}
          >
            <option value="ALL">All Projects</option>
            {Array.from(new Set(tasks.map(t => t.taskPr))).filter(Boolean).map(pr => (
              <option key={pr} value={pr}>{pr}</option>
            ))}
          </TextField>

          {activeFilterCount > 0 && (
            <Button
              size="small"
              onClick={() => {
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setProjectFilter('ALL');
              }}
              sx={{
                textTransform: 'none',
                fontSize: '0.875rem',
                color: '#64748B',
                '&:hover': { bgcolor: '#F8FAFC' }
              }}
            >
              Clear ({activeFilterCount})
            </Button>
          )}
        </Stack>
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, minHeight: 0, p: 3, pt: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={40} thickness={4} sx={{ color: '#7367f0' }} />
              <Typography sx={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500 }}>
                Loading tasks...
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Paper sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #F1F5F9',
            boxShadow: 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <DataGrid
              rows={filteredTasks}
              columns={taskColumns}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 25 }
                }
              }}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderColor: '#F5F7FA',
                  fontSize: '0.875rem',
                  '&:focus-within': { outline: 'none' }
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#F8FAFC',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  borderBottom: '2px solid #F1F5F9',
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 700,
                    color: '#64748B'
                  }
                },
                '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
                '& .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#FAFBFC' }
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '2px solid #F1F5F9',
                  minHeight: '52px !important',
                  bgcolor: '#FAFBFC'
                }
              }}
            />
          </Paper>
        )}
      </Box>
    </Box>
  );
}
