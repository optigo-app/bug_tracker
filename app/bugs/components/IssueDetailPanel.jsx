'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Stack, Button, Avatar, IconButton, CircularProgress,
  Tooltip, Select, MenuItem, Dialog
} from '@mui/material';
import {
  Edit2, CheckCircle2, RotateCcw, ExternalLink, PanelRightClose, PanelRightOpen, AlertCircle, ChevronLeft, ChevronRight, Paperclip
} from 'lucide-react';
import { getRandomAvatarColor, ImageUrl, formatDateTime, formatDate, STATUS } from '@/utils/glocalfunc';
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

export default function IssueDetailPanel({ bugId, currentUser, developers, taskAssignees, onRefreshList, onViewDetails, onBack, onReassign, onPrev, onNext, hasPrev = false, hasNext = false }) {
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibleComments, setVisibleComments] = useState(8);
  const [editOpen, setEditOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerAttachments, setViewerAttachments] = useState([]);
  const [pendingStatus, setPendingStatus] = useState('');
  const [tempDev, setTempDev] = useState('');
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFullTimeline, setShowFullTimeline] = useState(false);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);

  // Load status and priority data from session storage
  useEffect(() => {
    const loadStatusData = () => {
      const data = sessionStorage.getItem('taskbugstatusData');
      if (data) {
        try {
          setStatusData(JSON.parse(data));
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
  }, []);

  const fetchBug = useCallback(async (silent = false) => {
    if (!bugId) return;
    if (!silent) { setLoading(true); setError(null); setVisibleComments(8); }
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
      setBug(normalizeBugData({
        ...bugDetails,
        attachments: attachments,
        comments: commentsWithAttachments,
        history: history
      }));

      if (!silent) setLoading(false);
    } catch (e) {
      setError(e.message);
      if (!silent) setLoading(false);
    }
  }, [bugId]);

  useEffect(() => {
    setBug(null);
    fetchBug();
  }, [fetchBug]);

  if (loading) {
    return <BugDetailSkeleton />;
  }

  const patch = async (payload) => {
    setSaving(true);
    try {
      const { status, priority, category, ...payloadWithoutIds } = payload;
      await updateBugApi({ ...payloadWithoutIds, id: bugId, userId: currentUser?.id, reporterId: bug.reporterId });
      fetchBug(true);
      onRefreshList();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (!bugId) return null;

  if (loading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%', bgcolor: '#FAFBFC' }}>
      <Stack alignItems="center" spacing={2}>
        <CircularProgress size={32} thickness={4} sx={{ color: '#4F46E5' }} />
        <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 600 }}>Loading issue…</Typography>
      </Stack>
    </Box>
  );

  if (error || !bug) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 2, bgcolor: '#FAFBFC' }}>
      <AlertCircle size={28} color="#EF4444" />
      <Typography variant="body2" color="text.secondary">Failed to load issue</Typography>
      <Button size="small" onClick={() => fetchBug()} sx={{ fontWeight: 700 }}>Retry</Button>
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

  const assigneeDisplayName = getMemberNameByRef(bug.assigneeId || bug.assignee, bug.assignee || 'Unassigned');
  const reporterDisplayName = getMemberNameByRef(bug.reporterId || bug.reporter, bug.reporter || 'Unknown');
  const assigneeMember = getMemberByRef(bug.assigneeId || bug.assignee);
  const reporterMember = getMemberByRef(bug.reporterId || bug.reporter);
  const aColors = getRandomAvatarColor(assigneeDisplayName || '');
  const rColors = getRandomAvatarColor(reporterDisplayName || '');
  const aImageSrc = ImageUrl(assigneeMember);
  const rImageSrc = ImageUrl(reporterMember);

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: 'white' }}>
      {/* ─── Center Column: Content & Conversations ─── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #E5E7EB',
          bgcolor: '#FFFFFF',
          ...slimScroll
        }}
      >

        {/* Header Section */}
        <Box sx={{ p: 2, pb: 1.5, borderBottom: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Title with bugNo inline */}
              <Typography sx={{
                fontWeight: 700, letterSpacing: '-0.01em',
                lineHeight: 1.25, fontSize: '1.1rem',
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {bug.bugNo ? (
                  <>
                    <Typography component="span" sx={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: '#6366F1',
                      fontFamily: 'monospace',
                      letterSpacing: '0.02em',
                      mr: 0.5
                    }}>
                      {bug.bugNo}
                    </Typography>
                    {' '}{bug.title}
                  </>
                ) : bug.title}
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.75} alignItems="center">
              <Tooltip title="Previous">
                <span>
                  <IconButton
                    size="small"
                    onClick={onPrev}
                    disabled={!hasPrev}
                    sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', width: 32, height: 32, color: '#64748B', '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' } }}
                  >
                    <ChevronLeft size={15} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Next">
                <span>
                  <IconButton
                    size="small"
                    onClick={onNext}
                    disabled={!hasNext}
                    sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', width: 32, height: 32, color: '#64748B', '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' } }}
                  >
                    <ChevronRight size={15} />
                  </IconButton>
                </span>
              </Tooltip>
              {permissions.canEditBug(currentUser) && (
                <Tooltip title="Edit Bug">
                  <IconButton size="small" onClick={() => setEditOpen(true)}
                    sx={{ borderRadius: '8px', color: '#6366F1', bgcolor: 'rgba(99, 102, 241, 0.08)', width: 32, height: 32, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.12)' } }}>
                    <Edit2 size={15} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}>
                <IconButton size="small" onClick={() => setShowSidebar(!showSidebar)}
                  sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', width: 32, height: 32, color: '#64748B', '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' } }}>
                  {showSidebar ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="View Details">
                <IconButton size="small" onClick={onViewDetails}
                  sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', width: 32, height: 32, color: '#64748B', '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' } }}>
                  <ExternalLink size={15} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={0.75} sx={{ mt: 1, justifyContent: 'flex-end' }}>
            {permissions.canVerifyBug(currentUser) && currentStatusLabel === 'Ready For Test' && (
              <>
                <Button size="small" variant="contained" startIcon={<CheckCircle2 size={14} />}
                  onClick={() => {
                    const closedStatus = getStatusByLabel('Verified');
                    if (closedStatus) { setPendingStatus(closedStatus.id); setStatusOpen(true); }
                  }} disabled={saving}
                  className='buttonClassname'
                  sx={{ padding: '0px 10px' }}
                >
                  Verify
                </Button>
                <Button size="small" variant="contained" startIcon={<RotateCcw size={14} />}
                  onClick={() => {
                    const reopenStatus = getStatusByLabel('Reopen');
                    if (reopenStatus) { setPendingStatus(reopenStatus.id); setStatusOpen(true); }
                  }} disabled={saving}
                  className='dangerbtnClassname'
                >
                  Reopen
                </Button>
              </>
            )}
            {permissions.canChangeBugStatus(currentUser) && ['In Progress'].includes(currentStatusLabel) && (
              <Button size="small" variant="contained" startIcon={<CheckCircle2 size={14} />}
                onClick={() => {
                  const readyTestStatus = getStatusByLabel('Fixed');
                  if (readyTestStatus) { setPendingStatus(readyTestStatus.id); setStatusOpen(true); }
                }} disabled={saving}
                className='buttonClassname'
              >
                Resolve
              </Button>
            )}
            {permissions.canChangeBugStatus(currentUser) && ['Verified', 'Closed'].includes(currentStatusLabel) && (
              <Button size="small" variant="contained" startIcon={<RotateCcw size={14} />}
                onClick={() => {
                  const reopenStatus = getStatusByLabel('Reopen');
                  if (reopenStatus) { setPendingStatus(reopenStatus.id); setStatusOpen(true); }
                }} disabled={saving}
                className='buttonClassname'
              >
                Reopen
              </Button>
            )}
          </Stack>
        </Box>

        {/* Attachment Slider (Full-Width, No Padding) */}
        {bug.attachments?.length > 0 && (
          <Box sx={{ width: '100%' }}>
            <AttachmentSlider
              attachments={bug.attachments}
              onImageClick={(idx) => {
                setViewerAttachments(bug.attachments || []);
                setViewerIndex(idx);
                setViewerOpen(true);
              }}
            />
          </Box>
        )}

        {/* Padded Content Area */}
        <Box sx={{ p: 2, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Description Section */}
          {bug?.description && (
            <Box sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', mb: 1, letterSpacing: '0.08em' }}>
                Description
              </Typography>
              <Box sx={{ bgcolor: '#F8FAFC', p: 2.25, borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.88rem' }}>
                  {bug.description || <em style={{ color: '#94A3B8' }}>No description provided.</em>}
                </Typography>
              </Box>
            </Box>
          )}
          {/* Activity Section */}
          <Box>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#444050', mb: 0.25, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
              Activity
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
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
                  <Box key={c.id} sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      src={commentImageSrc}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '14px',
                        textTransform: 'capitalize',
                        backgroundColor: commentImageSrc ? 'transparent' : commentAvatarColor,
                      }}
                    >
                      {!commentImageSrc && commentMemberName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ p: 2, borderRadius: '0 16px 16px 16px', bgcolor: '#F8FAFC', border: '1px solid transparent' }}>
                        <Stack direction="row" spacing={1.2} alignItems="baseline" sx={{ mb: 1 }}>
                          <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.85rem' }}>{commentMemberName}</Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.65rem' }}>{formatDateTime(c.createdAt)}</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, fontSize: '0.85rem' }}>{c.content}</Typography>

                        {normalizedAttachments.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1.2, flexWrap: 'wrap', gap: 1 }}>
                            {normalizedAttachments.map((file, idx) => (
                              <Box
                                key={file.id || idx}
                                onClick={() => {
                                  setViewerAttachments(normalizedAttachments);
                                  setViewerIndex(idx);
                                  setViewerOpen(true);
                                }}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.8,
                                  p: 0.6,
                                  pr: 1,
                                  bgcolor: '#FFFFFF',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: 1.2,
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: '#F8FAFC' }
                                }}
                              >
                                {file.type === 'image' ? (
                                  <Box
                                    component="img"
                                    src={file.url}
                                    sx={{ width: 18, height: 18, borderRadius: 0.5, objectFit: 'cover' }}
                                  />
                                ) : (
                                  <Paperclip size={12} color="#64748B" />
                                )}
                                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', maxWidth: 190 }} noWrap>
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
                <Button size="small" onClick={() => setVisibleComments(prev => prev + 5)} sx={{ alignSelf: 'center', color: '#6366F1', fontWeight: 700 }}>
                  Load more messages
                </Button>
              )}
            </Stack>

            {/* New Comment Input */}
            <CommentInput bugId={bugId} currentUser={currentUser} onCommentAdded={() => fetchBug(true)} />
          </Box>
        </Box>
      </Box>

      {/* ─── Right Column: Issue Info Panels ─── */}
      {showSidebar && (
        <Box sx={{
          width: 280,
          bgcolor: '#F8FAFC',
          p: 2,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
          overflowX: 'hidden',
          ...slimScroll
        }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#444050', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issue Info</Typography>

            <Stack spacing={1.5}>
              {/* Status & Priority Section */}
              <Box sx={{ bgcolor: '#FFFFFF', p: 2, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.05em' }}>
                  Status & Priority
                </Typography>
                <Stack spacing={1.5}>
                  {/* Status */}
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                      CURRENT STATUS
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
                          height: 32,
                          borderRadius: 1,
                          fontWeight: 600,
                          fontSize: '0.8rem',

                          bgcolor: ss.bg,
                          color: ss.color,

                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',

                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'transparent'
                          },

                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: ss.border
                          },

                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: ss.border
                          }
                        }}

                        // 🔥 Dropdown container styling (Paper root)
                        MenuProps={{
                          PaperProps: {
                            elevation: 0,
                            sx: {
                              mt: 1,
                              borderRadius: 2,
                              overflow: 'hidden',

                              border: '1px solid #E2E8F0',
                              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',

                              backdropFilter: 'blur(6px)',

                              py: 0.5
                            }
                          },
                          MenuListProps: {
                            sx: {
                              py: 0.5
                            }
                          }
                        }}
                      >
                        {statusData.map(s => (
                          <MenuItem
                            key={s.id}
                            value={s.id}
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              textTransform: 'capitalize',
                              borderRadius: 1,
                              mx: 0.5,
                              my: 0.25,
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                backgroundColor: '#F1F5F9'
                              },
                              '&.Mui-selected': {
                                backgroundColor: '#EEF2FF',
                                color: '#4F46E5'
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: '#E0E7FF'
                              }
                            }}
                          >
                            {s.labelname}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : <StatusBadge status={bug.status} />}
                  </Box>

                  {/* Priority */}
                  {bug.priority && (
                    <Box>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                        PRIORITY LEVEL
                      </Typography>
                      <PriorityBadge priority={bug.priority} />
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* People Section */}
              <Box sx={{ bgcolor: '#FFFFFF', p: 2, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}>
                <Stack spacing={1.5}>
                  {/* Assignee */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748B' }}>
                        ASSIGNED TO
                      </Typography>
                      {permissions.canReassignBug(currentUser) && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => { setTempDev(bug.assigneeId); setReassignOpen(true); }}
                          sx={{ fontSize: '0.65rem', fontWeight: 700, p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', color: '#6366F1' } }}
                        >
                          CHANGE
                        </Button>
                      )}
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      onClick={() => { if (permissions.canReassignBug(currentUser)) { setTempDev(bug.assigneeId); setReassignOpen(true); } }}
                      sx={{
                        p: 1,
                        border: '1px solid #F1F5F9',
                        borderRadius: '8px',
                        bgcolor: '#F8FAFC',
                        cursor: permissions.canReassignBug(currentUser) ? 'pointer' : 'default',
                        '&:hover': permissions.canReassignBug(currentUser) ? { borderColor: '#E2E8F0', bgcolor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' } : {}
                      }}
                    >
                      <Avatar
                        src={aImageSrc}
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '14px',
                          textTransform: 'capitalize',
                          backgroundColor: aImageSrc ? 'transparent' : aColors,
                        }}
                      >
                        {!aImageSrc && assigneeDisplayName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', lineHeight: 1.1 }}>{assigneeDisplayName || 'Unassigned'}</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Reporter */}
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                      REPORTED BY
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 0.75, border: '1px solid #F1F5F9', borderRadius: '8px', bgcolor: '#F8FAFC' }}>
                      <Avatar
                        src={rImageSrc}
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '14px',
                          textTransform: 'capitalize',
                          backgroundColor: rImageSrc ? 'transparent' : rColors,
                        }}
                      >
                        {!rImageSrc && reporterDisplayName.charAt(0)}
                      </Avatar>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>{reporterDisplayName}</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* Metadata & Dates Section */}
              <Box sx={{ bgcolor: '#FFFFFF', p: 2, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.05em' }}>
                  Additional Info
                </Typography>
                <Stack spacing={1.5}>
                  {/* Category */}
                  {bug.category && (
                    <Box>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                        CATEGORY
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', bgcolor: '#F1F5F9', px: 1, py: 0.4, borderRadius: 1 }}>
                        {typeof bug.category === 'object' ? bug.category.label : bug.category}
                      </Typography>
                    </Box>
                  )}

                  {/* Environment */}
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                      ENVIRONMENT
                    </Typography>
                    {bug.environment ? (
                      <Stack direction="row" spacing={0.75}>
                        {(() => {
                          try {
                            const env = typeof bug.environment === 'string' ? JSON.parse(bug.environment) : bug.environment;
                            const activeEnvs = Object.entries(env).filter(([_, active]) => active);
                            return activeEnvs.length > 0 ? activeEnvs.map(([name]) => (
                              <Typography key={name} variant="caption" sx={{ fontWeight: 600, color: '#059669', bgcolor: '#DCFCE7', px: 0.75, py: 0.3, borderRadius: 1, textTransform: 'capitalize', fontSize: '0.7rem' }}>
                                {name}
                              </Typography>
                            )) : (
                              <Typography variant="caption" sx={{ fontWeight: 500, color: '#9CA3AF', fontStyle: 'italic' }}>
                                Not Specified
                              </Typography>
                            );
                          } catch (e) {
                            return <Typography variant="caption" sx={{ fontWeight: 500, color: '#9CA3AF', fontStyle: 'italic' }}>Not Specified</Typography>;
                          }
                        })()}
                      </Stack>
                    ) : (
                      <Typography variant="caption" sx={{ fontWeight: 500, color: '#9CA3AF', fontStyle: 'italic' }}>
                        Not Specified
                      </Typography>
                    )}
                  </Box>

                  {/* Dates */}
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748B', mb: 1 }}>
                      TIMELINE
                    </Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Created</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', bgcolor: '#F8FAFC', px: 0.75, py: 0.25, borderRadius: 0.5, border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
                          {new Date(bug.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Due Date</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: bug.dueDate && bug.dueDate !== 'Not set' ? '#DC2626' : '#9CA3AF', bgcolor: bug.dueDate && bug.dueDate !== 'Not set' ? '#FEE2E2' : '#F8FAFC', px: 0.75, py: 0.25, borderRadius: 0.5, border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
                          {formatDate(bug.dueDate)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* History Section */}
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

      {/* Modals */}
      <BugModal open={editOpen} onClose={() => setEditOpen(false)} bug={bug} onSuccess={() => { setEditOpen(false); fetchBug(); onRefreshList(); }} />
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
          const newAssigneeName = getMemberNameByRef(devId, 'Unknown');
          await patch({ assigneeId: devId, remark: remark });
          setReassignOpen(false);
          fetchBug();
          onRefreshList();

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
        attachments={viewerAttachments.length > 0 ? viewerAttachments : bug.attachments}
        initialIndex={viewerIndex}
      />
    </Box>
  );
}
