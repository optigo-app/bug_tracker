import { bugApi } from './bugApi';

export const getCommentsApi = async (bugId) => {
  return bugApi('commentget', {
    p: { bugId: bugId },
    f: 'Bug Management (bugmaster)',
  });
};
