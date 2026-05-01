'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const BugContext = createContext();

export const BugProvider = ({ children }) => {
  const [bugs, setBugs] = useState([]);
  const [totalBugCount, setTotalBugCount] = useState(0);
  const [todayBugCount, setTodayBugCount] = useState(0);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBugs = bugs.filter(bug => {
      const bugDate = new Date(bug.createdAt);
      return bugDate >= today && bugDate < tomorrow;
    });

    setTotalBugCount(bugs.length);
    setTodayBugCount(todayBugs.length);
  }, [bugs]);

  return (
    <BugContext.Provider value={{ bugs, setBugs, totalBugCount, todayBugCount }}>
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
