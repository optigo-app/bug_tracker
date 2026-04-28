'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Avatar, Stack, IconButton, CircularProgress, MenuItem,
  Tooltip,
  Select,
  Dialog,
} from '@mui/material';
import {
  Edit2, AlertCircle, Paperclip,
  CheckCircle2, RotateCcw, Inbox, ExternalLink,
  PanelRightClose, PanelRightOpen,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getRandomAvatarColor, ImageUrl } from '@/utils/glocalfunc';
import BugModal from '@/components/BugModal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import AttachmentViewer from '@/components/AttachmentViewer';
import CommentInput from '@/components/CommentInput';
import ReassignDialog from '@/components/ReassignDialog';
import StatusDialog from '@/components/StatusDialog';
import { permissions } from '@/utils/permissions';
import AttachmentSlider from '@/components/AttachmentSlider';
import { fetchBugListApi } from '@/app/api/buglistApi';
import { deleteBugApi } from '@/app/api/bugdeleteApi';
import { getBugDetailApi } from '@/app/api/bugdetailApi';
import { updateBugApi } from '@/app/api/bugupdateApi';
import { STATUS, slimScroll, formatDateTime, formatDate } from './constants';
import { normalizeBugList, normalizeBugData } from '@/utils/normalizeBugData';
import DrawEditor from '@/components/draw/DrawEditor';
import StatusBadge from './components/StatusBadge';
import PriorityBadge from './components/PriorityBadge';
import IssueCard from './components/IssueCard';
import BugListHeader from './components/BugListHeader';
import FilterMenu from './components/FilterMenu';
import SortMenu from './components/SortMenu';
import BugDetailSkeleton from './components/BugDetailSkeleton';
import EmptyStateSkeleton from './components/EmptyStateSkeleton';
import TimelineSection from '@/components/TimelineSection';
import IssueDetailPanel from './components/IssueDetailPanel';

