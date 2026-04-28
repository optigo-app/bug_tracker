import { uploadFilesForBug } from '@/src/utils/bugAttachmentApi';
import { saveBugApi } from '@/app/api/bugsaveApi';
import { updateBugApi } from '@/app/api/bugupdateApi';

export const handleSubmit = async (e, formData, attachments, currentUser, isEdit, bug, onClose, onSuccess) => {
  e.preventDefault();

  const bugIdForSubmit = isEdit
    ? bug.id
    : ('b' + Date.now() + Math.random().toString(36).substring(2, 9));

  const filesToUpload = attachments
    .filter(att => typeof window !== 'undefined' && typeof window.File !== 'undefined' && att?.file instanceof window.File)
    .map(att => att.file);

  let uploadedAttachments = [];
  if (filesToUpload.length > 0) {
    const uploadResult = await uploadFilesForBug({
      bugId: bugIdForSubmit,
      files: filesToUpload,
    });

    if (!uploadResult.success) {
      console.error('Failed to upload bug attachments:', uploadResult.error);
      return;
    }

    uploadedAttachments = uploadResult.attachments;
  }

  const payload = {
    ...formData,
    id: bugIdForSubmit,
    reporterId: isEdit ? (bug?.reporterId || currentUser?.id) : currentUser?.id,
    userId: currentUser?.id,
    statusId: formData.status || '',
    priorityId: formData.priority || '',
    categoryId: formData.category || '',
    environment: JSON.stringify(formData.environment),
    attachments: uploadedAttachments,
  };

  try {
    if (isEdit) {
      await updateBugApi(payload);
    } else {
      await saveBugApi(payload);
    }
    onClose();
    if (onSuccess) onSuccess(isEdit ? undefined : payload);
  } catch (error) {
    console.error('Failed to save bug:', error);
  }
};

export const initializeFormData = (bug, taskNo, taskName, taskId, isEdit, INITIAL_FORM_DATA) => {
  if (bug) {
    return {
      title: bug.title || '',
      description: bug.description || '',
      assigneeId: bug.assigneeId || '',
      priority: bug.priorityId || bug.priority || '',
      status: bug.statusId || bug.status || '',
      dueDate: bug.dueDate ? new Date(bug.dueDate).toISOString().split('T')[0] : '',
      category: bug.categoryId || bug.category || '',
      environment: (() => {
        if (typeof bug.environment === 'object') return bug.environment;
        if (typeof bug.environment === 'string' && bug.environment.trim() !== '') {
          try {
            return JSON.parse(bug.environment);
          } catch (e) {
            return { local: false, live: false };
          }
        }
        return { local: false, live: false };
      })(),
      taskNo: bug.taskNo || '',
      taskName: bug.taskName || '',
      taskId: bug.taskId || ''
    };
  } else {
    return {
      ...INITIAL_FORM_DATA,
      taskNo: taskNo || '',
      taskName: taskName || '',
      taskId: taskId || ''
    };
  }
};

export const initializeAttachments = (bug) => {
  if (bug?.attachments) {
    return bug.attachments.map(att => ({
      ...att,
      name: att.name || att.fileName,
      url: att.url || att.filePath,
      type: att.type || att.mimeType,
      file: att.file,
      isExisting: !att.file
    }));
  }
  return [];
};
