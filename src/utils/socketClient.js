import { io } from 'socket.io-client';
import { SocketEvents } from './socketEvents';

// Socket configuration
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.userId = null;
  }

  // Initialize socket connection
  connect(userId) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    this.userId = userId;

    this.socket = io(SOCKET_URL, {
      auth: {
        userId: userId,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up default event listeners
    this.setupDefaultListeners();

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Setup default listeners
  setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on(SocketEvents.CONNECT, () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on(SocketEvents.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on(SocketEvents.ERROR, (error) => {
      console.error('Socket error:', error);
    });
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.on(event, callback);

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Unsubscribe from an event
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.listeners.delete(event);
      }
    }
  }

  // Emit an event with receive event pattern
  emit(event, payload = {}) {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    const data = {
      ...payload,
      receiveEvent: payload.receiveEvent || `${event}_receive`,
    };

    this.socket.emit(event, data);
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }

  // Join a room
  joinRoom(room) {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.emit('join_room', room);
  }

  // Leave a room
  leaveRoom(room) {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.emit('leave_room', room);
  }
}

// Export singleton instance
export const socketClient = new SocketClient();

// Export hook for React components
export const useSocket = () => {
  return {
    socket: socketClient,
    connect: socketClient.connect.bind(socketClient),
    disconnect: socketClient.disconnect.bind(socketClient),
    on: socketClient.on.bind(socketClient),
    off: socketClient.off.bind(socketClient),
    emit: socketClient.emit.bind(socketClient),
    isConnected: socketClient.isConnected.bind(socketClient),
    getSocketId: socketClient.getSocketId.bind(socketClient),
    joinRoom: socketClient.joinRoom.bind(socketClient),
    leaveRoom: socketClient.leaveRoom.bind(socketClient),
  };
};
