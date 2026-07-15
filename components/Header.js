'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
    Stack,
    IconButton,
    Avatar,
    Badge,
    Tooltip,
    Popover,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider,
    Button,
    CircularProgress,
    MenuItem
} from '@mui/material';
import { getNotificationsApi } from '@/app/api/notificationgetApi';
import { markNotificationReadApi } from '@/app/api/notificationmarkreadApi';
import { permissions } from '@/utils/permissions';
import { useBugContext } from '@/contexts/BugContext';
import { useMasterData } from '@/contexts/MasterDataContext';
import { getRandomAvatarColor, ImageUrl } from '@/utils/glocalfunc';
import { fetchMasterGlFunc } from '@/app/api/masterApi';
import {
    Bell,
    Bug,
    MessageSquare,
    AlertCircle,
    CheckCheck,
    Plus,
    RefreshCw,
    X,
} from 'lucide-react';
import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { decodeUrlParams } from '@/utils/urlParams';

const NOTIFICATION_ICONS = {
    BUG_ASSIGNED: <Bug size={16} color="#6366F1" />,
    COMMENT_ADDED: <MessageSquare size={16} color="#10B981" />,
    STATUS_CHANGED: <AlertCircle size={16} color="#F59E0B" />,
};

const NOTIFICATION_COLORS = {
    BUG_ASSIGNED: '#EEF2FF',
    COMMENT_ADDED: '#ECFDF5',
    STATUS_CHANGED: '#FFFBEB',
};

