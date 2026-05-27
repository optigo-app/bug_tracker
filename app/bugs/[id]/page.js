'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Typography, Grid, Paper, Button, Avatar, Stack, Divider,
  IconButton, Breadcrumbs,
  Link as MuiLink, Select, MenuItem, CircularProgress, Tab, Tabs,
} from '@mui/material';
import {
  Edit2, CheckCircle2, Clock, Paperclip, MessageSquare, History,
  ChevronRight, Download, AlertCircle, RotateCcw, Calendar, File
} from 'lucide-react';
import Link from 'next/link';
import { getRandomAvatarColor, ImageUrl, handleImageError, STATUS, formatDateTime, formatDate } from '@/utils/glocalfunc';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { permissions } from '@/utils/permissions';
import AttachmentViewer from '@/components/AttachmentViewer';
import CommentSection from '@/components/CommentSection';
import TimelineSection from '@/components/TimelineSection';
import AttachmentsSection from '@/components/AttachmentsSection';
import ReassignDialog from '@/components/ReassignDialog';
import StatusDialog from '@/components/StatusDialog';
import BugModal from '@/components/BugModal';
import { getBugDetailApi } from '@/app/api/bugdetailApi';
import { updateBugApi } from '@/app/api/bugupdateApi';
import { normalizeBugData } from '@/utils/normalizeBugData';

const slimScroll = {
  '&::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    bgcolor: '#F8FAFC',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#E2E8F0',
    borderRadius: '10px',
    border: '1px solid #F8FAFC',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#CBD5E1',
  },
  scrollbarWidth: 'thin',
  scrollbarColor: '#E2E8F0 #F8FAFC',
};





function SectionLabel({ children }) {
  return (
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#7D7f85', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.75 }}>
      {children}
    </Typography>
  );
}