// ─── Main Page Component ─────────────────────────────────────────────────────
function BugsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskNoParam = searchParams.get('taskno');
  const taskNameParam = searchParams.get('taskname');
  const taskIdParam = searchParams.get('taskid');

  const [bugs, setBugs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [taskAssignees, setTaskAssignees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bugToDelete, setBugToDelete] = useState(null);
  const [taskSelectOpen, setTaskSelectOpen] = useState(false);
  const [reassignInfo, setReassignInfo] = useState(null);
  const [drawEditorOpen, setDrawEditorOpen] = useState(false);
  const [editedImage, setEditedImage] = useState(null);

  // Filter and Sort states
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority-high', 'priority-low'
  const [isResizing, setIsResizing] = useState(false);
  const [listWidth, setListWidth] = useState(320);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 300 && newWidth <= 700) {
        setListWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing, resize, stopResizing]);

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
          ...profile
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

  useEffect(() => {
    if (taskNoParam && taskNameParam && taskIdParam && permissions.canReportBug(currentUser)) {
      setDrawEditorOpen(true);
    }
  }, [taskNoParam, taskNameParam, taskIdParam, currentUser]);

  const fetchBugs = useCallback(async () => {
    // Don't fetch if currentUser is not available yet
    if (!currentUser?.id) return;

    setIsLoading(true); setError(null);
    try {
      const response = await fetchBugListApi({
        taskId: taskIdParam || '',
        status: '',
        assigneeId: ''
      });
      const data = response?.rd || response?.rd1 || [];
      setBugs(normalizeBugList(data));
      // Auto-select first bug only if no bug is currently selected
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch (err) {
      setError('Connection failed. Check your database status.');
    } finally { setIsLoading(false); }
  }, [taskIdParam, currentUser?.id]);

  useEffect(() => { fetchBugs(); }, [fetchBugs]);

  const filteredBugs = bugs.filter(bug => {
    const query = (search || '').toLowerCase();
    const title = String(bug?.title || '').toLowerCase();
    const id = String(bug?.id || '').toLowerCase();
    const taskNo = String(bug?.taskNo || '').toLowerCase();
    const bugNo = String(bug?.bugNo || '').toLowerCase();

    const matchSearch = title.includes(query) ||
      id.includes(query) ||
      taskNo.includes(query) ||
      bugNo.includes(query);
    const matchStatus = statusFilter === 'ALL' || getStatusValue(bug.status) === statusFilter;
    return matchSearch && matchStatus;
  }).filter(bug => {
    // Show bug if it's assigned to current user OR created by current user
    const isAdmin = currentUser?.designation?.toUpperCase() === 'ADMIN';
    if (isAdmin) return true;
    const isAssigned = String(bug.assigneeId) === String(currentUser?.id) || String(bug.assignee) === String(currentUser?.id);
    const isReporter = String(bug.reporterId) === String(currentUser?.id) || String(bug.reporter) === String(currentUser?.id);
    return isAssigned || isReporter;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'priority-high') {
      const pMap = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    }
    if (sortBy === 'priority-low') {
      const pMap = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pMap[a.priority] || 0) - (pMap[b.priority] || 0);
    }
    return 0;
  });

  // Keep selectedId valid when filter changes
  useEffect(() => {
    if (filteredBugs.length > 0 && !filteredBugs.find(b => b.id === selectedId)) {
      setSelectedId(filteredBugs[0].id);
    }
  }, [filteredBugs, selectedId]);

  const handleConfirmDelete = async () => {
    if (!bugToDelete) return;
    try {
      await deleteBugApi(bugToDelete);
      if (selectedId === bugToDelete) setSelectedId(null);
      setBugs(prev => prev.filter(b => b.id !== bugToDelete));
      setConfirmOpen(false);
      setBugToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };


  if (!currentUser) return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress size={28} sx={{ color: '#4F46E5' }} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>

      {/* ── Split Panel ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Left: Issue List */}
        <Box
          sx={{
            width: { xs: selectedId ? 0 : '100%', md: listWidth },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            transition: isResizing ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1,
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Resizer Handle (WhatsApp Style) */}
          <Box
            onMouseDown={startResizing}
            sx={{
              position: 'absolute',
              right: -2,
              top: 0,
              bottom: 0,
              width: '6px',
              cursor: 'col-resize',
              zIndex: 10,
              transition: 'all 0.2s ease',
              bgcolor: isResizing ? 'rgba(115, 103, 240, 0.15)' : 'transparent',
              borderLeft: isResizing ? '2px solid #7367f0' : 'none',
              borderRight: isResizing ? '2px solid #7367f0' : 'none',
              '&:hover': {
                bgcolor: 'rgba(115, 103, 240, 0.1)',
                borderLeft: '2px solid #7367f0',
                borderRight: '2px solid #7367f0',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '3px',
                  height: '40px',
                  bgcolor: '#7367f0',
                  borderRadius: '10px',
                  opacity: 0.6
                }
              },
              '&::after': isResizing ? {
                content: '""',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '3px',
                height: '40px',
                bgcolor: '#7367f0',
                borderRadius: '10px'
              } : {},
              display: { xs: 'none', md: 'block' }
            }}
          />
          {/* Bug List Header: Search, Filter, Sort */}
          <BugListHeader
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setFilterAnchorEl={setFilterAnchorEl}
            setSortAnchorEl={setSortAnchorEl}
          />

          <Box
            className="slim-scroll"
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              ...slimScroll
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress size={24} sx={{ color: '#7367f0' }} />
              </Box>
            ) : error ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <AlertCircle size={24} color="#EF4444" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>{error}</Typography>
                <Button variant="contained" size="small" onClick={fetchBugs} sx={{ mt: 2, borderRadius: 1.5, fontWeight: 700, textTransform: 'none' }}>Retry</Button>
              </Box>
            ) : filteredBugs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Inbox size={32} color="#E2E8F0" />
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1.5, fontStyle: 'italic', fontSize: '0.8rem' }}>
                  {search ? `No results for "${search}"` : 'No issues found'}
                </Typography>
              </Box>
            ) : (
              filteredBugs.map((bug) => (
                <IssueCard
                  key={bug.id}
                  bug={bug}
                  isSelected={bug.id === selectedId}
                  onClick={() => setSelectedId(bug.id)}
                  reassignInfo={reassignInfo}
                  onUndoReassign={async () => {
                    if (reassignInfo?.previousAssignee) {
                      await updateBugApi({ id: reassignInfo.bugId, assigneeId: reassignInfo.previousAssignee, remark: 'Reverted reassignment', userId: currentUser?.id, reporterId: bugs.find(b => b.id === reassignInfo.bugId)?.reporterId });
                      setReassignInfo(null);
                      fetchBugs();
                    }
                  }}
                />
              ))
            )}
          </Box>
        </Box>

        {/* Filter Menu */}
        <FilterMenu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Sort Menu */}
        <SortMenu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={() => setSortAnchorEl(null)}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Right: Detail Panel */}
        <Box sx={{
          flex: 1,
          overflow: 'hidden',
          display: { xs: selectedId ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
          minWidth: 0
        }}>
          {selectedId ? (
            <IssueDetailPanel
              key={selectedId}
              bugId={selectedId}
              currentUser={currentUser}
              developers={developers}
              taskAssignees={taskAssignees}
              onRefreshList={fetchBugs}
              onViewDetails={() => router.push(`/bugs/${selectedId}`)}
              onBack={() => setSelectedId(null)}
              onReassign={(info) => setReassignInfo(info)}
            />
          ) : (
            <EmptyStateSkeleton
              onCreate={() => {
                if (!taskNoParam) {
                  setTaskSelectOpen(true);
                } else {
                  setDrawEditorOpen(true);
                }
              }}
              isDeveloper={!permissions.canReportBug(currentUser)}
            />
          )}
        </Box>
      </Box>

      {/* Modals */}
      <Dialog
        open={drawEditorOpen}
        onClose={() => setDrawEditorOpen(false)}
        fullScreen
        PaperProps={{ sx: { bgcolor: 'transparent' } }}
      >
        <DrawEditor
          onClose={() => setDrawEditorOpen(false)}
          onSave={(file) => {
            if (file) {
              setEditedImage(file);
            }
            setDrawEditorOpen(false);
            if (permissions.canReportBug(currentUser)) {
              setModalOpen(true);
            }
          }}
        />
      </Dialog>
      <BugModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditedImage(null); }}
        onSuccess={async (newBug) => {
          if (newBug?.id) {
            const normalizedBug = normalizeBugData({
              ...newBug,
              reporterId: newBug.reporterId || currentUser?.id,
              reporter: newBug.reporter || currentUser?.id,
              statusId: newBug.statusId || newBug.status || 'OPEN',
              priorityId: newBug.priorityId || newBug.priority || '',
              categoryId: newBug.categoryId || newBug.category || '',
              createdAt: newBug.createdAt || new Date().toISOString(),
            });

            setBugs((prevBugs) => {
              const exists = prevBugs.some((bug) => bug.id === normalizedBug.id);
              if (exists) {
                return prevBugs.map((bug) => (bug.id === normalizedBug.id ? { ...bug, ...normalizedBug } : bug));
              }
              return [normalizedBug, ...prevBugs];
            });
            setSelectedId(normalizedBug.id);
          }

          await fetchBugs();
          setTimeout(() => {
            fetchBugs();
          }, 500);

          setModalOpen(false);
          setEditedImage(null);
        }}
        bug={null}
        taskNo={taskNoParam || ''}
        taskName={taskNameParam || ''}
        taskId={taskIdParam || ''}
        initialAttachment={editedImage}
      />
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Issue"
        message="Are you sure you want to delete this issue? This action cannot be undone."
      />
      {/* Task Selection Dialog */}
      <ConfirmationDialog
        open={taskSelectOpen}
        onClose={() => setTaskSelectOpen(false)}
        onConfirm={() => { setTaskSelectOpen(false); router.push('/tasks'); }}
        title="No Task Selected"
        message="Please select a task first to create a bug. You will be redirected to the tasks page."
      />
    </Box>
  );
}

export default function BugsPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={36} thickness={4} />
          <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 600 }}>Loading bugs...</Typography>
        </Stack>
      </Box>
    }>
      <BugsPageContent />
    </Suspense>
  );
}
