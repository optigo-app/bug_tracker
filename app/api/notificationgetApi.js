import { bugApi } from './bugApi';

export const getNotificationsApi = async (userId) => {
  return bugApi('notificationget', {
    p: { userId: userId },
    f: 'Bug Management (bugmaster)',
  });
};
