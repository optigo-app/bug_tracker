import { bugApi } from './bugApi';

export const getDashboardApi = async () => {
  return bugApi('dashboard', {
    p: {},
    f: 'Bug Management (bugmaster)',
  });
};
