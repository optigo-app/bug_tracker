import { bugApi } from './bugApi';

export const createNotificationApi = async (notificationData) => {
  return bugApi('notificationcreate', {
    p: {
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      relatedId: notificationData.relatedId,
    },
    f: 'Bug Management (bugmaster)',
  });
};
