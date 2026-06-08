import { bugApi } from './bugApi';
import { removeFileApi } from '@/src/utils/taskApi';

export const deleteBugApi = async (bugId) => {
  const detail = await bugApi('bugdetail', {
    p: { id: bugId },
    f: 'Bug Management (bugdetail)',
  });

  const bugAttachments = Array.isArray(detail?.rd1) ? detail.rd1 : [];
  const commentAttachments = Array.isArray(detail?.rd4) ? detail.rd4 : [];
  const allAttachments = [...bugAttachments, ...commentAttachments];

  const fileUrls = [...new Set(allAttachments
    .map((att) => att?.filepath || att?.filePath || att?.url)
    .filter(Boolean))];

  if (fileUrls.length > 0) {
    await Promise.allSettled(
      fileUrls.map((fileUrl) => removeFileApi({ attachments: fileUrl }))
    );
  }

  return bugApi('bugdelete', {
    p: { id: bugId },
    f: 'Bug Management (bugdelete)',
  });
};
