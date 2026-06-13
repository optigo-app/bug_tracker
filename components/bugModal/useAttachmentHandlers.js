import { useState, useRef } from 'react';
import { removeFileApi } from '@/src/utils/taskApi';

export const useAttachmentHandlers = (attachments, setAttachments) => {
  const [dragActive, setDragActive] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [initialEditImage, setInitialEditImage] = useState('');
  const [removedAttachments, setRemovedAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const handleEditOpen = (index) => {
    const att = attachments[index];
    const filePath = att?.url || att?.filepath || '';
    const mimeType = (att?.type || getMimeTypeFromUrl(filePath) || '').toLowerCase();
    if (att && mimeType?.startsWith('image')) {
      const url = filePath || (att.file ? URL.createObjectURL(att.file) : '');
      setInitialEditImage(url);
      setEditingIndex(index);
      setEditorOpen(true);
    }
  };

  const handleEditSave = async (fileOrUrl) => {
    try {
      let file;
      if (typeof fileOrUrl === 'string') {
        const res = await fetch(fileOrUrl);
        const blob = await res.blob();
        const fileName = attachments[editingIndex]?.name || 'edited_image.png';
        file = new File([blob], fileName, { type: 'image/png' });
      } else {
        file = fileOrUrl;
      }
      const stableUrl = URL.createObjectURL(file);
      setAttachments(prev => prev.map((att, i) =>
        i === editingIndex ? { ...att, file: file, url: stableUrl, type: 'image/png', isEdited: true, size: file.size } : att
      ));
    } catch (err) {
      console.error('Failed to process edited image:', err);
    }
    setEditorOpen(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      addFiles(Array.from(e.target.files));
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveAttachment = (index) => {
    const att = attachments[index];
    const filePath = att?.url || att?.filepath || '';
    
    // Track removed attachments but don't delete from server yet
    // Only delete when user clicks save/update
    if (att?.isExisting && filePath) {
      setRemovedAttachments(prev => [...prev, filePath]);
    }
    
    // Remove from local state
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const addFiles = (files) => {
    const validFiles = [];
    const rejected = [];
    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        rejected.push(file.name);
      } else {
        validFiles.push(file);
      }
    });
    if (rejected.length > 0) {
      alert(`File(s) exceed 100MB limit and were not uploaded:\n${rejected.join('\n')}`);
    }
    if (validFiles.length === 0) return;
    const newAttachments = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.type?.startsWith('image/') ? URL.createObjectURL(file) : ''
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  return {
    dragActive,
    editorOpen,
    editingIndex,
    initialEditImage,
    fileInputRef,
    removedAttachments,
    handleEditOpen,
    handleEditSave,
    handleDrag,
    handleDrop,
    handleChange,
    onButtonClick,
    addFiles,
    handleRemoveAttachment
  };
};
