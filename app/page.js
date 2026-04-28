'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Paper,
  Stack,
  Button,
  CircularProgress
} from '@mui/material';
import { getAvatarColor, getInitials } from '@/utils/glocalfunc';
import { checkAuth } from '@/utils/authCheck';
import { getDashboardApi } from '@/app/api/dashboardApi';
import {
  Bug,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';


const StatCard = ({ title, value, subvalue, icon, color, trend }) => (
  <Card sx={{
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #E2E8F0',
    borderRadius: 3,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
    '&:hover': {
      boxShadow: `0 8px 24px ${color}20`,
      transform: 'translateY(-4px)',
      borderColor: color
    }
  }}>
    {/* Decorative gradient background */}
    <Box sx={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '120px',
      height: '120px',
      background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
      borderRadius: '50%',
      transform: 'translate(40%, -40%)'
    }} />
    
    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2.5 }}>
        <Box sx={{
          p: 1.5,
          borderRadius: 2.5,
          background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
          color: 'white',
          display: 'flex',
          boxShadow: `0 4px 12px ${color}40`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1) rotate(5deg)'
          }
        }}>
          {icon}
        </Box>
        {trend && (
          <Chip
            label={trend}
            size="small"
            icon={<TrendingUp size={14} />}
            sx={{
              height: 26,
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
        )}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{
        fontWeight: 700,
        mb: 1,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#64748B'
      }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: '#0F172A',
        mb: 0.5
      }}>
        {value}
      </Typography>
      {subvalue && (
        <Typography variant="caption" sx={{
          mt: 0.5,
          display: 'block',
          fontWeight: 500,
          color: '#94A3B8',
          fontSize: '0.8rem'
        }}>
          {subvalue}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/auto-login');
      return;
    }
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardApi();
      
      // The API returns data in rd, rd1, rd2, rd3 format
      const totalBugsResult = response?.rd || [];
      const statusCountsResult = response?.rd1 || [];
      const weeklyTrendResult = response?.rd2 || [];
      const recentActivityResult = response?.rd3 || [];

      const totalBugs = totalBugsResult[0]?.totalBugs || 0;

      // Count bugs by status from SP result
      const statusMap = {
        OPEN: 0,
        IN_PROGRESS: 0,
        TESTING: 0,
        CLOSED: 0,
        REOPENED: 0
      };

      statusCountsResult.forEach(row => {
        const status = row.status?.toUpperCase();
        if (statusMap.hasOwnProperty(status)) {
          statusMap[status] = row.count;
        }
      });

      // Calculate weekly trend from SP result
      const recentBugsCount = weeklyTrendResult.reduce((sum, row) => sum + row.bugs, 0);
      const bugsTrend = recentBugsCount > 0 ? `+${recentBugsCount}` : null;

      // Generate weekly data from SP result
      const weeklyData = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      // Initialize all 7 days with 0
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        weeklyData.push({
          name: days[date.getDay()],
          bugs: 0
        });
      }

      // Fill in actual counts from SP result
      weeklyTrendResult.forEach(row => {
        const date = new Date(row.date);
        const dayIndex = date.getDay();
        const matchingDay = weeklyData.find(d => d.name === days[dayIndex]);
        if (matchingDay) {
          matchingDay.bugs = row.bugs;
        }
      });

      // Prepare status distribution data
      const statusData = [
        { 
          name: 'Open', 
          value: statusMap.OPEN, 
          color: '#6366F1' 
        },
        { 
          name: 'In Progress', 
          value: statusMap.IN_PROGRESS, 
          color: '#818CF8' 
        },
        { 
          name: 'Testing', 
          value: statusMap.TESTING, 
          color: '#C7D2FE' 
        },
        { 
          name: 'Closed', 
          value: statusMap.CLOSED, 
          color: '#10B981' 
        }
      ];

      // Get recent activity from bug history
      const recentActivity = [];
      
      recentActivityResult.forEach(history => {
        const date = new Date(history.createdAt);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeStr;
        if (diffMins < 1) {
          timeStr = 'Just now';
        } else if (diffMins < 60) {
          timeStr = `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
          timeStr = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays === 0) {
          timeStr = `Today · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        } else if (diffDays === 1) {
          timeStr = `Yesterday · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        } else {
          timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        // Determine action string based on field
        let action = '';
        if (history.field === 'status') {
          action = `Status changed from ${history.oldValue} to ${history.newValue}`;
        } else if (history.field === 'assigneeId') {
          action = `Assigned to ${history.newValue}`;
        } else if (history.field === 'priority') {
          action = `Priority changed to ${history.newValue}`;
        } else if (history.field === 'attachments') {
          action = 'Attachment added';
        } else {
          action = `${history.field} updated`;
        }

        // Determine badge based on field/value
        let badge = null;
        const fieldLower = history.field?.toLowerCase() || '';
        const newValueLower = history.newValue?.toLowerCase() || '';
        
        if (newValueLower === 'open') {
          badge = { bg: '#FEF2F2', color: '#EF4444', label: 'NEW' };
        } else if (newValueLower === 'closed') {
          badge = { bg: '#F0FDF4', color: '#16A34A', label: 'RESOLVED' };
        } else if (fieldLower === 'attachments') {
          badge = { bg: '#EFF6FF', color: '#3B82F6', label: 'ATTACHMENT' };
        } else if (newValueLower === 'in_progress') {
          badge = { bg: '#FEF3C7', color: '#D97706', label: 'IN PROGRESS' };
        } else if (newValueLower === 'testing') {
          badge = { bg: '#FFFBEB', color: '#D97706', label: 'TESTING' };
        }

        recentActivity.push({
          id: history.bugId,
          user: history.userId,
          action: action,
          time: timeStr,
          badge
        });
      });

      // Prepare stats object
      const stats = {
        totalBugs,
        totalProjects: totalBugs, // Using bugs count for compatibility with frontend
        inProgress: statusMap.IN_PROGRESS,
        openBugs: statusMap.OPEN,
        closedBugs: statusMap.CLOSED,
        bugsTrend
      };

      setStats(stats);
      setWeeklyData(weeklyData);
      setStatusData(statusData);
      setRecentActivity(recentActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} thickness={4} sx={{ color: '#7367f0' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748B' }}>Loading dashboard...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{
      p: { xs: 2, md: 3 },
      bgcolor: '#F8FAFC',
      minHeight: '100vh',
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        width: '8px'
      },
      '&::-webkit-scrollbar-track': {
        bgcolor: '#E2E8F0',
        borderRadius: '10px'
      },
      '&::-webkit-scrollbar-thumb': {
        bgcolor: '#94A3B8',
        borderRadius: '10px',
        '&:hover': {
          bgcolor: '#64748B'
        }
      },
      scrollbarWidth: 'thin',
      scrollbarColor: '#94A3B8 #E2E8F0'
    }}>
      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Bugs"
            value={stats?.totalBugs || 0}
            subvalue={`Across ${stats?.totalProjects || 0} projects`}
            icon={<Bug size={24} />}
            color="#4F46E5"
            trend={stats?.bugsTrend}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="In Progress"
            value={stats?.inProgress || 0}
            subvalue="Currently being fixed"
            icon={<Clock size={24} />}
            color="#06B6D4"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Open Issues"
            value={stats?.openBugs || 0}
            subvalue="Needs attention"
            icon={<AlertCircle size={24} />}
            color="#F59E0B"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Resolved"
            value={stats?.closedBugs || 0}
            subvalue="Successfully fixed"
            icon={<CheckCircle2 size={24} />}
            color="#10B981"
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Weekly Activity Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E2E8F0',
            background: 'white',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
            }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  color: '#0F172A',
                  fontSize: '1.15rem'
                }}>
                  Weekly Activity
                </Typography>
                <Typography variant="caption" sx={{
                  fontWeight: 500,
                  color: '#64748B',
                  fontSize: '0.85rem'
                }}>
                  Reported bugs over the last 7 days
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                endIcon={<ArrowUpRight size={14} />}
                sx={{
                  borderRadius: 2,
                  borderColor: '#E2E8F0',
                  color: '#64748B',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#7367f0',
                    color: '#7367f0',
                    bgcolor: 'rgba(115, 103, 240, 0.05)'
                  }
                }}
              >
                View Report
              </Button>
            </Box>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorBugs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7367f0" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7367f0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bugs"
                    stroke="#7367f0"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBugs)"
                    dot={{ fill: '#7367f0', strokeWidth: 2, r: 4, stroke: 'white' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Bug Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E2E8F0',
            background: 'white',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
            }
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              mb: 0.5,
              color: '#0F172A',
              fontSize: '1.15rem'
            }}>
              Issue Distribution
            </Typography>
            <Typography variant="caption" sx={{
              fontWeight: 500,
              mb: 4,
              display: 'block',
              color: '#64748B',
              fontSize: '0.85rem'
            }}>
              By current status
            </Typography>
            <Box sx={{ width: '100%', height: 200, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats?.totalBugs || 0}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>TOTAL</Typography>
              </Box>
            </Box>
            <Stack spacing={2} sx={{ mt: 3 }}>
              {statusData?.map((item) => (
                <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{item.name}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Recent Activity List */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E2E8F0',
            background: 'white',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
            }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  color: '#0F172A',
                  fontSize: '1.15rem'
                }}>
                  Recent Activity
                </Typography>
                <Typography variant="caption" sx={{
                  fontWeight: 500,
                  color: '#64748B',
                  fontSize: '0.85rem'
                }}>
                  Latest updates from your team
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                endIcon={<ArrowUpRight size={14} />}
                sx={{
                  borderRadius: 2,
                  borderColor: '#E2E8F0',
                  color: '#64748B',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#7367f0',
                    color: '#7367f0',
                    bgcolor: 'rgba(115, 103, 240, 0.05)'
                  }
                }}
              >
                View All
              </Button>
            </Box>
            <List disablePadding>
              {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((activity, idx) => {
                const activityColors = getAvatarColor(activity.user);
                return (
                  <React.Fragment key={activity.id || idx}>
                    <ListItem sx={{
                      px: 2,
                      py: 2,
                      borderRadius: 2.5,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      alignItems: 'flex-start',
                      '&:hover': {
                        bgcolor: '#F8FAFC',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                      }
                    }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: activityColors.bg, color: activityColors.text, fontWeight: 700, fontSize: '0.875rem', width: 40, height: 40 }}>
                          {getInitials(activity.user)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        sx={{ flex: 1, minWidth: 0, mr: 2 }}
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{activity.user}</Typography>
                            {activity.badge && (
                              <Chip label={activity.badge.label} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: activity.badge.bg, color: activity.badge.color, letterSpacing: '0.04em' }} />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', color: '#64748B', lineHeight: 1.5 }}>
                            {activity.action}
                            <Box component="span" sx={{ color: '#94A3B8', ml: 0.5 }}>
                              · {activity.time}
                            </Box>
                          </Typography>
                        }
                      />
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          fontWeight: 700,
                          flexShrink: 0,
                          borderRadius: 2,
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #7367f0 0%, #9E95F5 100%)',
                          boxShadow: '0 2px 8px rgba(115, 103, 240, 0.25)',
                          px: 2,
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(115, 103, 240, 0.35)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        View
                      </Button>
                    </ListItem>
                    {idx < recentActivity.slice(0, 5).length - 1 && <Divider sx={{ borderStyle: 'dashed', mx: 1 }} />}
                  </React.Fragment>
                );
              }) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    No recent activity
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
