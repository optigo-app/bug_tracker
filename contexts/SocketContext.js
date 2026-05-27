'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketClient } from '@/src/utils/socketClient';
import { SocketEvents } from '@/src/utils/socketEvents';

const SocketContext = createContext(null);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Get user ID from session storage
    const getAuthData = () => {
      if (typeof window === 'undefined') return null;
      try {
        const authData = sessionStorage.getItem('AuthqueryParams');
        return authData ? JSON.parse(authData) : null;
      } catch (error) {
        return null;
      }
    };

    const authData = getAuthData();
    const userId = authData?.uid;

    if (userId) {
      // Connect to socket
      socketClient.connect(userId);

      // Join user's personal room
      socketClient.joinRoom(`user_${userId}`);

      // Set up connection status listener
      socketClient.on(SocketEvents.CONNECT, () => {
        setIsConnected(true);
      });

      socketClient.on(SocketEvents.DISCONNECT, () => {
        setIsConnected(false);
      });

      // Listen for new notifications
      socketClient.on(SocketEvents.NOTIFICATION_RECEIVED, (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      // Listen for bug updates
      socketClient.on(SocketEvents.BUG_CREATED, (bug) => {
        console.log('New bug created:', bug);
      });

      socketClient.on(SocketEvents.BUG_UPDATED, (bug) => {
        console.log('Bug updated:', bug);
      });

      socketClient.on(SocketEvents.BUG_ASSIGNED, (data) => {
        console.log('Bug assigned:', data);
        setUnreadCount((prev) => prev + 1);
      });

      socketClient.on(SocketEvents.BUG_STATUS_CHANGED, (data) => {
        console.log('Bug status changed:', data);
      });

      // Listen for comment events
      socketClient.on(SocketEvents.COMMENT_ADDED, (comment) => {
        console.log('New comment added:', comment);
      });
    }

    // Cleanup on unmount
    return () => {
      socketClient.disconnect();
      setIsConnected(false);
    };
  }, []);

  const value = {
    socket: socketClient,
    isConnected,
    notifications,
    unreadCount,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
