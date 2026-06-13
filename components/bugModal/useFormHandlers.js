import { uploadFilesForBug } from '@/src/utils/bugAttachmentApi';
import { saveBugApi } from '@/app/api/bugsaveApi';
import { updateBugApi } from '@/app/api/bugupdateApi';
import { removeFileApi } from '@/src/utils/taskApi';
import toast from 'react-hot-toast';
import { getFileNameFromUrl, getMimeTypeFromUrl } from '@/utils/fileUtils';

export const handleSubmit = async (e, formData, attachments, currentUser, isEdit, bug, onClose, onSuccess, saveAndNew = false, removedAttachments = []) => {
  e.preventDefault();

  const bugIdForSubmit = isEdit
    ? bug.id
    : null; // Let SQL generate the ID

  // Remove files from server that were marked for deletion
  if (removedAttachments.length > 0) {
    try {
      await Promise.all(removedAttachments.map(filePath => removeFileApi({ attachments: filePath })));
    } catch (error) {
      console.error('Failed to remove some files from server:', error);
    }
  }

  const filesToUpload = attachments
    .filter(att => typeof window !== 'undefined' && typeof window.File !== 'undefined' && att?.file instanceof window.File)
    .map(att => att.file);

  let uploadedAttachments = [];
  if (filesToUpload.length > 0) {
    const uploadResult = await uploadFilesForBug({
      bugId: bugIdForSubmit || 'temp_' + Date.now(),
      files: filesToUpload,
    });

    if (!uploadResult.success) {
      console.error('Failed to upload bug attachments:', uploadResult.error);
      return;
    }

    uploadedAttachments = uploadResult.attachments;
  }

  // For edit mode, include existing attachments that weren't removed
  const existingAttachments = isEdit && bug?.attachments
    ? bug.attachments.filter(att => {
        const filePath = att?.url || att?.filepath || '';
        return !removedAttachments.includes(filePath);
      })
    : [];

  // Combine existing (not removed) + newly uploaded attachments
  const finalAttachments = [...existingAttachments, ...uploadedAttachments];

  const { status, priority, category, ...formDataWithoutIds } = formData;
  const payload = {
    ...formDataWithoutIds,
    id: bugIdForSubmit,
    assigneeId: Number(formData.assigneeId) || '',
    reporterId: isEdit ? (bug?.reporterId || currentUser?.id) : currentUser?.id,
    userId: currentUser?.id,
    statusId: formData.status || '',
    priorityId: formData.priority || '',
    categoryId: formData.category ,
    environment: JSON.stringify(formData.environment),
    attachments: finalAttachments,
  };

  try {
    let response;
    if (isEdit) {
      response = await updateBugApi(payload);
      toast.success('Bug updated successfully');
    } else {
      response = await saveBugApi(payload);
      toast.success('Bug created successfully');
    }

    if (!saveAndNew) {
      onClose();
    }

    if (onSuccess) onSuccess(isEdit ? undefined : { ...response, formData: payload }, saveAndNew);
  } catch (error) {
    console.error('Failed to save bug:', error);
    toast.error(isEdit ? 'Failed to update bug' : 'Failed to create bug');
  }
};

export const initializeFormData = (bug, taskNo, taskName, taskId, isEdit, INITIAL_FORM_DATA) => {
  if (bug) {
    return {
      title: bug.title || '',
      description: bug.description || '',
      assigneeId: bug.assigneeId && !isNaN(bug.assigneeId) ? String(bug.assigneeId) : '',
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
    return bug.attachments.map(att => {
      const filePath = att.url || att.filepath || '';
      return {
        ...att,
        name: att.name || getFileNameFromUrl(filePath),
        url: filePath,
        type: att.type || getMimeTypeFromUrl(filePath),
        file: att.file,
        isExisting: !att.file
      };
    });
  }
  return [];
};