function timeAgo(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function Header() {
    return (
        <Suspense fallback={null}>
            <HeaderContent />
        </Suspense>
    );
}

function HeaderContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const dataParam = searchParams.get('data');
    const decodedParams = decodeUrlParams(dataParam);
    const taskNoParam = decodedParams.taskno;
    const taskNameParam = decodedParams.taskname;
    const { triggerReportBug, triggerRefreshDetail, fetchBugsGlobal, bugs: globalBugs, totalBugCount, todayBugCount } = useBugContext();
    const { isMasterDataReady, ensureMasterData } = useMasterData();
    const taskId = decodedParams.taskid;

    const isToday = (dateStr) => {
        if (!dateStr) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const d = new Date(dateStr);
        return d >= today && d < tomorrow;
    };

    const filteredBugs = taskId
        ? (globalBugs || []).filter(bug => String(bug.taskId || '') === String(taskId))
        : (globalBugs || []);

    const displayTotal = taskId ? filteredBugs.length : totalBugCount;
    const displayToday = taskId ? filteredBugs.filter(bug => isToday(bug.entrydate)).length : todayBugCount;
    const [currentUser, setCurrentUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const lastUserProfileRawRef = useRef('');

    useEffect(() => {
        const syncUserProfile = () => {
            const rawProfile = localStorage.getItem('UserProfileData') || '';
            if (rawProfile === lastUserProfileRawRef.current) return;
            lastUserProfileRawRef.current = rawProfile;
            if (!rawProfile) {
                setCurrentUser(null);
                return;
            }
            try {
                const profile = JSON.parse(rawProfile);
                setCurrentUser((prev) => {
                    const nextUser = {
                        id: profile.id,
                        name: `${profile.firstname} ${profile.lastname}`.trim() || profile.id,
                        role: profile.designation || 'User',
                        designation: profile.designation,
                        email: profile.userid,
                        photo: profile.empphoto,
                        ...profile
                    };

                    if (
                        prev?.id === nextUser.id &&
                        prev?.designation === nextUser.designation &&
                        prev?.email === nextUser.email &&
                        prev?.photo === nextUser.photo &&
                        prev?.name === nextUser.name
                    ) {
                        return prev;
                    }

                    return nextUser;
                });
            } catch (error) {
                console.error('Error parsing UserProfileData:', error);
                setCurrentUser(null);
            }
        };

        syncUserProfile();
        const checkInterval = setInterval(syncUserProfile, 500);
        return () => clearInterval(checkInterval);
    }, []);

    const fetchNotifications = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const data = await getNotificationsApi(userId);
            setNotifications(data?.rd || data?.rd1 || []);
        } catch (_) { /* silent */ }
    }, []);

    useEffect(() => {
        if (!currentUser?.id) return;
        fetchNotifications(currentUser.id);
    }, [currentUser?.id, fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleBellClick = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const handleProfileClick = (e) => {
        setProfileAnchorEl(e.currentTarget);
    };

    const handleProfileClose = () => setProfileAnchorEl(null);

    const handleLogout = () => {
        sessionStorage.clear();
        router.push('/');
    };

    const handleMarkRead = async (id) => {
        await markNotificationReadApi(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: 1 } : n));
    };

    const handleMarkAllRead = async () => {
        setLoading(true);
        const unread = notifications.filter(n => !n.isRead);
        await Promise.all(unread.map(n => markNotificationReadApi(n.id)));
        setNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })));
        setLoading(false);
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await fetchMasterGlFunc();
            // Reload page to reflect changes
            window.location.reload();
        } catch (error) {
            console.error('Error syncing master data:', error);
        } finally {
            setSyncing(false);
        }
    };

    const getPageTitle = () => {
        if (pathname === '/') return 'Dashboard';
        if (pathname.includes('/tasks')) return 'Tasks';
        if (pathname.includes('/bugs')) {
            if (pathname === '/bugs' && taskNoParam && taskNameParam) {
                return null;
            }
            if (pathname === '/bugs') return 'Bug List';
            return 'Bug Details';
        }
        if (pathname.includes('/reports')) return 'Analytics & Reports';
        if (pathname.includes('/users')) return 'User Management';
        return 'Application';
    };

    const getBreadcrumbs = () => {
        if (pathname === '/') return null;
        if (pathname.includes('/bugs')) {
            if (pathname === '/bugs' && taskNoParam && taskNameParam) {
                return null;
            }
            if (pathname === '/bugs') return null; // Don't show breadcrumbs on bug list
            return ['Bugs', 'Bug Details'];
        }
        if (pathname.includes('/tasks')) return ['Tasks'];
        if (pathname.includes('/reports')) return ['Analytics & Reports'];
        if (pathname.includes('/users')) return ['User Management'];
        return null;
    };

    const colors = getRandomAvatarColor(currentUser?.name || '');
    const userImageSrc = ImageUrl(currentUser);
    const open = Boolean(anchorEl);
    const profileOpen = Boolean(profileAnchorEl);
    const fmtCompact = (n) => {
        if (!n && n !== 0) return '0';
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k+';
        return n;
    };

    const bugCountSummary = pathname.includes('/bugs') && (
        <Stack direction="row" spacing={0.75} alignItems="center">
            <Tooltip title={`Total: ${typeof displayTotal === 'number' ? displayTotal.toLocaleString() : displayTotal}`} arrow>
                <Box sx={{
                    bgcolor: '#F3F0FF',
                    color: '#5B4DDB',
                    px: 1.6,
                    py: 0.5,
                    borderRadius: '20px',
                    border: '1px solid rgba(99, 102, 241, 0.18)',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    gap: 0.5,
                    minWidth: 68,
                    boxShadow: '0 1px 2px rgba(99, 102, 241, 0.06)'
                }}>
                    <Typography sx={{ fontSize: '0.95rem', lineHeight: 1, fontWeight: 800 }}>
                        {fmtCompact(displayTotal)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.65, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Total
                    </Typography>
                </Box>
            </Tooltip>

            <Tooltip title={`Today: ${typeof displayToday === 'number' ? displayToday.toLocaleString() : displayToday}`} arrow>
                <Box sx={{
                    bgcolor: '#ECFDF5',
                    color: '#047857',
                    px: 1.6,
                    py: 0.5,
                    borderRadius: '20px',
                    border: '1px solid rgba(16, 185, 129, 0.18)',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    gap: 0.5,
                    minWidth: 68,
                    boxShadow: '0 1px 2px rgba(16, 185, 129, 0.06)'
                }}>
                    <Typography sx={{ fontSize: '0.95rem', lineHeight: 1, fontWeight: 800 }}>
                        {fmtCompact(displayToday)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.65, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Today
                    </Typography>
                </Box>
            </Tooltip>

            {dataParam && (
                <Button
                    size="small"
                    startIcon={<X size={14} />}
                    onClick={() => router.push('/bugs')}
                    sx={{
                        bgcolor: 'rgba(239, 68, 68, 0.08)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 1.5,
                        minWidth: 0,
                        px: 1,
                        py: 0.35,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: 'rgba(239, 68, 68, 0.15)',
                            borderColor: '#EF4444',
                            color: '#DC2626',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)'
                        }
                    }}
                >
                    Clear
                </Button>
            )}
        </Stack>
    );

    const [creatingBug, setCreatingBug] = useState(false);
    const [refreshingBugs, setRefreshingBugs] = useState(false);

    const handleRefreshBugs = async () => {
        setRefreshingBugs(true);
        triggerRefreshDetail();
        try {
            await fetchBugsGlobal(true);
        } catch (error) {
            console.error('Failed to refresh bugs:', error);
        } finally {
            setRefreshingBugs(false);
        }
    };

    const handleReportBugClick = async () => {
        if (!isMasterDataReady) {
            setCreatingBug(true);
            try {
                await ensureMasterData();
            } catch (error) {
                console.error('Failed to load master data before creating bug:', error);
                setCreatingBug(false);
                return;
            }
            setCreatingBug(false);
        }

        if (pathname === '/bugs' || pathname.startsWith('/bugs?')) {
            triggerReportBug();
        } else {
            const params = new URLSearchParams();
            if (dataParam) {
                params.set('data', dataParam);
            }
            params.set('openReport', '1');
            router.push(`/bugs?${params.toString()}`);
        }
    };

    return (
        <Box sx={{
            height: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            borderBottom: '1px solid #EAECEF',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 1100
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {pathname.includes('/bugs') && taskNoParam && taskNameParam ? (
                    <Box>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Typography variant="h6" sx={{ fontWeight: 850, color: '#7367f0', letterSpacing: '-0.02em', fontSize: '0.9rem', lineHeight: 1.1 }}>
                                {taskNoParam}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.05rem', lineHeight: 1.1 }}>
                                {taskNameParam}
                            </Typography>
                            {bugCountSummary}
                        </Stack>
                    </Box>
                ) : (
                    <Box>
                        {getBreadcrumbs() ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                                {getBreadcrumbs()?.map((crumb, index) => (
                                    <React.Fragment key={index}>
                                        {index < getBreadcrumbs()?.length - 1 ? (
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: 'var(--text-2nd-color)',
                                                    letterSpacing: '-0.02em',
                                                    fontSize: '1.05rem',
                                                    lineHeight: 1.1,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        color: '#6366F1',
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                                onClick={() => {
                                                    if (crumb === 'Bugs') router.push('/bugs');
                                                    if (crumb === 'Tasks') router.push('/tasks');
                                                    if (crumb === 'Analytics & Reports') router.push('/reports');
                                                    if (crumb === 'User Management') router.push('/users');
                                                }}
                                            >
                                                {crumb}
                                            </Typography>
                                        ) : (
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 850,
                                                        letterSpacing: '-0.02em',
                                                        fontSize: '1.05rem',
                                                        lineHeight: 1.1
                                                    }}
                                                >
                                                    {crumb}
                                                </Typography>
                                                {bugCountSummary}
                                            </Stack>
                                        )}
                                        {index < (getBreadcrumbs()?.length || 0) - 1 && (
                                            <Typography sx={{ color: '#CBD5E1', fontSize: '0.9rem' }}>/</Typography>
                                        )}
                                    </React.Fragment>
                                ))}
                            </Stack>
                        ) : (
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.1 }}>
                                    {getPageTitle()}
                                </Typography>
                                {bugCountSummary}
                            </Stack>
                        )}
                    </Box>
                )}
            </Box>
            {/* Actions & User Profile */}
            <Stack direction="row" spacing={2} alignItems="center">
                {pathname.includes('/bugs') && (
                    <Tooltip title="Refresh Bugs">
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#F4F5F7',
                                borderRadius: '10px',
                                p: 0.5,
                            }}
                        >
                            <IconButton
                                size="small"
                                onClick={handleRefreshBugs}
                                disabled={refreshingBugs}
                                sx={{
                                    color: 'var(--text-2nd-color)',
                                    '&:hover': { bgcolor: '#FFFFFF', color: '#6366F1' },
                                }}
                            >
                                <RefreshCw size={18} className={refreshingBugs ? 'spin' : ''} />
                            </IconButton>
                        </Box>
                    </Tooltip>
                )}
                {pathname.includes('/bugs') && permissions.canReportBug(currentUser) && (
                    <Button
                        startIcon={creatingBug ? <RefreshCw size={16} className="spin" /> : <Plus size={16} />}
                        onClick={handleReportBugClick}
                        disabled={creatingBug}
                        className='buttonClassname'
                    >
                        {creatingBug ? 'Loading...' : 'Create Bug'}
                    </Button>
                )}

                {/* <Stack direction="row" spacing={0.25}>
                                                <Tooltip title="Notifications">
                                                    <IconButton
                                                        size="small"
                                                        onClick={handleBellClick}
                                                        sx={{ p: 0.75, color: 'var(--text-2nd-color)', '&:hover': { bgcolor: '#FAFAFA', color: '#6366F1' } }}
                                                    >
                                                        <Badge badgeContent={unreadCount || null} color="error" overlap="circular" sx={{ '& .MuiBadge-badge': { fontSize: '0.62rem', height: 16, minWidth: 16 } }}>
                                                            <Bell size={18} />
                                                        </Badge>
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack> */}

                {/* Notification Popover */}
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                        sx: {
                            mt: 1,
                            width: 360,
                            maxHeight: 480,
                            borderRadius: 2.5,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                            border: '1px solid #EAECEF',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }
                    }}
                >
                    {/* Header */}
                    <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#FAFBFF' }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Notifications</Typography>
                            {unreadCount > 0 && (
                                <Typography variant="caption" sx={{ color: 'var(--text-2nd-color)' }}>
                                    {unreadCount} unread
                                </Typography>
                            )}
                        </Box>
                        {unreadCount > 0 && (
                            <Button
                                size="small"
                                startIcon={loading ? <CircularProgress size={12} /> : <CheckCheck size={14} />}
                                onClick={handleMarkAllRead}
                                disabled={loading}
                                sx={{ fontSize: '0.75rem', color: '#6366F1', textTransform: 'none', fontWeight: 700 }}
                            >
                                Mark all read
                            </Button>
                        )}
                    </Box>

                    {/* List */}
                    <Box sx={{ overflowY: 'auto', flex: 1 }}>
                        {notifications.length === 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 1 }}>
                                <Bell size={32} color="#CBD5E1" />
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    All caught up!
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    No notifications yet
                                </Typography>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {notifications.map((n, i) => (
                                    <React.Fragment key={n.id}>
                                        <ListItem
                                            alignItems="flex-start"
                                            onClick={() => !n.isRead && handleMarkRead(n.id)}
                                            sx={{
                                                py: 1.5,
                                                px: 2.5,
                                                cursor: n.isRead ? 'default' : 'pointer',
                                                bgcolor: n.isRead ? 'transparent' : NOTIFICATION_COLORS[n.type] || '#FAFAFA',
                                                transition: 'background 0.2s',
                                                '&:hover': { bgcolor: '#FAFAFA' },
                                                position: 'relative',
                                            }}
                                        >
                                            <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: n.isRead ? '#EAECEF' : '#EEF2FF' }}>
                                                    {NOTIFICATION_ICONS[n.type] || <Bell size={14} />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: n.isRead ? 500 : 700, color: '#444050', fontSize: '0.82rem', flex: 1 }}>
                                                            {n.title}
                                                        </Typography>
                                                        {!n.isRead && (
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6366F1', flexShrink: 0, mt: 0.3 }} />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: 'var(--text-2nd-color)', display: 'block', mt: 0.25, fontSize: '0.75rem' }}>
                                                            {n.message}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'var(--text-2nd-color)', fontWeight: 500, fontSize: '0.7rem' }}>
                                                            {timeAgo(n.entrydate)}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {/* {i < notifications.length - 1 && <Divider sx={{ mx: 2.5, opacity: 0.5 }} />} */}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Box>
                </Popover>

                {/* User Profile */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 0.5, cursor: 'pointer', borderRadius: 2, p: 0.5, '&:hover': { bgcolor: '#FAFAFA' } }} onClick={handleProfileClick}>
                    <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.1, textTransform: 'capitalize' }}>
                            {currentUser?.name || 'User'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}>
                            {currentUser?.role?.replace(/_/g, ' ') || 'Guest'}
                        </Typography>
                    </Box>
                    <Avatar
                        src={userImageSrc}
                        sx={{
                            width: 32,
                            height: 32,
                            fontSize: '14px',
                            textTransform: 'capitalize',
                            backgroundColor: userImageSrc ? 'transparent' : colors,
                            border: '1px solid #EAECEF'
                        }}
                    >
                        {!userImageSrc && currentUser?.name?.charAt(0)}
                    </Avatar>
                </Stack>
            </Stack>

            {/* Profile Menu */}
            <Popover
                open={Boolean(profileAnchorEl)}
                anchorEl={profileAnchorEl}
                onClose={handleProfileClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 220,
                        borderRadius: 2,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        border: '1px solid #EAECEF',
                        overflow: 'hidden',
                    }
                }}
            >
                <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                            src={userImageSrc}
                            sx={{
                                width: 40,
                                height: 40,
                                fontSize: '14px',
                                textTransform: 'capitalize',
                                backgroundColor: userImageSrc ? 'transparent' : colors,
                                border: '1px solid #EAECEF'
                            }}
                        >
                            {!userImageSrc && currentUser?.name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {currentUser?.name || 'User'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {currentUser?.email || ''}
                            </Typography>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-2nd-color)', textTransform: 'uppercase', letterSpacing: '0.04em', mt: 0.25 }}>
                                {currentUser?.role?.replace(/_/g, ' ') || 'Guest'}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
                <Box sx={{ p: 1 }}>
                    <MenuItem
                        onClick={handleSync}
                        disabled={syncing}
                        sx={{
                            borderRadius: 1,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#6366F1',
                            '&:hover': {
                                bgcolor: '#EEF2FF',
                            }
                        }}
                    >
                        {syncing ? <CircularProgress size={14} sx={{ mr: 1 }} /> : <RefreshCw size={14} style={{ marginRight: 8 }} />}
                        Sync Data
                    </MenuItem>
                    <MenuItem
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 1,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#DC2626',
                            '&:hover': {
                                bgcolor: '#FEF2F2',
                            }
                        }}
                    >
                        Logout
                    </MenuItem>
                </Box>
            </Popover>

        </Box>
    );
}
