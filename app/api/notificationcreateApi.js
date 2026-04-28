import { bugApi } from './bugApi';

export const createNotificationApi = async (notificationData) => {
  return bugApi('notificationcreate', {
    p: notificationData,
    f: 'Bug Management (bugmaster)',
  });
};
