'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Stack, Button, Avatar, IconButton, CircularProgress,
  Tooltip, Select, MenuItem, Divider, Paper, Card, Fade, Chip
} from '@mui/material';
import { filterStatusDataByRole } from '@/components/bugModal/constants';
import {
  Edit2, CheckCircle2, RotateCcw, ExternalLink, PanelRightClose, PanelRightOpen,
  AlertCircle, ChevronLeft, ChevronRight, Paperclip, MessageSquare, Calendar, Clock,
  User, ShieldAlert, Sparkles, Download, Eye, FileText, Send, Info, Trash2,
  RefreshCcw,
  Image,
  ListCollapse
} from 'lucide-react';
import { getRandomAvatarColor, ImageUrl, formatCommentDate, formatDate, STATUS } from '@/utils/glocalfunc';
import { slimScroll } from '../constants';
import { getBugDetailApi } from '@/app/api/bugdetailApi';
import { updateBugApi } from '@/app/api/bugupdateApi';
import { normalizeBugData } from '@/utils/normalizeBugData';
import { permissions } from '@/utils/permissions';
import AttachmentSlider from '@/components/AttachmentSlider';
import CommentInput from '@/components/CommentInput';
import ReassignDialog from '@/components/ReassignDialog';
import StatusDialog from '@/components/StatusDialog';
import BugModal from '@/components/BugModal';
import AttachmentViewer from '@/components/AttachmentViewer';
import TimelineSection from '@/components/TimelineSection';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import BugDetailSkeleton from './BugDetailSkeleton';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { deleteBugApi } from '@/app/api/bugdeleteApi';

