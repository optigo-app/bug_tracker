/**
 * Extract filename from a URL path
 * @param {string} url - The file URL
 * @returns {string} - Extracted filename
 */
export const getFileNameFromUrl = (url = '') => {
  if (!url) return 'untitled';
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1] || '';
    const fileName = lastPart.split('?')[0] || lastPart;
    return fileName || 'untitled';
  } catch (e) {
    return 'untitled';
  }
};

/**
 * Infer MIME type from filename or URL
 * @param {string} url - The file URL
 * @returns {string} - Inferred MIME type
 */
export const getMimeTypeFromUrl = (url = '') => {
  const fileName = getFileNameFromUrl(url);
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext) return 'application/octet-stream';

  const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  if (imageExt.includes(ext)) {
    return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  }

  const pdfExt = ['pdf'];
  if (pdfExt.includes(ext)) {
    return 'application/pdf';
  }

  const docExt = ['doc', 'docx'];
  if (docExt.includes(ext)) {
    return 'application/msword';
  }

  const excelExt = ['xls', 'xlsx'];
  if (excelExt.includes(ext)) {
    return 'application/vnd.ms-excel';
  }

  const videoExt = ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'];
  if (videoExt.includes(ext)) {
    return `video/${ext === 'mov' ? 'quicktime' : ext}`;
  }

  return 'application/octet-stream';
};

/**
 * Check if a URL points to an image based on extension
 * @param {string} url - The file URL
 * @returns {boolean} - True if image
 */
export const isImageUrl = (url = '') => {
  const mimeType = getMimeTypeFromUrl(url);
  return mimeType.startsWith('image/');
};
