'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    Stack,
    Fade,
    TextField,
    MenuItem,
    Select,
    InputAdornment,
    IconButton,
    Button,
    Chip,
    Tabs,
    Tab,
    Avatar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    Tooltip as RechartsTooltip
} from 'recharts';
import {
    BarChart3,
    PieChart as PieChartIcon,
    TrendingUp,
    Users,
    Search,
    X,
    Activity,
    CheckCircle2,
    Clock,
    Layout,
    List
} from 'lucide-react';
import { getAvatarColor, getInitials } from '@/utils/glocalfunc';
import { fetchBugListApi } from '@/app/api/buglistApi';

const COLORS = ['#6366F1', '#F43F5E', '#10B981', '#F59E0B', '#8B5CF6', '#3B82F6'];

const STATUS_MAP = {
    'OPEN': '#6366F1',
    'IN_PROGRESS': '#F59E0B',
    'RESOLVED': '#10B981',
    'CLOSED': '#64748B',
    'REOPENED': '#F43F5E'
};

const PRIORITY_MAP = {
    'CRITICAL': '#F43F5E',
    'HIGH': '#EF4444',
    'MEDIUM': '#F97316',
    'LOW': '#10B981'
};

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [bugs, setBugs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [filterProject, setFilterProject] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterDateRange, setFilterDateRange] = useState('30');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bugsRes, projectsRes] = await Promise.all([
                    fetchBugListApi(),
                    fetch('/api/projects')
                ]);

                setBugs(bugsRes?.rd || bugsRes?.rd1 || []);
                if (projectsRes.ok) {
                    const projectsData = await projectsRes.json();
                    setProjects(projectsData);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filtering Logic
    const filteredBugs = useMemo(() => {
        return bugs.filter(bug => {
            const matchSearch = bug.title.toLowerCase().includes(search.toLowerCase()) ||
                bug.id.toLowerCase().includes(search.toLowerCase());
            const matchProject = filterProject === 'all' || bug.projectId === filterProject;
            const matchStatus = filterStatus === 'all' || bug.status === filterStatus;
            const matchPriority = filterPriority === 'all' || bug.priority === filterPriority;

            if (filterDateRange !== 'all') {
                const bugDate = new Date(bug.createdAt);
                const limitDate = new Date();
                limitDate.setDate(limitDate.getDate() - parseInt(filterDateRange));
                if (bugDate < limitDate) return false;
            }

            return matchSearch && matchProject && matchStatus && matchPriority;
        });
    }, [bugs, search, filterProject, filterStatus, filterPriority, filterDateRange]);

    // Derived Chart Data
    const chartData = useMemo(() => {
        if (filteredBugs.length === 0) return { statusData: [], priorityData: [], assigneeData: [], trendData: [] };

        const statusCounts = filteredBugs.reduce((acc, bug) => {
            acc[bug.status] = (acc[bug.status] || 0) + 1;
            return acc;
        }, {});
        const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

        const priorityCounts = filteredBugs.reduce((acc, bug) => {
            acc[bug.priority] = (acc[bug.priority] || 0) + 1;
            return acc;
        }, {});
        const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));

        const assigneeCounts = filteredBugs.reduce((acc, bug) => {
            const name = bug.assigneeName || 'Unassigned';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
        const assigneeData = Object.entries(assigneeCounts)
            .map(([name, bugs]) => ({ name, bugs }))
            .sort((a, b) => b.bugs - a.bugs);

        const days = filterDateRange === 'all' ? 30 : parseInt(filterDateRange);
        const trendMap = {};
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            trendMap[dateStr] = { date: dateStr, created: 0, resolved: 0 };
        }

        filteredBugs.forEach(bug => {
            const createdDate = new Date(bug.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (trendMap[createdDate]) trendMap[createdDate].created++;

            if (bug.status === 'RESOLVED' || bug.status === 'CLOSED') {
                const resDate = new Date(bug.createdAt);
                resDate.setDate(resDate.getDate() + 2);
                const resDateStr = resDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (trendMap[resDateStr]) trendMap[resDateStr].resolved++;
            }
        });
        const trendData = Object.values(trendMap);

        return { statusData, priorityData, assigneeData, trendData };
    }, [filteredBugs, filterDateRange]);

    const stats = useMemo(() => {
        const total = filteredBugs.length;
        const resolved = filteredBugs.filter(b => b.status === 'RESOLVED' || b.status === 'CLOSED').length;
        const critical = filteredBugs.filter(b => b.priority === 'CRITICAL').length;
        const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        return { total, resolved, critical, resRate };
    }, [filteredBugs]);

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 120,
            renderCell: (p) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#6366F1', fontFamily: 'monospace' }}>{p.value}</Typography>
                </Box>
            )
        },
        {
            field: 'title',
            headerName: 'TITLE',
            flex: 1,
            minWidth: 250,
            renderCell: (p) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B' }}>{p.value}</Typography>
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (p) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    <Chip
                        label={p.value}
                        size="small"
                        sx={{
                            bgcolor: `${STATUS_MAP[p.value]}12`,
                            color: STATUS_MAP[p.value],
                            fontWeight: 900,
                            fontSize: '0.65rem',
                            borderRadius: 1.5,
                            border: `1px solid ${STATUS_MAP[p.value]}25`,
                            height: 24,
                            px: 0.5
                        }}
                    />
                </Box>
            )
        },
        {
            field: 'priority',
            headerName: 'PRIORITY',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (p) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    <Typography sx={{ color: PRIORITY_MAP[p.value], fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                        {p.value}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'assigneeName',
            headerName: 'ASSIGNEE',
            width: 150,
            renderCell: (p) => {
                const name = p.value || 'Unassigned';
                return (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                        <Avatar
                            sx={{
                                width: 26,
                                height: 26,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: getAvatarColor(name).bg,
                                color: getAvatarColor(name).text
                            }}
                        >
                            {getInitials(name)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.8125rem' }}>{name}</Typography>
                    </Stack>
                )
            }
        },
        {
            field: 'createdAt',
            headerName: 'DATE REPORTED',
            width: 140,
            align: 'right',
            headerAlign: 'right',
            renderCell: (p) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', width: '100%' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>
                        {new Date(p.value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                </Box>
            )
        }
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: '#6366F1' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Fade in timeout={600}>
                <Box>
                    {/* Header */}
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                                Reports & Analytics
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mt: 1, fontWeight: 500 }}>
                                Identify bottlenecks and track your team's velocity.
                            </Typography>
                        </Box>

                        <Tabs
                            value={currentTab}
                            onChange={(e, v) => setCurrentTab(v)}
                            sx={{
                                bgcolor: '#F1F5F9',
                                p: 0.5,
                                borderRadius: 2.5,
                                '& .MuiTabs-indicator': { display: 'none' },
                                '& .MuiTab-root': {
                                    minHeight: 40,
                                    borderRadius: 2,
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    color: '#64748B',
                                    '&.Mui-selected': { bgcolor: 'white', color: '#6366F1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
                                }
                            }}
                        >
                            <Tab icon={<Layout size={16} />} iconPosition="start" label="Overview" />
                            <Tab icon={<List size={16} />} iconPosition="start" label="Detailed Analysis" />
                        </Tabs>
                    </Box>

                    {/* Filter Bar */}
                    <Paper sx={{ p: 2, mb: 4, borderRadius: 4, border: '1px solid #F5F7FA', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search bugs..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search size={18} color="#94A3B8" />
                                                </InputAdornment>
                                            ),
                                            sx: { borderRadius: 2.5, bgcolor: '#F8FAFC' }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, md: 2.25 }}>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={filterProject}
                                    onChange={(e) => setFilterProject(e.target.value)}
                                    sx={{ borderRadius: 2.5, bgcolor: '#F8FAFC' }}
                                    displayEmpty
                                >
                                    <MenuItem value="all">All Projects</MenuItem>
                                    {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                                </Select>
                            </Grid>
                            <Grid size={{ xs: 6, md: 2.25 }}>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    sx={{ borderRadius: 2.5, bgcolor: '#F8FAFC' }}
                                >
                                    <MenuItem value="all">All Statuses</MenuItem>
                                    <MenuItem value="OPEN">Open</MenuItem>
                                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                                    <MenuItem value="CLOSED">Closed</MenuItem>
                                </Select>
                            </Grid>
                            <Grid size={{ xs: 6, md: 2.25 }}>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    sx={{ borderRadius: 2.5, bgcolor: '#F8FAFC' }}
                                >
                                    <MenuItem value="all">All Priorities</MenuItem>
                                    <MenuItem value="CRITICAL">Critical</MenuItem>
                                    <MenuItem value="HIGH">High</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="LOW">Low</MenuItem>
                                </Select>
                            </Grid>
                            <Grid size={{ xs: 6, md: 2.25 }}>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={filterDateRange}
                                    onChange={(e) => setFilterDateRange(e.target.value)}
                                    sx={{ borderRadius: 2.5, bgcolor: '#F8FAFC' }}
                                >
                                    <MenuItem value="7">Last 7 Days</MenuItem>
                                    <MenuItem value="30">Last 30 Days</MenuItem>
                                    <MenuItem value="90">Last 90 Days</MenuItem>
                                    <MenuItem value="all">All Time</MenuItem>
                                </Select>
                            </Grid>
                        </Grid>
                    </Paper>

                    {currentTab === 0 ? (
                        <Box>
                            {/* Quick Stats */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #F5F7FA' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>TOTAL ISSUES</Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{stats.total}</Typography>
                                            </Box>
                                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#EEF2FF', color: '#6366F1' }}><Activity size={24} /></Box>
                                        </Stack>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #F5F7FA' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>RESOLUTION RATE</Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981', mt: 0.5 }}>{stats.resRate}%</Typography>
                                            </Box>
                                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#ECFDF5', color: '#10B981' }}><CheckCircle2 size={24} /></Box>
                                        </Stack>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #F5F7FA' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>AVG RESOLUTION</Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>2.4d</Typography>
                                            </Box>
                                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FFF7ED', color: '#F97316' }}><Clock size={24} /></Box>
                                        </Stack>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #F5F7FA' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>CRITICAL BUGS</Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 800, color: '#F43F5E', mt: 0.5 }}>{stats.critical}</Typography>
                                            </Box>
                                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEF2F2', color: '#F43F5E' }}><TrendingUp size={24} /></Box>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Charts Row */}
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, lg: 8 }}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #F5F7FA', height: 400, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Issues Trend</Typography>
                                        <Box sx={{ flex: 1, minHeight: 0 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} /><stop offset="95%" stopColor="#6366F1" stopOpacity={0} /></linearGradient>
                                                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.1} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }} />
                                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 700 }} />
                                                    <Area type="monotone" dataKey="created" stroke="#6366F1" strokeWidth={3} fill="url(#colorCreated)" name="Created" />
                                                    <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} fill="url(#colorResolved)" name="Resolved" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, lg: 4 }}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #F5F7FA', height: 400, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Status Mix</Typography>
                                        <Box sx={{ flex: 1, minHeight: 0 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={chartData.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                                                        {chartData.statusData.map((e, i) => <Cell key={i} fill={STATUS_MAP[e.name] || COLORS[i % COLORS.length]} />)}
                                                    </Pie>
                                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 700 }} />
                                                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Box>
                            {/* Detailed View: Chart + Grid */}
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #F5F7FA', mb: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Analysis Data Grid</Typography>
                                                <Typography variant="caption" color="text.secondary">Showing {filteredBugs.length} filtered results</Typography>
                                            </Box>
                                            <Button variant="contained" startIcon={<Activity size={18} />} sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}>Export CSV</Button>
                                        </Stack>

                                        <Box sx={{ height: 600, width: '100%' }}>
                                            <DataGrid
                                                rows={filteredBugs}
                                                columns={columns}
                                                initialState={{
                                                    pagination: {
                                                        paginationModel: { page: 0, pageSize: 10 },
                                                    },
                                                }}
                                                pageSizeOptions={[10, 25, 50]}
                                                disableRowSelectionOnClick
                                                sx={{
                                                    border: 'none',
                                                    '& .MuiDataGrid-columnHeaders': {
                                                        bgcolor: '#F8FAFC',
                                                        color: '#475569',
                                                        fontWeight: 800,
                                                        fontSize: '0.7rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.08em',
                                                        borderBottom: '1px solid #EEF2F7',
                                                        minHeight: '48px !important'
                                                    },
                                                    '& .MuiDataGrid-columnHeaderTitle': {
                                                        fontWeight: 800
                                                    },
                                                    '& .MuiDataGrid-cell:focus': { outline: 'none' },
                                                    '& .MuiDataGrid-cell:focus-within': { outline: 'none' },
                                                    '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
                                                    '& .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
                                                    '& .MuiDataGrid-cell': {
                                                        borderColor: '#F5F7FA',
                                                        fontSize: '0.8125rem'
                                                    },
                                                    '& .MuiDataGrid-row:hover': { bgcolor: '#F8FAFC' },
                                                    '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #F5F7FA' },
                                                    '& .MuiDataGrid-virtualScroller': { mt: '0 !important' }
                                                }}
                                            />
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #F5F7FA', height: 350 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Priority Breakdown</Typography>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData.priorityData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} />
                                                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 700 }} />
                                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                                    {chartData.priorityData.map((e, i) => <Cell key={i} fill={PRIORITY_MAP[e.name] || '#6366F1'} />)}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #F5F7FA', height: 350 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Assignee Activity</Typography>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData.assigneeData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                                <XAxis type="number" axisLine={false} tickLine={false} />
                                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#1E293B' }} />
                                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 700 }} />
                                                <Bar dataKey="bugs" fill="#6366F1" radius={[0, 6, 6, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Box>
            </Fade>
        </Box>
    );
}