export default function BugDetailPage() {
  const params = useParams();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [taskAssignees, setTaskAssignees] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');
  const [selectedDev, setSelectedDev] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerAttachments, setViewerAttachments] = useState([]);

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

  const getUserName = (userRef) => {
    return getMemberNameByRef(userRef, 'Unknown');
  };

  // Helper function to render avatar with image fallback (matching DepartmentAssigneeAutocomplete style)
  const renderAvatar = (member, displayName, size = 32) => {
    const imageSrc = ImageUrl(member);
    const backgroundColor = getRandomAvatarColor(displayName || '');

    if (imageSrc) {
      return <Avatar src={imageSrc} alt={displayName} sx={{ width: size, height: size }} />;
    }
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          fontSize: size === 36 ? "16px" : size === 32 ? "14px" : "12px",
          textTransform: "capitalize",
          backgroundColor: backgroundColor,
        }}
      >
        {displayName?.charAt(0) || ''}
      </Avatar>
    );
  };

  useEffect(() => {
    // Get current user profile from sessionStorage
    const userProfileData = sessionStorage.getItem('UserProfileData');
    if (userProfileData) {
      try {
        const profile = JSON.parse(userProfileData);
        setCurrentUser({
          id: profile.id,
          name: `${profile.firstname} ${profile.lastname}`.trim() || profile.id,
          role: profile.designation || 'User',
          email: profile.userid,
          photo: profile.empphoto
        });
      } catch (error) {
        console.error('Error parsing UserProfileData:', error);
      }
    }

    // Load task assignees from sessionStorage
    const taskAssigneeData = sessionStorage.getItem('taskAssigneeData');
    if (taskAssigneeData) {
      try {
        const parsedData = JSON.parse(taskAssigneeData);
        setTaskAssignees(parsedData);
        // Map to developers format for compatibility
        const mappedDevs = parsedData.map(user => ({
          id: user.id,
          name: `${user.firstname} ${user.lastname}`.trim() || user.id,
          role: user.designation || user.department || 'Developer'
        }));
        setDevelopers(mappedDevs);
      } catch (error) {
        console.error('Error parsing taskAssigneeData:', error);
      }
    }
  }, []);

  const fetchBug = useCallback(async (silent = false) => {
    if (!params.id) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const response = await getBugDetailApi(params.id);

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
      console.error('Fetch error:', e);
      if (!silent) {
        setError(e.message || 'Connection failed');
        setLoading(false);
      }
    }
  }, [params.id]);

  useEffect(() => { fetchBug(); }, [fetchBug]);

  const patch = async (payload) => {
    setSaving(true);
    try {
      const { status, priority, category, ...payloadWithoutIds } = payload;
      await updateBugApi({ ...payloadWithoutIds, id: params.id, userId: currentUser?.id });
      fetchBug(true); // Silent refresh
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleEditSave = () => {
    setEditOpen(false);
    fetchBug();
  };

  const openEdit = () => {
    setEditOpen(true);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <Stack alignItems="center" spacing={2}>
        <CircularProgress size={36} thickness={4} />
        <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 600 }}>Loading bug details…</Typography>
      </Stack>
    </Box>
  );

  if (error || !bug || bug.error) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', gap: 2 }}>
      <Box sx={{ p: 2, bgcolor: '#FFF1F2', borderRadius: '50%' }}><AlertCircle size={32} color="#E11D48" /></Box>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Connection Issue</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, textAlign: 'center' }}>
        {error || bug?.error || "We couldn't reach the database. This might be a temporary timeout."}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <Button onClick={fetchBug} variant="contained" sx={{ borderRadius: 1.5, fontWeight: 700 }}>Retry Connection</Button>
        <Button component={Link} href="/bugs" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 700 }}>← All Bugs</Button>
      </Stack>
    </Box>
  );

  const ss = (bug.status && typeof bug.status === 'object') ? bug.status : (STATUS[bug.status] || STATUS.OPEN);
  const sortedComments = [...(bug.comments || [])].reverse();

  // Helper to get status value for comparisons (handles both object and string)
  const getStatusValue = (status) => {
    if (typeof status === 'object' && status?.label) return status.label;
    return status;
  };

  const assigneeDisplayName = getMemberNameByRef(bug.assigneeId || bug.assignee, bug.assignee || 'Unassigned');
  const reporterDisplayName = getMemberNameByRef(bug.reporterId || bug.reporter, bug.reporter || 'Unknown');
  const assigneeDisplayRole = getMemberByRef(bug.assigneeId || bug.assignee)?.designation
    || getMemberByRef(bug.assigneeId || bug.assignee)?.department
    || bug.assigneeRole
    || 'Developer';
  const assigneeMember = getMemberByRef(bug.assigneeId || bug.assignee);
  const reporterMember = getMemberByRef(bug.reporterId || bug.reporter);

  const tabContent = [
    // Tab 0: Overview (Description + Specific Attachments)
    <Box key="overview">
      <SectionLabel>Description</SectionLabel>
      {bug.description ? (
        <Typography variant="body2" sx={{ color: '#4B465C', lineHeight: 1.8, fontWeight: 400, whiteSpace: 'pre-wrap', fontSize: '0.95rem', mb: 4 }}>
          {bug.description}
        </Typography>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4, mb: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>No description has been added yet.</Typography>
          {permissions.canEditBug(currentUser, bug) && (
            <Button size="small" startIcon={<Edit2 size={14} />} sx={{ mt: 1.5, fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
              onClick={openEdit}>
              Add Description
            </Button>
          )}
        </Box>
      )}

      {bug.attachments?.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <SectionLabel sx={{ mb: 0 }}>Recent Attachments</SectionLabel>
            <Button
              size="small"
              onClick={() => setTab(3)}
              sx={{ fontWeight: 700, textTransform: 'none', color: '#7367f0', fontSize: '0.75rem' }}
            >
              View All
            </Button>
          </Stack>
          <Grid container spacing={2}>
            {bug.attachments.slice(0, 3).map((f, idx) => (
              <Grid item xs={12} sm={4} key={f.id}>
                <Box
                  onClick={() => {
                    setViewerAttachments(bug.attachments || []);
                    setActiveFileIndex(idx);
                    setViewerOpen(true);
                  }}
                  sx={{
                    p: 1.5, borderRadius: '12px', border: '1px solid #F1F5F9',
                    bgcolor: '#FFFFFF', '&:hover': { bgcolor: '#F8FAFC', borderColor: '#7367f0', boxShadow: '0 4px 12px rgba(115, 103, 240, 0.08)' },
                    transition: 'all 0.2s', cursor: 'pointer', height: '100%',
                    display: 'flex', flexDirection: 'column', gap: 1
                  }}>
                  <Box sx={{
                    height: 120, bgcolor: '#F8FAFC', borderRadius: '8px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F1F5F9'
                  }}>
                    {(f.type || f.mimeType || '').toLowerCase().startsWith('image') ? (
                      <Box component="img" src={f.url || f.filePath} onError={handleImageError} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <File size={32} color="#CBD5E1" />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, px: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#4B465C', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name || f.fileName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#A5A3AE', fontSize: '0.65rem' }}>{f.size}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>,

    // Tab 1: Comments
    <CommentSection
      key="comments"
      comments={bug.comments}
      bugId={params.id}
      currentUser={currentUser}
      getUserName={getUserName}
      onCommentAdded={(newComment) => {
        if (newComment) {
          const normalizedAttachments = Array.isArray(newComment.attachments)
            ? newComment.attachments.map((att) => ({
              ...att,
              url: att?.url ? encodeURI(att.url) : att?.url,
            }))
            : [];

          const normalizedComment = {
            ...newComment,
            attachments: normalizedAttachments,
          };

          // Instant update: add new comment to the list
          setBug(prev => ({
            ...prev,
            comments: [...(prev.comments || []), normalizedComment]
          }));
        } else {
          // Fallback: refetch if no comment data returned
          fetchBug(true);
        }
      }}
      onAttachmentClick={(file) => {
        const commentWithAttachment = (bug.comments || []).find((c) =>
          (c.attachments || []).some((a) => a.id === file.id)
        );
        const sourceAttachments = commentWithAttachment?.attachments || [];
        const localIdx = sourceAttachments.findIndex((a) => a.id === file.id);

        setViewerAttachments(sourceAttachments);
        setActiveFileIndex(localIdx !== -1 ? localIdx : 0);
        setViewerOpen(true);
      }}
    />,

    // Tab 2: History (Timeline)
    <TimelineSection
      key="history"
      timeline={bug.history}
      getUserName={getUserName}
      showFullTimeline={showFullTimeline}
      setShowFullTimeline={setShowFullTimeline}
    />,

    <AttachmentsSection
      key="attachments"
      attachments={bug.attachments}
      onAttachmentClick={(idx) => {
        setViewerAttachments(bug.attachments || []);
        setActiveFileIndex(idx);
        setViewerOpen(true);
      }}
    />
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', overflowY: 'auto', ...slimScroll }}>

      {/* ── Top bar ────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {saving && <CircularProgress size={14} sx={{ color: '#7367f0' }} />}
          <Stack direction="row" spacing={1} alignItems="center">
            {permissions.canVerifyBug(currentUser) && getStatusValue(bug.status) === 'TESTING' && (
              <>
                <Button size="small" variant="contained" startIcon={<CheckCircle2 size={15} />}
                  onClick={() => { setPendingStatus('CLOSED'); setStatusOpen(true); }} disabled={saving}
                  sx={{
                    fontWeight: 700, borderRadius: 2, fontSize: '0.75rem', height: 32, px: 2,
                    background: 'linear-gradient(270deg, rgba(40, 199, 111, 1) 0%, #28C76F 100%)',
                    boxShadow: '0 2px 8px 0 rgba(40, 199, 111, 0.3)',
                    '&:hover': {
                      opacity: 0.9,
                      boxShadow: '0 4px 12px 0 rgba(40, 199, 111, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                    textTransform: 'none', transition: 'all 0.2s ease-in-out'
                  }}>
                  Verify & Close
                </Button>
                <Button size="small" variant="contained" startIcon={<RotateCcw size={15} />}
                  onClick={() => { setPendingStatus('REOPENED'); setStatusOpen(true); }} disabled={saving}
                  sx={{
                    fontWeight: 700, borderRadius: 2, fontSize: '0.75rem', height: 32, px: 2,
                    background: 'linear-gradient(270deg, rgba(234, 84, 85, 1) 0%, #EA5455 100%)',
                    boxShadow: '0 2px 8px 0 rgba(234, 84, 85, 0.3)',
                    '&:hover': {
                      opacity: 0.9,
                      boxShadow: '0 4px 12px 0 rgba(234, 84, 85, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                    textTransform: 'none', transition: 'all 0.2s ease-in-out'
                  }}>
                  Reopen
                </Button>
              </>
            )}
            {permissions.canChangeBugStatus(currentUser) && ['OPEN', 'IN_PROGRESS', 'REOPENED'].includes(bug.status) && currentUser?.role?.toLowerCase() === 'developer' && (
              <Button size="small" variant="contained" startIcon={<CheckCircle2 size={15} />}
                onClick={() => { setPendingStatus('TESTING'); setStatusOpen(true); }} disabled={saving}
                sx={{
                  fontWeight: 700, borderRadius: 2, fontSize: '0.75rem', height: 32, px: 2,
                  background: 'linear-gradient(270deg, rgba(115, 103, 240, 1) 0%, #7367f0 100%)',
                  boxShadow: '0 2px 8px 0 rgba(115, 103, 240, 0.3)',
                  '&:hover': {
                    opacity: 0.9,
                    boxShadow: '0 4px 12px 0 rgba(115, 103, 240, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  textTransform: 'none', transition: 'all 0.2s ease-in-out'
                }}>
                Resolve Issue
              </Button>
            )}
            {permissions.canChangeBugStatus(currentUser) && getStatusValue(bug.status) === 'CLOSED' && (
              <Button size="small" variant="contained" startIcon={<RotateCcw size={15} />}
                onClick={() => { setPendingStatus('REOPENED'); setStatusOpen(true); }} disabled={saving}
                sx={{
                  fontWeight: 700, borderRadius: 2, fontSize: '0.75rem', height: 32, px: 2,
                  background: 'linear-gradient(270deg, rgba(115, 103, 240, 1) 0%, #7367f0 100%)',
                  boxShadow: '0 2px 8px 0 rgba(115, 103, 240, 0.3)',
                  '&:hover': {
                    opacity: 0.9,
                    boxShadow: '0 4px 12px 0 rgba(115, 103, 240, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  textTransform: 'none', transition: 'all 0.2s ease-in-out'
                }}>
                Reopen Issue
              </Button>
            )}

            {permissions.canEditBug(currentUser) && (
              <IconButton onClick={openEdit} size="small"
                sx={{
                  borderRadius: '6px', color: '#7367f0', bgcolor: 'rgba(115, 103, 240, 0.08)',
                  width: 32, height: 32,
                  '&:hover': { bgcolor: 'rgba(115, 103, 240, 0.15)' }
                }}>
                <Edit2 size={16} />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Hero Card ────────────────────────────────── */}
      <Paper sx={{
        mb: 2,
        borderRadius: 2.5,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #F1F5F9',
        bgcolor: 'white'
      }}>
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5, flexWrap: 'wrap', rowGap: 0.75 }}>
            <Typography sx={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#7367f0',
              bgcolor: 'rgba(115, 103, 240, 0.08)',
              px: 1.25,
              py: 0.4,
              borderRadius: '6px',
              fontFamily: 'monospace',
              letterSpacing: '0.05em'
            }}>
              {bug.bugNo || `#BT-${bug.id?.substring(0, 6).toUpperCase()}`}
            </Typography>
            <StatusBadge status={bug.status} />
            <PriorityBadge priority={bug.priority} />
            {bug.category && (
              <Typography sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#64748b',
                bgcolor: '#f8fafc',
                px: 1.25,
                py: 0.4,
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                {typeof bug.category === 'object' ? bug.category.label : bug.category}
              </Typography>
            )}
          </Stack>

          <Typography sx={{
            fontWeight: 700,
            color: '#1e293b',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            mb: 2,
            fontSize: { xs: '1.1rem', md: '1.35rem' }
          }}>
            {bug.title}
          </Typography>

          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" sx={{ rowGap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {renderAvatar(reporterMember, reporterDisplayName, 32)}
              <Typography sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#1e293b'
              }}>
                {reporterDisplayName}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Calendar size={16} color="#7367f0" />
              <Typography sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#64748b'
              }}>
                {formatDateTime(bug.createdAt)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <MessageSquare size={16} color="#7367f0" />
              <Typography sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#64748b'
              }}>
                {bug.comments?.length || 0}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Paperclip size={16} color="#7367f0" />
              <Typography sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#64748b'
              }}>
                {bug.attachments?.length || 0}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* ── Left Column ─────────────────────────────── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ borderRadius: 2.5, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid #F1F5F9', px: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}
                sx={{
                  '& .MuiTab-root': { fontWeight: 700, fontSize: '0.82rem', color: '#94A3B8', textTransform: 'none', minHeight: 48, px: 2 },
                  '& .Mui-selected': { color: '#4F46E5' },
                  '& .MuiTabs-indicator': { bgcolor: '#4F46E5', borderRadius: '2px 2px 0 0', height: 2.5 }
                }}
              >
                <Tab label="Overview" />
                <Tab label={`Comments${bug.comments?.length ? ` (${bug.comments.length})` : ''}`} />
                <Tab label="History" />
                <Tab label={`Attachments${bug.attachments?.length ? ` (${bug.attachments.length})` : ''}`} />
              </Tabs>
            </Box>
            <Box sx={{ p: 3 }}>
              {tabContent[tab]}
            </Box>
          </Paper>
        </Grid>

        {/* ── Right Sidebar ────────────────────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>

            {/* Attributes Card */}
            <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: 'white' }}>
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F1F5F9', bgcolor: '#F8FAFC' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#4B465C', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Details & Assignment</Typography>
              </Box>
              <Stack spacing={0} divider={<Divider sx={{ borderColor: '#F1F5F9' }} />}>

                {/* Reporter (Mobile fallback) */}
                <Box sx={{ px: 3, py: 2.5, display: { md: 'none' } }}>
                  <SectionLabel>Reporter</SectionLabel>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {renderAvatar(reporterMember, reporterDisplayName, 32)}
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#4B465C' }}>{reporterDisplayName}</Typography>
                  </Stack>
                </Box>

                {/* Due Date */}
                <Box sx={{ px: 3, py: 2.5 }}>
                  <SectionLabel>Due Date</SectionLabel>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ bgcolor: '#FFF3CD', px: 2, py: 1, borderRadius: '8px', border: '1px solid #FFE69C' }}>
                    <Clock size={16} color="#856404" />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#856404' }}>
                      {formatDate(bug.dueDate)}
                    </Typography>
                  </Stack>
                </Box>

                {/* Assignee */}
                <Box sx={{ px: 3, py: 2.5 }}>
                  <SectionLabel>Assigned To</SectionLabel>
                  {permissions.canReassignBug(currentUser) ? (
                    <Select fullWidth size="small" value={bug.assigneeId ?? ''}
                      onChange={e => { setSelectedDev(e.target.value); setReassignOpen(true); }}
                      disabled={saving}
                      sx={{ borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7367f0' } }}>
                      {developers.map(d => {
                        const devMember = getMemberByRef(d.id);
                        return (
                          <MenuItem key={d.id} value={d.id}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              {renderAvatar(devMember, d.name, 28)}
                              <Box>
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#4B465C' }}>{d.name}</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#A5A3AE', fontWeight: 500 }}>{d.role.replace('_', ' ')}</Typography>
                              </Box>
                            </Stack>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  ) : (
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1, border: '1px solid #F1F5F9', borderRadius: '8px' }}>
                      {renderAvatar(assigneeMember, assigneeDisplayName, 36)}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#4B465C' }}>{assigneeDisplayName === 'Unknown' ? 'Unassigned' : assigneeDisplayName}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#A5A3AE', fontWeight: 600 }}>
                          {getMemberByRef(bug.assigneeId)?.designation || getMemberByRef(bug.assigneeId)?.department || (bug.assigneeId ? 'Team Member' : '—')}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Box>

                {/* Status Quick Select */}
                <Box sx={{ px: 3, py: 2.5 }}>
                  <SectionLabel>Update Status</SectionLabel>
                  {permissions.canChangeBugStatus(currentUser) ? (
                    <Select fullWidth size="small" value={getStatusValue(bug.status) ?? 'OPEN'}
                      onChange={e => {
                        const next = e.target.value;
                        if (['TESTING', 'REOPENED', 'CLOSED'].includes(next)) {
                          setPendingStatus(next);
                          setStatusOpen(true);
                        } else {
                          patch({ statusId: next });
                        }
                      }}
                      disabled={saving}
                      sx={{
                        borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
                        bgcolor: `${ss.color}08`, color: ss.color,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: `${ss.color}40` },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: ss.color }
                      }}>
                      {Object.keys(STATUS).map(s => <MenuItem key={s} value={s} sx={{ fontWeight: 600, fontSize: '0.85rem', color: STATUS[s].color }}>{STATUS[s].label}</MenuItem>)}
                    </Select>
                  ) : <StatusBadge status={bug.status} />}
                </Box>

              </Stack>
            </Paper>

            {/* Activity Timeline */}
            <TimelineSection
              timeline={bug.history}
              getUserName={getUserName}
              showFullTimeline={showFullTimeline}
              setShowFullTimeline={setShowFullTimeline}
            />
          </Stack>
        </Grid>
      </Grid>

      {/* Edit Bug Modal (Drawer) */}
      <BugModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        bug={bug}
        onSuccess={handleEditSave}
      />

      {/* Reassign Dialog */}
      <ReassignDialog
        open={reassignOpen}
        onClose={() => setReassignOpen(false)}
        developers={developers}
        selectedDev={selectedDev}
        setSelectedDev={setSelectedDev}
        currentUser={currentUser}
        saving={saving}
        onConfirm={async (devId, remark) => {
          await patch({ assigneeId: devId, remark: remark });
          setReassignOpen(false);
        }}
      />

      <StatusDialog
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        newStatus={pendingStatus}
        role={currentUser?.role}
        saving={saving}
        onConfirm={async (remark) => {
          await patch({ statusId: pendingStatus, remark: remark });
          setStatusOpen(false);
        }}
      />

      {/* Attachment Viewer */}
      <AttachmentViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        attachments={viewerAttachments.length > 0 ? viewerAttachments : (bug.attachments || [])}
        initialIndex={activeFileIndex}
      />
    </Box>
  );
}
