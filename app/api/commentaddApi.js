import { bugApi } from './bugApi';

export const addCommentApi = async (commentData) => {
  return bugApi('commentadd', {
    p: commentData,
    f: 'Bug Management (bugmaster)',
  });
};