export default function IssueDetailPanel({
  bugId,
  currentUser,
  developers,
  taskAssignees,
  onRefreshList,
  onUpdateBug,
  onViewDetails,
  onRefress,
  onBack,
  onReassign,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  onDelete,
  bugs = [],
}) {
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchedBugIdRef = React.useRef(null);
  const [saving, setSaving] = useState(false);
  const [visibleComments, setVisibleComments] = useState(8);
  const [editOpen, setEditOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerAttachments, setViewerAttachments] = useState([]);
  const [viewerCurrentBugId, setViewerCurrentBugId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState('');
  const [tempDev, setTempDev] = useState('');
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFullTimeline, setShowFullTimeline] = useState(false);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load status and priority data from session storage
  useEffect(() => {
    const loadStatusData = () => {
      const data = sessionStorage.getItem('taskbugstatusData');
      if (data) {
        try {
          const allStatusData = JSON.parse(data);
          setStatusData(filterStatusDataByRole(allStatusData, currentUser, true));
        } catch (error) {
          console.error('Error parsing taskbugstatusData:', error);
          setStatusData([]);
        }
      }
    };

    const loadPriorityData = () => {
      const data = sessionStorage.getItem('taskbugpriorityData');
      if (data) {
        try {
          setPriorityData(JSON.parse(data));
        } catch (error) {
          console.error('Error parsing taskbugpriorityData:', error);
          setPriorityData([]);
        }
      }
    };

    loadStatusData();
    loadPriorityData();

    // Listen for changes in session storage
    const handleStorageChange = () => {
      loadStatusData();
      loadPriorityData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  const fetchBug = useCallback(async (silent = false) => {
    if (!bugId) return;
    if (!silent) {
      setLoading(true);
      setError(null);
      setVisibleComments(8);
    }
    try {
      const response = await getBugDetailApi(bugId);

      // Parse the rd, rd1, rd2, rd3, rd4 format
      const bugDetails = response?.rd?.[0] || {};
      const attachments = response?.rd1 || [];
      const comments = response?.rd2 || [];
      const history = response?.rd3 || [];
      const commentAttachments = response?.rd4 || [];

      // Attach comment attachments to their respective comments
      const commentsWithAttachments = comments.map(comment => ({
        ...comment,
        attachments: commentAttachments.filter(att => att.commentId === comment.id)
      }));

      // Set bug with attachments and history included, normalized
      const newBug = normalizeBugData({
        ...bugDetails,
        attachments: attachments,
        comments: commentsWithAttachments,
        history: history
      });
      setBug(newBug);
      if (onUpdateBug) onUpdateBug(newBug);

      if (!silent) setLoading(false);
    } catch (e) {
      setError(e.message);
      if (!silent) setLoading(false);
    }
  }, [bugId]);

  useEffect(() => {
    if (fetchedBugIdRef.current === bugId) return;
    fetchedBugIdRef.current = bugId;
    setBug(null);
    fetchBug();
  }, [bugId, fetchBug]);

  const handleViewerBugChange = useCallback(async (newBugId) => {
    if (!newBugId) return;
    try {
      const response = await getBugDetailApi(newBugId);
      setViewerCurrentBugId(newBugId);
      setViewerAttachments(response?.rd1 || []);
      setViewerIndex(0);
    } catch (e) {
      console.error('Failed to switch viewer bug attachments:', e);
    }
  }, []);

  const patch = async (payload) => {
    setSaving(true);
    try {
      const { status, priority, category, ...payloadWithoutIds } = payload;
      await updateBugApi({ ...payloadWithoutIds, id: bugId, userId: currentUser?.id, reporterId: bug.reporterId });
      fetchBug(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBug = async () => {
    setIsDeleting(true);
    try {
      await deleteBugApi(bugId);
      onDelete?.(bugId);
      onBack();
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (!bugId) return null;

  if (loading) {
    return <BugDetailSkeleton />;
  }

  if (error || !bug) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 2, bgcolor: '#FAFBFD', height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: '#FFF1F2', borderRadius: '8px', boxShadow: '0 2px 8px rgba(234, 84, 85, 0.1)' }}>
        <AlertCircle size={28} color="#EA5455" />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Failed to load issue</Typography>
      <Button variant="outlined" size="small" onClick={() => fetchBug()} sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}>
        Retry Loading
      </Button>
    </Box>
  );

  // Use normalized objects if available, otherwise fall back to static constants
  const ss = (bug.status && typeof bug.status === 'object') ? bug.status : (STATUS[bug.status] || STATUS.OPEN);
  const sortedComments = [...(bug.comments || [])].reverse();

  // Helper to get status value for comparisons (handles both object and string)
  const getStatusValue = (status) => {
    if (typeof status === 'object' && status?.label) return status.label;
    return status;
  };

  const getStatusById = (id) => (statusData || []).find((s) => String(s?.id) === String(id));
  const getStatusByLabel = (label) => (statusData || []).find((s) => String(s?.labelname || '').toLowerCase() === String(label || '').toLowerCase());

  const currentStatusLabel = (() => {
    if (bug?.statusId) {
      return getStatusById(bug.statusId)?.labelname || getStatusValue(bug.status);
    }
    return getStatusValue(bug.status);
  })();

  const getMemberByRef = (userRef) => {
    if (!userRef) return null;
    const member = (taskAssignees || []).find(
      (item) => String(item?.id) === String(userRef) || String(item?.userid) === String(userRef)
    );
    return member || null;
  };

  const getMemberNameByRef = (userRef, fallback = 'Unknown') => {
    const member = getMemberByRef(userRef);
    if (member) {
      return `${member.firstname || ''} ${member.lastname || ''}`.trim() || String(userRef || fallback);
    }
    return String(userRef || fallback);
  };

  const getMemberName = (comment) => {
    const commentUserId = comment?.userId ?? comment?.userid ?? comment?.user;
    return getMemberNameByRef(commentUserId, 'Unknown');
  };

  const getUserName = (userRef) => {
    return getMemberNameByRef(userRef, 'Unknown');
  };

  const assigneeDisplayName = getMemberNameByRef(bug.assigneeId);
  const reporterDisplayName = getMemberNameByRef(bug.reporterId || bug.reporter, bug.reporter || 'Unknown');
  const assigneeMember = getMemberByRef(bug.assigneeId || bug.assignee);
  const reporterMember = getMemberByRef(bug.reporterId || bug.reporter);
  const aColors = getRandomAvatarColor(assigneeDisplayName || '');
  const rColors = getRandomAvatarColor(reporterDisplayName || '');
  const aImageSrc = ImageUrl(assigneeMember);
  const rImageSrc = ImageUrl(reporterMember);

  return (
    <Fade in={true} timeout={400}>
      <Box sx={{ display: 'flex', height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: '#FAFBFD' }}>
        {/* ─── Center Column: Content & Conversations ─── */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FAFBFD',
            ...slimScroll
          }}
        >
          {/* Header Section */}
          <Box sx={{
            p: 2,
            borderBottom: '1px solid #EAECEF',
            bgcolor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Title with bugNo inline */}
                <Typography sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3,
                  fontSize: '1.25rem',
                  color: '#1E293B',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {bug.bugNo ? (
                    <>
                      <Typography component="span" sx={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: '#7367f0',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                        mr: 1,
                        bgcolor: 'rgba(115, 103, 240, 0.08)',
                        px: 1,
                        py: 0.25,
                        borderRadius: '8px'
                      }}>
                        {bug.bugNo}
                      </Typography>
                      {' '}{bug.title}
                    </>
                  ) : bug.title}
                </Typography>
              </Box>
              <Tooltip title="Refress Bug page">
                <span>
                  <IconButton
                    size="small"
                    onClick={onRefress}
                    sx={{
                      border: '1px solid #EAECEF',
                      borderRadius: '12px',
                      width: 34,
                      height: 34,
                      color: 'var(--text-2nd-color)',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover:not(:disabled)': {
                        bgcolor: '#FFFFFF',
                        borderColor: '#7367f0',
                        color: '#7367f0',
                        boxShadow: '0 3px 8px rgba(115, 103, 240, 0.15)',
                        transform: 'translateY(-1px)'
                      },
                      '&:disabled': {
                        opacity: 0.5,
                        cursor: 'not-allowed'
                      }
                    }}
                  >
                    <RefreshCcw size={16} />
                  </IconButton>
                </span>
              </Tooltip>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
                <Tooltip title="Previous Bug">
                  <span>
                    <IconButton
                      size="small"
                      onClick={onPrev}
                      disabled={!hasPrev}
                      sx={{
                        border: '1px solid #EAECEF',
                        borderRadius: '12px',
                        width: 34,
                        height: 34,
                        color: 'var(--text-2nd-color)',
                        bgcolor: 'var(--light-bg)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover:not(:disabled)': {
                          bgcolor: '#FFFFFF',
                          borderColor: '#7367f0',
                          color: '#7367f0',
                          boxShadow: '0 3px 8px rgba(115, 103, 240, 0.15)',
                          transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                          opacity: 0.5,
                          cursor: 'not-allowed'
                        }
                      }}
                    >
                      <ChevronLeft size={18} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Next Bug">
                  <span>
                    <IconButton
                      size="small"
                      onClick={onNext}
                      disabled={!hasNext}
                      sx={{
                        border: '1px solid #EAECEF',
                        borderRadius: '12px',
                        width: 34,
                        height: 34,
                        color: 'var(--text-2nd-color)',
                        bgcolor: 'var(--light-bg)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover:not(:disabled)': {
                          bgcolor: '#FFFFFF',
                          borderColor: '#7367f0',
                          color: '#7367f0',
                          boxShadow: '0 3px 8px rgba(115, 103, 240, 0.15)',
                          transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                          opacity: 0.5,
                          cursor: 'not-allowed'
                        }
                      }}
                    >
                      <ChevronRight size={18} />
                    </IconButton>
                  </span>
                </Tooltip>
                {permissions.canEditBug(currentUser) && (
                  <Tooltip title="Edit Bug Details">
                    <IconButton
                      size="small"
                      onClick={() => setEditOpen(true)}
                      sx={{
                        borderRadius: '12px',
                        color: '#7367f0',
                        bgcolor: 'rgba(115, 103, 240, 0.08)',
                        width: 34,
                        height: 34,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: 'rgba(115, 103, 240, 0.15)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 3px 8px rgba(115, 103, 240, 0.2)'
                        }
                      }}
                    >
                      <Edit2 size={16} />
                    </IconButton>
                  </Tooltip>
                )}
                {permissions.canDeleteBug(currentUser) && (
                  <Tooltip title="Delete Bug">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirmOpen(true)}
                      sx={{
                        borderRadius: '12px',
                        color: '#EA5455',
                        bgcolor: 'rgba(234, 84, 85, 0.08)',
                        width: 34,
                        height: 34,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: 'rgba(234, 84, 85, 0.15)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 3px 8px rgba(234, 84, 85, 0.2)'
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={showSidebar ? 'Collapse Info Sidebar' : 'Expand Info Sidebar'}>
                  <IconButton
                    size="small"
                    onClick={() => setShowSidebar(!showSidebar)}
                    sx={{
                      border: '1px solid #EAECEF',
                      borderRadius: '12px',
                      width: 34,
                      height: 34,
                      color: 'var(--text-2nd-color)',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: '#FFFFFF',
                        borderColor: '#7367f0',
                        color: '#7367f0',
                        boxShadow: '0 3px 8px rgba(115, 103, 240, 0.15)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    {showSidebar ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                  </IconButton>
                </Tooltip>
                {/* <Tooltip title="Open in Full Page">
                  <IconButton
                    size="small"
                    onClick={onViewDetails}
                    disabled
                    sx={{
                      border: '1px solid #EAECEF',
                      borderRadius: '8px',
                      width: 32,
                      height: 32,
                      color: 'var(--text-2nd-color)',
                      bgcolor: '#FFFFFF',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: '#FAFAFA',
                        borderColor: '#7367f0',
                        color: '#7367f0',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <ExternalLink size={16} />
                  </IconButton>
                </Tooltip> */}
              </Stack>
            </Stack>

            {/* Action Buttons Section */}
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, justifyContent: 'flex-end' }}>
              {permissions.canVerifyBug(currentUser) && currentStatusLabel === 'Ready For Test' && (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CheckCircle2 size={15} />}
                    onClick={() => {
                      const closedStatus = getStatusByLabel('Verified');
                      if (closedStatus) { setPendingStatus(closedStatus.id); setStatusOpen(true); }
                    }}
                    disabled={saving}
                    sx={{
                      fontWeight: 700,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: '0.78rem',
                      px: 2,
                      py: 0.5,
                      boxShadow: '0 2px 8px rgba(40, 199, 111, 0.2)',
                      background: 'linear-gradient(135deg, #28C76F 0%, #48DA89 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #20a65b 0%, #3ebd7b 100%)',
                        boxShadow: '0 4px 12px rgba(40, 199, 111, 0.3)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Verify & Close
                  </Button>
                </>
              )}
              {permissions.canResolveBug(currentUser) && ['In Progress'].includes(currentStatusLabel) && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CheckCircle2 size={15} />}
                  onClick={() => {
                    const readyTestStatus = getStatusByLabel('Fixed');
                    if (readyTestStatus) { setPendingStatus(readyTestStatus.id); setStatusOpen(true); }
                  }}
                  disabled={saving}
                  sx={{
                    fontWeight: 700,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    px: 2,
                    py: 0.5,
                    boxShadow: '0 2px 8px rgba(115, 103, 240, 0.2)',
                    background: 'linear-gradient(135deg, #7367f0 0%, #9E95F5 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5b50d6 0%, #857bf2 100%)',
                      boxShadow: '0 4px 12px rgba(115, 103, 240, 0.3)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Resolve
                </Button>
              )}
              {permissions.canReopenBug(currentUser) && ['Ready For Test', 'Verified', 'Closed'].includes(currentStatusLabel) && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<RotateCcw size={15} />}
                  onClick={() => {
                    const reopenStatus = getStatusByLabel('Reopen');
                    if (reopenStatus) { setPendingStatus(reopenStatus.id); setStatusOpen(true); }
                  }}
                  disabled={saving}
                  sx={{
                    fontWeight: 700,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    px: 2,
                    py: 0.5,
                    boxShadow: '0 2px 8px rgba(115, 103, 240, 0.2)',
                    background: 'linear-gradient(135deg, #7367f0 0%, #9E95F5 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5b50d6 0%, #857bf2 100%)',
                      boxShadow: '0 4px 12px rgba(115, 103, 240, 0.3)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Reopen
                </Button>
              )}
            </Stack>
          </Box>

          {/* Scrollable Main Content Pane */}
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Attachment Slider (Images) FIRST */}
            {bug.attachments?.length > 0 && (
              <Card sx={{
                borderRadius: '16px',
                border: '1px solid #EAECEF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                bgcolor: '#FFFFFF',
                overflow: 'hidden'
              }}>
                <Box sx={{
                  px: 2,
                  py: 1.25,
                  borderBottom: '1px solid #EAECEF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', letterSpacing: '0.05em' }}>
                      Attachments
                    </Typography>
                    <Box sx={{
                      bgcolor: '#F8F9FA',
                      borderRadius: '6px',
                      px: 0.8, py: 0.25,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.4,
                      border: '1px solid #EAECEF'
                    }}>
                      <Image size={13} color="var(--text-2nd-color)" />
                      <Typography sx={{ fontSize: '0.7rem', color: 'var(--text-2nd-color)', fontWeight: 700 }}>{bug.attachments.length}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: '#FAFBFD' }}>
                  <AttachmentSlider
                    attachments={bug.attachments}
                    onImageClick={(idx) => {
                      setViewerCurrentBugId(bugId);
                      setViewerAttachments(bug.attachments || []);
                      setViewerIndex(idx);
                      setViewerOpen(true);
                    }}
                  />
                </Box>
              </Card>
            )}

            {/* Description Section SECOND */}
            {bug.description && (
              <Card sx={{
                borderRadius: '16px',
                border: '1px solid #EAECEF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                bgcolor: '#FFFFFF',
                overflow: 'hidden'
              }}>
                <Box sx={{
                  px: 2,
                  py: 1.25,
                  borderBottom: '1px solid #EAECEF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', letterSpacing: '0.05em' }}>
                      Description
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ color: "var(-title-color) !important", lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.88rem' }}>
                    {bug.description || <em style={{ color: 'var(--text-2nd-color)' }}>No description provided.</em>}
                  </Typography>
                </Box>
              </Card>
            )}

            {/* Activity Section */}
            <Card sx={{
              borderRadius: '16px',
              border: '1px solid #EAECEF',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              bgcolor: '#FFFFFF',
              overflow: 'hidden'
            }}>
              <Box sx={{
                px: 2,
                py: 1.25,
                borderBottom: '1px solid #EAECEF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', letterSpacing: '0.05em' }}>
                    Comments
                  </Typography>
                  <Box sx={{
                    bgcolor: '#F8F9FA',
                    borderRadius: '6px',
                    px: 0.8, py: 0.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.4,
                    border: '1px solid #EAECEF'
                  }}>
                    <MessageSquare size={13} color="var(--text-2nd-color)" />
                    <Typography sx={{ fontSize: '0.7rem', color: 'var(--text-2nd-color)', fontWeight: 700 }}>{bug.comments?.length || 0}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 2 }}>
                <Stack spacing={2} sx={{ mb: 2, position: 'relative' }}>
                  {/* Timeline Thread connector */}
                  {sortedComments.length > 0 && (
                    <Box sx={{
                      position: 'absolute',
                      left: '18px',
                      top: '16px',
                      bottom: '16px',
                      width: '2px',
                      bgcolor: '#EAECEF',
                      zIndex: 1
                    }} />
                  )}

                  {sortedComments.slice(0, visibleComments).map((c) => {
                    const normalizedAttachments = Array.isArray(c.attachments)
                      ? c.attachments.map((file) => ({
                        ...file,
                        id: file.id,
                        name: file.name || file.fileName || 'Attachment',
                        type: file.type || ((file.mimeType || '').startsWith('image/') ? 'image' : 'file'),
                        url: file.url || file.filePath || '',
                      }))
                      : [];
                    const commentMemberName = getMemberName(c);
                    const commentMember = getMemberByRef(c?.userId ?? c?.userid ?? c?.user);
                    const commentImageSrc = ImageUrl(commentMember);
                    const commentAvatarColor = getRandomAvatarColor(commentMemberName);

                    return (
                      <Box key={c.id} sx={{ display: 'flex', gap: 1.5, position: 'relative', zIndex: 2 }}>
                        <Avatar
                          src={commentImageSrc}
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: '13px',
                            textTransform: 'capitalize',
                            border: '2px solid #FFFFFF',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            backgroundColor: commentImageSrc ? 'transparent' : commentAvatarColor,
                          }}
                        >
                          {!commentImageSrc && commentMemberName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{
                            p: 1.5,
                            borderRadius: '8px',
                            bgcolor: '#FAFAFA',
                            border: '1px solid #EAECEF',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                              borderColor: '#CBD5E1'
                            }
                          }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap' }}>
                              <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.82rem' }}>
                                {commentMemberName}
                              </Typography>
                              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#CBD5E1' }} />
                              <Typography variant="caption" sx={{ color: 'var(--text-2nd-color)', fontWeight: 600, fontSize: '0.68rem' }}>
                                {formatCommentDate(c.entrydate)}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.5, fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
                              {c.content}
                            </Typography>

                            {normalizedAttachments.length > 0 && (
                              <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: 'wrap', gap: 1 }}>
                                {normalizedAttachments.map((file, idx) => (
                                  <Box
                                    key={file.id || idx}
                                    onClick={() => {
                                      setViewerCurrentBugId(bugId);
                                      setViewerAttachments(normalizedAttachments);
                                      setViewerIndex(idx);
                                      setViewerOpen(true);
                                    }}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.75,
                                      p: 0.5,
                                      pr: 1,
                                      bgcolor: '#FFFFFF',
                                      border: '1px solid #EAECEF',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        borderColor: '#7367f0',
                                        bgcolor: '#F0EFFF',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 2px 6px rgba(115, 103, 240, 0.06)'
                                      }
                                    }}
                                  >
                                    {file.type === 'image' ? (
                                      <Box
                                        component="img"
                                        src={file.url}
                                        sx={{ width: 20, height: 20, borderRadius: '4px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <Paperclip size={12} color="#7367f0" />
                                    )}
                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', maxWidth: 160 }} noWrap>
                                      {file.name}
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}

                  {visibleComments < sortedComments.length && (
                    <Button
                      size="small"
                      onClick={() => setVisibleComments(prev => prev + 5)}
                      sx={{
                        alignSelf: 'center',
                        color: '#7367f0',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.78rem',
                        py: 0.25,
                        px: 1.5,
                        borderRadius: '8px',
                        '&:hover': {
                          bgcolor: 'rgba(115, 103, 240, 0.04)',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Load more messages
                    </Button>
                  )}
                </Stack>

                <Divider sx={{ my: 2.5, borderColor: '#EAECEF' }} />

                {/* New Comment Input Wrapper */}
                <Box sx={{ mt: 1 }}>
                  <CommentInput bugId={bugId} currentUser={currentUser} onCommentAdded={() => fetchBug(true)} />
                </Box>
              </Box>
            </Card>

          </Box>
        </Box>

        {/* ─── Right Column: Issue Info Sidebar ─── */}
        {showSidebar && (
          <Box sx={{
            width: 290,
            bgcolor: '#FAFAFA',
            p: 2,
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            gap: 2,
            overflowY: 'auto',
            overflowX: 'hidden',
            borderLeft: '1px solid #EAECEF',
            ...slimScroll
          }}>
            <Box>
              <Typography sx={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-2nd-color)', mb: 1.5 }}>
                Bug Details
              </Typography>

              <Stack spacing={2}>
                {/* Status & Priority Card */}
                <Card sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: '1px solid #EAECEF',
                  boxShadow: 'none',
                  bgcolor: '#FFFFFF'
                }}>
                  <Stack spacing={2}>
                    {/* Status Select Dropdown */}
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', mb: 0.75, letterSpacing: '0.02em' }}>
                        Current Status
                      </Typography>
                      {permissions.canChangeBugStatus(currentUser) ? (
                        <Select
                          fullWidth
                          size="small"
                          value={bug.statusId || getStatusByLabel(currentStatusLabel)?.id || ''}
                          onChange={e => {
                            const next = e.target.value;
                            const current = bug.statusId || getStatusByLabel(currentStatusLabel)?.id || '';
                            if (String(next) === String(current)) return;

                            setPendingStatus(next);
                            setStatusOpen(true);
                          }}
                          disabled={saving}
                          sx={{
                            height: 34,
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            bgcolor: ss.bg,
                            color: ss.color,
                            boxShadow: 'none',
                            border: `1px solid ${ss.border || 'transparent'}`,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' }
                          }}
                          MenuProps={{
                            PaperProps: {
                              elevation: 0,
                              sx: {
                                mt: 0.75, borderRadius: '8px', overflow: 'hidden',
                                border: '1px solid #EAECEF', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', py: 0.25
                              }
                            }
                          }}
                        >
                          {statusData.map(s => (
                            <MenuItem
                              key={s.id}
                              value={s.id}
                              sx={{
                                fontWeight: 600, fontSize: '0.78rem', textTransform: 'capitalize',
                                borderRadius: '6px', mx: 0.75, my: 0.2, transition: 'all 0.15s ease',
                                '&:hover': { backgroundColor: '#EAECEF' },
                                '&.Mui-selected': { backgroundColor: 'rgba(115, 103, 240, 0.08)', color: '#7367f0', fontWeight: 700 },
                                '&.Mui-selected:hover': { backgroundColor: 'rgba(115, 103, 240, 0.12)' }
                              }}
                            >
                              {s.labelname}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : <StatusBadge status={bug.status} />}
                    </Box>

                    {/* Priority Display */}
                    {bug.priority && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', mb: 0.75, letterSpacing: '0.02em' }}>
                            Priority Level
                          </Typography>
                          <PriorityBadge priority={bug.priority} py={0.55} px={1.5} fontSize="0.7rem"/>
                        </Box>
                        {bug.category != '0' && (
                          <Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', mb: 0.75, letterSpacing: '0.02em' }}>
                              Category
                            </Typography>
                            <Chip
                              label={typeof bug.category === 'object' ? bug.category.label : bug.category}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                bgcolor: '#F5F5F5',
                                color: '#64748B',
                                border: '1px solid #EAECEF',
                                borderRadius: '12px',
                                height: '24px'
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    )}
                  </Stack>
                </Card>

                {/* People & Assignment Card */}
                <Card sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: '1px solid #EAECEF',
                  boxShadow: 'none',
                  bgcolor: '#FFFFFF'
                }}>
                  <Stack spacing={2.5}>
                    {/* Assignee */}
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', letterSpacing: '0.02em' }}>
                          Assigned To
                        </Typography>
                        {permissions.canReassignBug(currentUser) && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => { setTempDev(bug.assigneeId); setReassignOpen(true); }}
                            sx={{
                              fontSize: '0.65rem', fontWeight: 700, p: 0, minWidth: 0, color: '#7367f0',
                              '&:hover': { bgcolor: 'transparent', color: '#5b50d6', textDecoration: 'underline' }
                            }}
                          >
                            CHANGE
                          </Button>
                        )}
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                        onClick={() => { if (permissions.canReassignBug(currentUser)) { setTempDev(bug.assigneeId); setReassignOpen(true); } }}
                        sx={{
                          cursor: permissions.canReassignBug(currentUser) ? 'pointer' : 'default',
                          '&:hover .assignee-name': permissions.canReassignBug(currentUser) ? { color: '#7367f0' } : {}
                        }}
                      >
                        <Avatar
                          src={aImageSrc}
                          sx={{
                            width: 32, height: 32, fontSize: '13px', textTransform: 'capitalize',
                            border: '1px solid #EAECEF', backgroundColor: aImageSrc ? 'transparent' : aColors,
                          }}
                        >
                          {!aImageSrc && assigneeDisplayName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography className="assignee-name" sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2, transition: 'color 0.2s' }} noWrap>
                            {assigneeDisplayName || 'Unassigned'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }} noWrap>
                            {getMemberByRef(bug.assigneeId)?.designation || getMemberByRef(bug.assigneeId)?.department || (bug.assigneeId ? 'Developer' : '—')}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Reporter */}
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', mb: 0.75, letterSpacing: '0.02em' }}>
                        Reported By
                      </Typography>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar
                          src={rImageSrc}
                          sx={{
                            width: 32, height: 32, fontSize: '13px', textTransform: 'capitalize',
                            border: '1px solid #EAECEF', backgroundColor: rImageSrc ? 'transparent' : rColors,
                          }}
                        >
                          {!rImageSrc && reporterDisplayName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }} noWrap>
                            {reporterDisplayName}
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }} noWrap>
                            {getMemberByRef(bug.reporterId)?.designation || getMemberByRef(bug.reporterId)?.department || 'Reporter'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>

                {/* Metadata & Timeline Card */}
                <Card sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: '1px solid #EAECEF',
                  boxShadow: 'none',
                  bgcolor: '#FFFFFF'
                }}>
                  <Stack spacing={2.5}>
                    {/* Environment */}
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', mb: 0.75, letterSpacing: '0.02em' }}>
                        Environment
                      </Typography>
                      {bug.environment ? (
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.25}>
                          {(() => {
                            try {
                              const env = typeof bug.environment === 'string' ? JSON.parse(bug.environment) : bug.environment;
                              const activeEnvs = Object.entries(env).filter(([_, active]) => active);
                              return activeEnvs.length > 0 ? activeEnvs.map(([name]) => (
                                <Chip
                                  key={name}
                                  label={name}
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    textTransform: 'capitalize',
                                    bgcolor: 'rgba(115, 103, 240, 0.08)',
                                    color: '#7367f0',
                                    border: '1px solid rgba(115, 103, 240, 0.12)',
                                    borderRadius: '12px',
                                    height: '24px'
                                  }}
                                />
                              )) : (
                                <Typography sx={{ fontWeight: 500, color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                  Not Specified
                                </Typography>
                              );
                            } catch (e) {
                              return <Typography sx={{ fontWeight: 500, color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.85rem' }}>Not Specified</Typography>;
                            }
                          })()}
                        </Stack>
                      ) : (
                        <Typography sx={{ fontWeight: 500, color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.85rem' }}>
                          Not Specified
                        </Typography>
                      )}
                    </Box>

                    {/* Timeline Dates */}
                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', mb: 0.25, letterSpacing: '0.02em' }}>
                          Created
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem' }}>
                          {formatDate(bug.entrydate)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-2nd-color)', mb: 0.25, letterSpacing: '0.02em' }}>
                          Due Date
                        </Typography>
                        <Typography sx={{
                          fontWeight: 700,
                          color: bug.dueDate && bug.dueDate !== 'Not set' ? '#EA5455' : '#1E293B',
                          fontSize: '0.85rem'
                        }}>
                          {formatDate(bug.dueDate)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Card>

                {/* History / Audit Log Section */}
                {(bug.history && bug.history.length > 0) && (
                  <TimelineSection
                    timeline={bug.history}
                    getUserName={getUserName}
                    showFullTimeline={showFullTimeline}
                    setShowFullTimeline={setShowFullTimeline}
                  />
                )}
              </Stack>
            </Box>
          </Box>
        )}

        {/* Modals & Dialogs */}
        <BugModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          bug={bug}
          onSuccess={() => {
            setEditOpen(false);
            fetchBug();
          }}
        />

        <ReassignDialog
          open={reassignOpen}
          onClose={() => setReassignOpen(false)}
          developers={developers}
          selectedDev={tempDev}
          setSelectedDev={setTempDev}
          currentUser={currentUser}
          saving={saving}
          bug={bug}
          onConfirm={async (devId, remark) => {
            const previousAssignee = bug.assigneeId || bug.assignee;
            await patch({ assigneeId: devId, remark: remark });
            setReassignOpen(false);
            fetchBug();

            // Trigger reassignment callback to show timer on card
            onReassign?.({
              bugId: bugId,
              previousAssignee: previousAssignee,
              newAssignee: devId,
              timestamp: Date.now()
            });
          }}
        />

        <StatusDialog
          open={statusOpen}
          onClose={() => setStatusOpen(false)}
          statusLabel={getStatusById(pendingStatus)?.labelname || ''}
          onConfirm={async (remark) => {
            await patch({ statusId: pendingStatus, remark: remark });
            setStatusOpen(false);
          }}
          saving={saving}
        />

        <AttachmentViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          attachments={viewerAttachments}
          initialIndex={viewerIndex}
          bugs={bugs}
          currentBugId={viewerCurrentBugId || bugId}
          onBugChange={handleViewerBugChange}
        />

        <ConfirmationDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteBug}
          title="Delete Issue"
          message="Are you sure you want to delete this issue? This action cannot be undone and will permanently remove all associated data including comments, attachments, and history."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </Box>
    </Fade>
  );
}
