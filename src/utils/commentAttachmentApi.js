import { filesUploadApi } from '@/src/utils/taskApi';

const getFileBaseName = (fileName = '') => {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.slice(0, -1).join('.') : fileName;
};

const getFileTypeFromName = (fileName = '') => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext) return '';

    const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    if (imageExt.includes(ext)) return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    return 'application/octet-stream';
};

export const uploadFilesForComment = async ({ bugId, files = [] }) => {
    try {
        if (!bugId || !Array.isArray(files) || files.length === 0) {
            return { success: true, uploaded: [], attachments: [] };
        }

        const uploadedResults = [];
        const folderName = `bug-upload/${bugId}`;

        for (const file of files) {
            const res = await filesUploadApi({
                attachments: [{ file }],
                folderName,
                uniqueNo: getFileBaseName(file?.name) || `${Date.now()}`,
            });

            if (res?.files && Array.isArray(res.files)) {
                uploadedResults.push(...res.files.map((item) => ({ ...item, originalFile: file })));
            }
        }

        const attachments = uploadedResults.map((uploaded, index) => {
            const nameFromUrl = uploaded?.url?.split('/').pop()?.split('?')[0] || '';
            const fileName = uploaded?.originalFile?.name || uploaded?.fileName || uploaded?.name || nameFromUrl || `attachment-${index + 1}`;
            const fileSize = uploaded?.originalFile?.size || uploaded?.size || 0;
            const mimeType = uploaded?.originalFile?.type || uploaded?.fileType || uploaded?.mimeType || getFileTypeFromName(fileName);

            return {
                id: null, // Let SQL generate incremental ID
                bugId,
                commentId: '',
                fileName,
                fileSize,
                mimeType,
                filePath: uploaded?.url || '',
            };
        });

        return {
            success: true,
            uploaded: uploadedResults,
            attachments,
        };
    } catch (error) {
        console.error('uploadFilesForComment error:', error);
        return { success: false, error, uploaded: [], attachments: [] };
    }
};
