import { bugApi } from './bugApi';

export const updateBugApi = async (bugData) => {
  return bugApi('bugupdate', {
    p: bugData,
    f: 'Bug Management (bugmaster)',
  });
};
