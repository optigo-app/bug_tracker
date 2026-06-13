'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchBugListApi } from '@/app/api/buglistApi';
import { normalizeBugList } from '@/utils/normalizeBugData';

const BugContext = createContext();

export const BugProvider = ({ children }) => {
  const [bugs, setBugs] = useState([]);
  const [totalBugCount, setTotalBugCount] = useState(0);
  const [todayBugCount, setTodayBugCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bugsLoaded, setBugsLoaded] = useState(false);
  const [reportBugSignal, setReportBugSignal] = useState(0);
  const [refreshDetailSignal, setRefreshDetailSignal] = useState(0);
  const [dashboardScope, setDashboardScope] = useState('me');

  const triggerReportBug = useCallback(() => setReportBugSignal(prev => prev + 1), []);
  const triggerRefreshDetail = useCallback(() => setRefreshDetailSignal(prev => prev + 1), []);

  const fetchBugsGlobal = useCallback(async (forceRefresh = false) => {
    let currentBugs = [];
    setBugs((prev) => {
      currentBugs = prev;
      return prev;
    });

    // Return cache if loaded and not forced to refresh
    if (bugsLoaded && !forceRefresh) {
      return currentBugs;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchBugListApi({
        taskId: '',
        filterType: 'team',
      });
      const data = response?.rd || response?.rd1 || [];
      const normalizedBugs = normalizeBugList(data);
      setBugs(normalizedBugs);
      setBugsLoaded(true);
      return normalizedBugs;
    } catch (err) {
      console.error('Error fetching global bugs:', err);
      setError('Failed to fetch bug list.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [bugsLoaded]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBugs = bugs.filter(bug => {
      const bugDate = new Date(bug.entrydate);
      return bugDate >= today && bugDate < tomorrow;
    });

    setTotalBugCount(bugs.length);
    setTodayBugCount(todayBugs.length);
  }, [bugs]);

  return (
    <BugContext.Provider
      value={{
        bugs,
        setBugs,
        totalBugCount,
        todayBugCount,
        isLoading,
        error,
        bugsLoaded,
        setBugsLoaded,
        fetchBugsGlobal,
        reportBugSignal,
        triggerReportBug,
        refreshDetailSignal,
        triggerRefreshDetail,
        dashboardScope,
        setDashboardScope,
      }}
    >
      {children}
    </BugContext.Provider>
  );
};

export const useBugContext = () => {
  const context = useContext(BugContext);
  if (!context) {
    throw new Error('useBugContext must be used within a BugProvider');
  }
  return context;
};

