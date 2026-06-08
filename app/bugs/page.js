'use client';

import React, { Suspense, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box, Typography, Button, Stack, CircularProgress,
  Skeleton
} from '@mui/material';
import { AlertCircle, Inbox } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { permissions } from '@/utils/permissions';
import { deleteBugApi } from '@/app/api/bugdeleteApi';
import { updateBugApi } from '@/app/api/bugupdateApi';
import { slimScroll } from './constants';
import { normalizeBugData } from '@/utils/normalizeBugData';
import { getStatusOptions } from '@/components/bugModal/constants';
import IssueCard from './components/IssueCard';
import BugListHeader from './components/BugListHeader';
import FilterMenu from './components/FilterMenu';
import SortMenu from './components/SortMenu';
import BugDetailSkeleton from './components/BugDetailSkeleton';
import EmptyStateSkeleton from './components/EmptyStateSkeleton';
import IssueDetailPanel from './components/IssueDetailPanel';
import ReportBugFlow from './components/ReportBugFlow';
import { decodeUrlParams } from '@/utils/urlParams';
import { useBugContext } from '@/contexts/BugContext';
import AdvancedFilterDialog from './components/AdvancedFilterDialog';

// ─── Main Page Component ─────────────────────────────────────────────────────
function BugsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  const openReportParam = searchParams.get('openReport');
  const decodedParams = decodeUrlParams(dataParam);
  const taskNoParam = decodedParams.taskno;
  const taskNameParam = decodedParams.taskname;
  const taskIdParam = decodedParams.taskid;
  const assigneeIdsParam = decodedParams.assigneeids;
  const dueDateParam = decodedParams.duedate;
  const {
    bugs: globalBugs,
    setBugs,
    isLoading,
    error,
    bugsLoaded,
    setBugsLoaded,
    fetchBugsGlobal,
    reportBugSignal
  } = useBugContext();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [taskAssignees, setTaskAssignees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bugToDelete, setBugToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskSelectOpen, setTaskSelectOpen] = useState(false);
  const [reassignInfo, setReassignInfo] = useState(null);
  const [drawEditorOpen, setDrawEditorOpen] = useState(false);
  const [editedImage, setEditedImage] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [masterDataLoaded, setMasterDataLoaded] = useState(false);

  // Filter and Sort states
  const [filterScope, setFilterScope] = useState('all');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority-high', 'priority-low'
  const [priorityMap, setPriorityMap] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [listWidth, setListWidth] = useState(320);

  const [advFilters, setAdvFilters] = useState({
    taskNo: '',
    bugNo: '',
    status: null,
    priority: null,
    assignee: null,
    reporter: null,
    startDate: { startDate: '', endDate: '' },
    dueDate: { startDate: '', endDate: '' }
  });
  const [advFilterOpen, setAdvFilterOpen] = useState(false);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const bugListRef = useRef(null);

  const hydrateMasterDataFromStorage = useCallback(() => {
    let hasAssignees = false;
    let hasPriorities = false;
    let hasStatuses = false;

    const taskAssigneeData = sessionStorage.getItem('taskAssigneeData');
    if (taskAssigneeData) {
      try {
        const parsedData = JSON.parse(taskAssigneeData);
        const assigneeList = Array.isArray(parsedData) ? parsedData : [];
        setTaskAssignees(assigneeList);
        const mappedDevs = assigneeList.map(user => ({
          id: user.id,
          name: `${user.firstname} ${user.lastname}`.trim() || user.id,
          role: user.designation || user.department || 'Developer'
        }));
        setDevelopers(mappedDevs);
        hasAssignees = true;
      } catch (error) {
        console.error('Error parsing taskAssigneeData:', error);
      }
    }

    const priorityData = sessionStorage.getItem('taskbugpriorityData') || localStorage.getItem('taskbugpriorityData');
    if (priorityData) {
      try {
        const parsed = JSON.parse(priorityData);
        const priorityList = Array.isArray(parsed) ? parsed : [];
        const map = {};
        priorityList.forEach((item, index) => {
          map[String(item.id)] = priorityList.length - index;
        });
        setPriorityOptions(priorityList.map(item => ({
          id: String(item.id),
          label: item.labelname || item.label || item.name || item.id
        })));
        setPriorityMap(map);
        hasPriorities = true;
      } catch (error) {
        console.error('Error parsing priority data:', error);
      }
    }

    const statusData = sessionStorage.getItem('taskbugstatusData') || localStorage.getItem('taskbugstatusData');
    if (statusData) {
      try {
        const parsed = JSON.parse(statusData);
        const statusList = Array.isArray(parsed) ? parsed : [];
        setStatusOptions(statusList.map(item => ({
          id: String(item.id),
          label: item.labelname || item.label || item.name || item.id
        })));
        hasStatuses = true;
      } catch (error) {
        console.error('Error parsing status data:', error);
      }
    }

    return hasAssignees && hasPriorities && hasStatuses;
  }, []);

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
    const userProfileData = sessionStorage.getItem('UserProfileData');
    if (userProfileData) {
      try {
        const profile = JSON.parse(userProfileData);
        const userObj = {
          id: profile.id,
          name: `${profile.firstname} ${profile.lastname}`.trim() || profile.id,
          role: profile.designation || 'User',
          email: profile.userid,
          ...profile
        };
        setCurrentUser(userObj);
        const shouldFilter = permissions.shouldFilterByAssignee(userObj);
        setFilterScope(shouldFilter ? 'me' : 'all');
      } catch (error) {
        console.error('Error parsing UserProfileData:', error);
      }
    }
    setMasterDataLoaded(hydrateMasterDataFromStorage());
  }, [hydrateMasterDataFromStorage]);

  useEffect(() => {
    if (reportBugSignal > 0 && currentUser && permissions.canReportBug(currentUser)) {
      if (taskNoParam) {
        setDrawEditorOpen(true);
      } else {
        setTaskSelectOpen(true);
      }
    }
  }, [reportBugSignal, currentUser, taskNoParam]);

  useEffect(() => {
    if (!openReportParam || !currentUser) return;

    if (openReportParam === '1' && permissions.canReportBug(currentUser)) {
      if (taskNoParam) {
        setDrawEditorOpen(true);
      } else {
        setTaskSelectOpen(true);
      }
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('openReport');
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `/bugs?${nextQuery}` : '/bugs');
  }, [openReportParam, currentUser, router, searchParams, taskNoParam]);

  const fetchBugs = useCallback(async (forceRefresh = false) => {
    try {
      await fetchBugsGlobal(forceRefresh);
    } catch (err) {
      console.error('Error fetching global bugs:', err);
    }
  }, [fetchBugsGlobal]);

  const handleRefresh = () => {
    setBugsLoaded(false);
    fetchBugs(true);
  }

  const handleUpdateBug = useCallback((updatedBug) => {
    setBugs(prevBugs => {
      return prevBugs.map(bug => {
        if (bug.id === updatedBug.id) {
          return { ...bug, ...updatedBug };
        }
        return bug;
      });
    });
  }, [setBugs]);

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  // Update status options based on user role
  useEffect(() => {
    setStatusOptions(getStatusOptions(currentUser, true));
  }, [currentUser]);

  // Fetch master data if not available
  useEffect(() => {
    let isMounted = true;
    const MASTER_FETCH_TIMEOUT_MS = 8000;

    const ensureMasterData = async () => {
      const alreadyLoaded = hydrateMasterDataFromStorage();
      if (alreadyLoaded) {
        if (isMounted) setMasterDataLoaded(true);
        return;
      }

      try {
        const { fetchMasterGlFunc } = await import('@/app/api/masterApi');
        await Promise.race([
          fetchMasterGlFunc(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Master data fetch timeout')), MASTER_FETCH_TIMEOUT_MS))
        ]);
      } catch (error) {
        console.error('Error fetching master data:', error);
      } finally {
        if (!isMounted) return;
        hydrateMasterDataFromStorage();
        setMasterDataLoaded(true);
      }
    };

    ensureMasterData();

    return () => {
      isMounted = false;
    };
  }, [hydrateMasterDataFromStorage]);

  const filteredBugs = useMemo(() => {
    // Pre-calculate filter values
    const query = (search || '').toLowerCase();
    const safeStatusFilter = String(statusFilter || 'ALL').toLowerCase();
    const advTaskNo = (advFilters.taskNo || '').toLowerCase();
    const advBugNo = (advFilters.bugNo || '').toLowerCase();
    const advStatus = String(advFilters.status || '');
    const advPriority = String(advFilters.priority || '');
    const advAssignee = String(advFilters.assignee || '');
    const advReporter = String(advFilters.reporter || '');

    // Pre-calculate date ranges
    const isStartDateActive = advFilters.startDate?.startDate && advFilters.startDate?.endDate;
    const startDateRange = isStartDateActive ? {
      start: new Date(new Date(advFilters.startDate.startDate).setHours(0, 0, 0, 0)),
      end: new Date(new Date(advFilters.startDate.endDate).setHours(23, 59, 59, 999))
    } : null;

    const isDueDateActive = advFilters.dueDate?.startDate && advFilters.dueDate?.endDate;
    const dueDateRange = isDueDateActive ? {
      start: new Date(new Date(advFilters.dueDate.startDate).setHours(0, 0, 0, 0)),
      end: new Date(new Date(advFilters.dueDate.endDate).setHours(23, 59, 59, 999))
    } : null;

    // Helper function to check if bug belongs to current user
    const isUserBug = (bug) => {
      const userId = String(currentUser?.id);
      const userUserid = String(currentUser?.userid);

      const isAssigned =
        String(bug.assigneeId) === userId ||
        String(bug.assigneeId) === userUserid ||
        (bug.assignee && typeof bug.assignee === 'object'
          ? (String(bug.assignee.id) === userId || String(bug.assignee.userid) === userUserid)
          : String(bug.assignee) === userId);

      const isReporter =
        String(bug.reporterId) === userId ||
        String(bug.reporterId) === userUserid ||
        (bug.reporter && typeof bug.reporter === 'object'
          ? (String(bug.reporter.id) === userId || String(bug.reporter.userid) === userUserid)
          : String(bug.reporter?.id || bug.reporter) === userId);

      return isAssigned || isReporter;
    };

    // First filter: taskId, search, status, advFilters
    const baseFiltered = globalBugs.filter((bug) => {
      if (taskIdParam && String(bug.taskId || '') !== String(taskIdParam)) {
        return false;
      }

      const title = String(bug?.title || '').toLowerCase();
      const id = String(bug?.id || '').toLowerCase();
      const taskNo = String(bug?.taskNo || '').toLowerCase();
      const bugNo = String(bug?.bugNo || '').toLowerCase();
      const bugStatusStr = String(bug?.statusId || bug?.status || '').toLowerCase();

      const matchSearch = title.includes(query) || id.includes(query) || taskNo.includes(query) || bugNo.includes(query);
      const matchStatus = safeStatusFilter === 'all' || bugStatusStr === safeStatusFilter;
      const matchAdvTaskNo = !advTaskNo || taskNo.includes(advTaskNo);
      const matchAdvBugNo = !advBugNo || bugNo.includes(advBugNo);
      const matchAdvStatus = !advStatus || String(bug?.statusId || bug?.status) === advStatus;
      const matchAdvPriority = !advPriority || String(bug?.priorityId || bug?.priority) === advPriority;
      const matchAdvAssignee = !advAssignee || String(bug?.assigneeId) === advAssignee || String(bug?.assignee?.id) === advAssignee;
      const matchAdvReporter = !advReporter || String(bug?.reporterId) === advReporter || String(bug?.reporter?.id) === advReporter;

      const matchAdvStartDate = !isStartDateActive || (
        (bug.entrydate) &&
        new Date(bug.entrydate) >= startDateRange.start &&
        new Date(bug.entrydate) <= startDateRange.end
      );

      const matchAdvDueDate = !isDueDateActive || (
        bug.dueDate &&
        new Date(bug.dueDate) >= dueDateRange.start &&
        new Date(bug.dueDate) <= dueDateRange.end
      );

      return matchSearch && matchStatus && matchAdvTaskNo && matchAdvBugNo && matchAdvStatus && matchAdvPriority && matchAdvAssignee && matchAdvReporter && matchAdvStartDate && matchAdvDueDate;
    });

    // Calculate counts
    const meCount = baseFiltered.filter(isUserBug).length;
    const teamCount = baseFiltered.filter((bug) => !isUserBug(bug)).length;
    const allCount = baseFiltered.length;

    // Second filter: filterScope (all vs me vs team)
    const scopeFiltered = baseFiltered.filter((bug) => {
      if (filterScope === 'all') return true;
      if (filterScope === 'me') return isUserBug(bug);
      if (filterScope === 'team') return !isUserBug(bug);
      return true;
    });

    // Sort
    const sorted = scopeFiltered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.entrydate) - new Date(a.entrydate);
      if (sortBy === 'oldest') return new Date(a.entrydate) - new Date(b.entrydate);
      const pA = priorityMap[String(a.priorityId || a.priority)] || 0;
      const pB = priorityMap[String(b.priorityId || b.priority)] || 0;
      return sortBy === 'priority-high' ? pB - pA : pA - pB;
    });

    Object.assign(sorted, { meCount, teamCount, allCount });
    return sorted;
  }, [globalBugs, taskIdParam, search, statusFilter, filterScope, currentUser, sortBy, priorityMap, advFilters]);

  useEffect(() => {
    if (filteredBugs.length > 0 && !filteredBugs.find(b => b.id === selectedId)) {
      setSelectedId(filteredBugs[0].id);
    }
  }, [filteredBugs, selectedId]);

  useEffect(() => {
    bugListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filterScope]);

  const selectedIndex = filteredBugs.findIndex((bug) => bug.id === selectedId);
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < filteredBugs.length - 1;

  const handleConfirmDelete = async () => {
    if (!bugToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBugApi(bugToDelete);
      if (selectedId === bugToDelete) setSelectedId(null);
      setBugs(prev => prev.filter(b => b.id !== bugToDelete));
      setConfirmOpen(false);
      setBugToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
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
            bugCount={{
              me: filteredBugs?.meCount ?? 0,
              team: filteredBugs?.teamCount ?? 0,
              all: filteredBugs?.allCount ?? 0
            }}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setFilterAnchorEl={setFilterAnchorEl}
            setSortAnchorEl={setSortAnchorEl}
            statusOptions={statusOptions}
            filterScope={filterScope}
            setFilterScope={setFilterScope}
            setAdvFilterOpen={setAdvFilterOpen}
            advFilters={advFilters}
            setAdvFilters={setAdvFilters}
          />

          <Box
            ref={bugListRef}
            className="slim-scroll"
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              ...slimScroll
            }}
          >
            {((!bugsLoaded && !error) || !masterDataLoaded) ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} variant='rectangular' height={120} animation="wave" sx={{ bgcolor: '#f5f5f5' }} />
                ))}
              </Box>
            ) : error ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <AlertCircle size={24} color="#EF4444" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>{error}</Typography>
                <Button variant="contained" size="small" onClick={fetchBugs} sx={{ mt: 2, borderRadius: 1.5, fontWeight: 700, textTransform: 'none' }}>Retry</Button>
              </Box>
            ) : filteredBugs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Inbox size={32} color="#e0e0e0" />
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
                      await updateBugApi({ id: reassignInfo.bugId, assigneeId: reassignInfo.previousAssignee, remark: 'Reverted reassignment', userId: currentUser?.id, reporterId: globalBugs.find(b => b.id === reassignInfo.bugId)?.reporterId });
                      setReassignInfo(null);
                      handleUpdateBug({ id: reassignInfo.bugId, assigneeId: reassignInfo.previousAssignee });
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
          currentUser={currentUser}
        />

        {/* Sort Menu */}
        <SortMenu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={() => setSortAnchorEl(null)}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <Box sx={{
          flex: 1,
          overflow: 'hidden',
          display: { xs: selectedId ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
          minWidth: 0
        }}>
          {((!bugsLoaded && !error) || !masterDataLoaded) ? (
            <BugDetailSkeleton />
          ) : selectedId ? (
            <IssueDetailPanel
              key={selectedId}
              bugId={selectedId}
              currentUser={currentUser}
              developers={developers}
              taskAssignees={taskAssignees}
              onRefreshList={fetchBugs}
              onUpdateBug={handleUpdateBug}
              onViewDetails={() => router.push(`/bugs/${selectedId}`)}
              onBack={() => setSelectedId(null)}
              onReassign={(info) => setReassignInfo(info)}
              onRefress={handleRefresh}
              onPrev={() => {
                if (hasPrev) {
                  setSelectedId(filteredBugs[selectedIndex - 1]?.id || null);
                }
              }}
              onNext={() => {
                if (hasNext) {
                  setSelectedId(filteredBugs[selectedIndex + 1]?.id || null);
                }
              }}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onDelete={(deletedBugId) => {
                setBugs(prev => prev.filter(b => b.id !== deletedBugId));
                setSelectedId(null);
              }}
              bugs={filteredBugs}
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
      <AdvancedFilterDialog
        open={advFilterOpen}
        onClose={() => setAdvFilterOpen(false)}
        advFilters={advFilters}
        setAdvFilters={setAdvFilters}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        developers={developers}
        taskAssignees={taskAssignees}
      />
      <ReportBugFlow
        canReportBug={permissions.canReportBug(currentUser)}
        drawEditorOpen={drawEditorOpen}
        setDrawEditorOpen={setDrawEditorOpen}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        editedImage={editedImage}
        setEditedImage={setEditedImage}
        taskNo={taskNoParam || ''}
        taskName={taskNameParam || ''}
        taskId={taskIdParam || ''}
        assigneeids={assigneeIdsParam || ''}
        dueDate={dueDateParam || ''}
        onSuccess={async (response, saveAndNew) => {
          if (response?.rd?.[0]) {
            const responseData = response.rd[0];
            const formData = response.formData || {};

            const normalizedBug = normalizeBugData({
              id: responseData.id,
              bugNo: responseData.bugNo,
              title: formData.title,
              description: formData.description,
              taskId: formData.taskId,
              taskNo: formData.taskNo,
              taskName: formData.taskName,
              assigneeId: formData.assigneeId,
              reporterId: formData.reporterId || currentUser?.id,
              priorityId: formData.priorityId,
              statusId: formData.statusId || 'OPEN',
              categoryId: formData.categoryId,
              environment: formData.environment,
              entrydate: new Date().toISOString(),
              updateddate: new Date().toISOString(),
            });

            setBugs((prevBugs) => {
              const exists = prevBugs.some((bug) => bug.id === normalizedBug.id);
              if (exists) {
                return prevBugs.map((bug) => (bug.id === normalizedBug.id ? { ...bug, ...normalizedBug } : bug));
              }
              return [normalizedBug, ...prevBugs];
            });
            setBugs((prevGlobalBugs) => {
              const exists = prevGlobalBugs.some((bug) => bug.id === normalizedBug.id);
              if (exists) {
                return prevGlobalBugs.map((bug) => (bug.id === normalizedBug.id ? { ...bug, ...normalizedBug } : bug));
              }
              return [normalizedBug, ...prevGlobalBugs];
            });
            setSelectedId(normalizedBug.id);
          }

          if (!saveAndNew) {
            setModalOpen(false);
            setEditedImage(null);
          }
        }}
      />
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => !isDeleting && setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Issue"
        message="Are you sure you want to delete this issue? This action cannot be undone."
        loading={isDeleting}
      />
      {/* Task Selection Dialog */}
      <ConfirmationDialog
        open={taskSelectOpen}
        onClose={() => setTaskSelectOpen(false)}
        onConfirm={() => { setTaskSelectOpen(false); router.push('/tasks'); }}
        title="No Task Selected"
        message="Please select a task first to create a bug. You will be redirected to the tasks page."
        type="info"
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
