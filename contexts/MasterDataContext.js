'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { fetchMasterGlFunc } from '@/app/api/masterApi';

const MasterDataContext = createContext();

const REQUIRED_KEYS = [
  'taskAssigneeData',
  'UserProfileData',
  'taskbugstatusData',
  'taskbugpriorityData',
];

function hasAllRequiredData() {
  if (typeof window === 'undefined') return false;
  return REQUIRED_KEYS.every((key) => {
    const item = localStorage.getItem(key);
    return item && item !== '[]' && item !== '{}';
  });
}

export const MasterDataProvider = ({ children }) => {
  const [isMasterDataReady, setIsMasterDataReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    return hasAllRequiredData();
  });
  const [isLoading, setIsLoading] = useState(false);
  const fetchPromiseRef = useRef(null);

  const hydrateFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const ready = hasAllRequiredData();
    setIsMasterDataReady(ready);
    return ready;
  }, []);

  const fetchMasterData = useCallback(async () => {
    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    setIsLoading(true);
    const promise = (async () => {
      try {
        await fetchMasterGlFunc();
      } catch (error) {
        console.error('MasterDataContext: fetch failed:', error);
      } finally {
        hydrateFromStorage();
        setIsLoading(false);
        fetchPromiseRef.current = null;
      }
    })();

    fetchPromiseRef.current = promise;
    return promise;
  }, [hydrateFromStorage]);

  const ensureMasterData = useCallback(async () => {
    if (isMasterDataReady) return;
    if (hydrateFromStorage()) return;
    await fetchMasterData();
  }, [isMasterDataReady, hydrateFromStorage, fetchMasterData]);

  const refreshMasterData = useCallback(async () => {
    await fetchMasterData();
  }, [fetchMasterData]);

  // Eager fetch on mount if data is missing
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (hasAllRequiredData()) {
        setIsMasterDataReady(true);
        return;
      }
      setIsLoading(true);
      try {
        await fetchMasterData();
      } catch (error) {
        console.error('MasterDataContext: init fetch failed:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [fetchMasterData]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (REQUIRED_KEYS.includes(e.key)) {
        hydrateFromStorage();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [hydrateFromStorage]);

  return (
    <MasterDataContext.Provider
      value={{
        isMasterDataReady,
        isLoading,
        ensureMasterData,
        refreshMasterData,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
};
