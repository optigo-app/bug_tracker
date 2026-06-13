import { bugApi } from './bugApi';

export const getDashboardApi = async (params = {}) => {
  return bugApi('dashboard', {
    p: params,
    f: 'Bug Management (bugmaster)',
  });
};
