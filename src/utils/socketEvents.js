// Socket Event Names for Bug Tracker Application
export const SocketEvents = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Bug events
  BUG_CREATED: 'bug:created',
  BUG_CREATED_RECEIVE: 'bug:created_receive',
  BUG_UPDATED: 'bug:updated',
  BUG_UPDATED_RECEIVE: 'bug:updated_receive',
  BUG_DELETED: 'bug:deleted',
  BUG_DELETED_RECEIVE: 'bug:deleted_receive',
  BUG_ASSIGNED: 'bug:assigned',
  BUG_ASSIGNED_RECEIVE: 'bug:assigned_receive',
  BUG_STATUS_CHANGED: 'bug:status_changed',
  BUG_STATUS_CHANGED_RECEIVE: 'bug:status_changed_receive',

  // Comment events
  COMMENT_ADDED: 'bug_comment:added',
  COMMENT_ADDED_RECEIVE: 'bug_comment:added_receive',

  // Notification events
  NOTIFICATION_RECEIVED: 'bug_notification:received',
  NOTIFICATION_RECEIVED_RECEIVE: 'bug_notification:received_receive',
};
