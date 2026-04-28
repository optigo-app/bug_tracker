import { bugApi } from './bugApi';

export const deleteBugApi = async (bugId) => {
  return bugApi('bugdelete', {
    p: { id: bugId },
    f: 'Bug Management (bugmaster)',
  });
};
