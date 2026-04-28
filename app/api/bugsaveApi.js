import { bugApi } from './bugApi';

export const saveBugApi = async (bugData) => {
  return bugApi('bugsave', {
    p: bugData,
    f: 'Bug Management (bugmaster)',
  });
};
