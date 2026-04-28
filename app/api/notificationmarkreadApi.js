import { bugApi } from './bugApi';

export const markNotificationReadApi = async (notificationId) => {
  return bugApi('notificationmarkread', {
    p: { id: notificationId },
    f: 'Bug Management (bugmaster)',
  });
};
