import { bugApi } from './bugApi';

export const getBugDetailApi = async (bugId) => {
  return bugApi('bugdetail', {
    p: { id: bugId },
    f: 'Bug Management (bugmaster)',
  });
};
