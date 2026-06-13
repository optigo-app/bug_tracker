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
import { getRandomAvatarColor, ImageUrl } from '@/utils/glocalfunc';
import { checkAuth } from '@/utils/authCheck';
import { getDashboardApi } from '@/app/api/dashboardApi';
import {
  Bug,
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
    border: '1px solid #e0e0e0',
    borderRadius: 3,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #fafafa 100%)',
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
        color: 'var(--text-2nd-color)'
      }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{
        fontWeight: 800,
        letterSpacing: '-0.02em',
        mb: 0.5
      }}>
        {value}
      </Typography>
      {subvalue && (
        <Typography variant="caption" sx={{
          mt: 0.5,
          display: 'block',
          fontWeight: 500,
          color: 'var(--text-2nd-color)',
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
  const [taskAssignees, setTaskAssignees] = useState([]);

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/auto-login');
      return;
    }
    // Load task assignees from localStorage
    const taskAssigneeData = localStorage.getItem('taskAssigneeData');
    if (taskAssigneeData) {
      try {
        setTaskAssignees(JSON.parse(taskAssigneeData));
      } catch (error) {
        console.error('Error parsing taskAssigneeData:', error);
      }
    }
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardApi();
      const totalBugsResult = response?.rd || [];
      const statusCountsResult = response?.rd1 || [];
      const weeklyTrendResult = response?.rd2 || [];
      const recentActivityResult = response?.rd3 || [];
      const totalBugs = totalBugsResult[0]?.totalBugs || 0;
      const statusMap = {};
      statusCountsResult.forEach(row => {
        const statusId = row.statusId;
        if (statusId) {
          statusMap[statusId] = row.count;
        }
      });
      const recentBugsCount = weeklyTrendResult.reduce((sum, row) => sum + row.bugs, 0);
      const bugsTrend = recentBugsCount > 0 ? `+${recentBugsCount}` : null;
      const weeklyData = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        weeklyData.push({
          name: days[date.getDay()],
          bugs: 0
        });
      }
      weeklyTrendResult.forEach(row => {
        const date = new Date(row.date);
        const dayIndex = date.getDay();
        const matchingDay = weeklyData.find(d => d.name === days[dayIndex]);
        if (matchingDay) {
          matchingDay.bugs = row.bugs;
        }
      });
      const taskBugStatusData = JSON?.parse(localStorage.getItem('taskbugstatusData'));
      const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#8B5CF6', '#F97316', '#14B8A6', 'var(--text-2nd-color)'];
      const statusData = Object.entries(statusMap)
        .map(([statusId, count], index) => {
          const label = taskBugStatusData?.find(item => String(item?.id) === String(statusId));
          return {
            name: label?.labelname || `Status ${statusId}`,
            value: Number(count || 0),
            color: colors[index % colors.length],
            statusId
          };
        })
        .sort((a, b) => b.value - a.value);
      const recentActivity = [];
      recentActivityResult.forEach(history => {
        const date = new Date(history.entrydate);
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

        let action = '';
        let badge = null;
        if (history.fieldName === 'statusId' || history.field === 'statusId') {
          const oldStatusLabel = taskBugStatusData?.find(item => item.id == history.oldvalue)?.labelname || history.oldvalue;
          const newStatusLabel = taskBugStatusData?.find(item => item.id == history.newvalue)?.labelname || history.newvalue;
          action = `Status changed from ${oldStatusLabel} to ${newStatusLabel}`;
          const newValueLower = newStatusLabel?.toLowerCase() || '';
          if (newValueLower === 'new') {
            badge = { bg: '#FEF2F2', color: '#EF4444', label: 'NEW' };
          } else if (newValueLower === 'fixed' || newValueLower === 'closed') {
            badge = { bg: '#F0FDF4', color: '#16A34A', label: 'RESOLVED' };
          } else if (newValueLower === 'reopen') {
            badge = { bg: '#FEF3C7', color: '#D97706', label: 'REOPEN' };
          }
        } else if (history.fieldName === 'assigneeId' || history.field === 'assigneeId') {
          action = `Assigned to ${history.newvalue}`;
        } else if (history.fieldName === 'priority' || history.field === 'priority') {
          action = `Priority changed to ${history.newvalue}`;
        } else if (history.fieldName === 'attachments' || history.field === 'attachments') {
          action = 'Attachment added';
          badge = { bg: '#EFF6FF', color: '#3B82F6', label: 'ATTACHMENT' };
        } else {
          action = `${history.fieldName || history.field} updated`;
        }

        recentActivity.push({
          id: history.bugId,
          user: history.userid || history.userId,
          action: action,
          time: timeStr,
          badge
        });
      });
      const stats = {
        totalBugs,
        totalProjects: totalBugs,
        statusCounts: statusMap,
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#fafafa' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} thickness={4} sx={{ color: '#7367f0' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-2nd-color)' }}>Loading dashboard...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{
      p: { xs: 2, md: 3 },
      overflowY: 'auto',
    }}>
      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4} lg={3}>
          <StatCard
            title="Total Bugs"
            value={stats?.totalBugs || 0}
            subvalue="Across all projects"
            icon={<Bug size={24} />}
            color="#4F46E5"
            trend={stats?.bugsTrend}
          />
        </Grid>

        <Grid item xs={12} md={8} lg={9}>
          <Paper sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e0e0e0',
            background: 'white',
            height: '100%'
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Status Breakdown
              </Typography>
              <Chip
                label={`${statusData.length} statuses`}
                size="small"
                sx={{ fontWeight: 700, bgcolor: '#f5f5f5', color: '#475569' }}
              />
            </Stack>

            {statusData.length > 0 ? (
              <Grid container spacing={1.5}>
                {statusData.map((status) => (
                  <Grid key={status.statusId} item xs={6} sm={4} md={3} lg={2.4} >
                    <Box sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      px: 1.5,
                      py: 1.25,
                      minHeight: 84,
                      background: `linear-gradient(135deg, ${status.color}10 0%, #FFFFFF 70%)`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: status.color,
                        boxShadow: `0 6px 16px ${status.color}22`,
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <Stack direction="row" alignItems="center" spacing={0.8} sx={{ minWidth: 0 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: status.color, flexShrink: 0 }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#334155',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                          title={status.name}
                        >
                          {status.name}
                        </Typography>
                      </Stack>

                      <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', mt: 1 }}>
                        {status.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'var(--text-2nd-color)', fontWeight: 600 }}>
                  No status data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Weekly Activity Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e0e0e0',
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
                  fontSize: '1.15rem'
                }}>
                  Weekly Activity
                </Typography>
                <Typography variant="caption" sx={{
                  fontWeight: 500,
                  color: 'var(--text-2nd-color)',
                  fontSize: '0.85rem'
                }}>
                  Reported bugs over the last 7 days
                </Typography>
              </Box>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-2nd-color)', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-2nd-color)', fontSize: 12, fontWeight: 500 }}
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
        <Grid item xs={12} md={4}>
          <Paper sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e0e0e0',
            background: 'white',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
            }
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              mb: 0.5,
              fontSize: '1.15rem'
            }}>
              Issue Distribution
            </Typography>
            <Typography variant="caption" sx={{
              fontWeight: 500,
              mb: 4,
              display: 'block',
              color: 'var(--text-2nd-color)',
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
            <Grid container spacing={2} sx={{ mt: 3 }}>
              {statusData?.map((item) => (
                <Grid item xs={6} key={item.name}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{item.name}</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity List */}
        <Grid item xs={12}>
          <Paper sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e0e0e0',
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
                  fontSize: '1.15rem'
                }}>
                  Recent Activity
                </Typography>
                <Typography variant="caption" sx={{
                  fontWeight: 500,
                  color: 'var(--text-2nd-color)',
                  fontSize: '0.85rem'
                }}>
                  Latest updates from your team
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                endIcon={<ArrowUpRight size={14} />}
                onClick={() => router.push('/bugs')}
                sx={{
                  borderRadius: 2,
                  borderColor: '#e0e0e0',
                  color: 'var(--text-2nd-color)',
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
                const user = taskAssignees.find(u => String(u?.id) === String(activity.user) || String(u?.userid) === String(activity.user));
                const userName = user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() : activity.user;
                const colors = getRandomAvatarColor(userName || '');
                const userImageSrc = user ? ImageUrl({ empphoto: user.empphoto }) : null;
                return (
                  <React.Fragment key={activity.id || idx}>
                    <ListItem
                      onClick={() => activity.id && router.push(`/bugs?selectedId=${activity.id}`)}
                      sx={{
                        px: 2,
                        py: 2,
                        borderRadius: 2.5,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        alignItems: 'flex-start',
                        '&:hover': {
                          bgcolor: '#fafafa',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                        }
                      }}>
                      <ListItemAvatar>
                        <Avatar
                          src={userImageSrc}
                          sx={{
                            bgcolor: userImageSrc ? 'transparent' : colors,
                            color: userImageSrc ? 'inherit' : 'white',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            width: 40,
                            height: 40,
                            border: '1px solid #f5f5f5'
                          }}
                        >
                          {!userImageSrc && userName?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        sx={{ flex: 1, minWidth: 0, mr: 2 }}
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{userName}</Typography>
                            {activity.badge && (
                              <Chip label={activity.badge.label} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: activity.badge.bg, color: activity.badge.color, letterSpacing: '0.04em' }} />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', color: 'var(--text-2nd-color)', lineHeight: 1.5 }}>
                            {activity.action}
                            <Box component="span" sx={{ color: 'var(--text-2nd-color)', ml: 0.5 }}>
                              · {activity.time}
                            </Box>
                          </Typography>
                        }
                      />
                      {/* <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activity.id) router.push(`/bugs?selectedId=${activity.bugid}`);
                        }}
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
                      </Button> */}
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
