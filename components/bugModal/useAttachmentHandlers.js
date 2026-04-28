import { useState, useRef } from 'react';

export const useAttachmentHandlers = (attachments, setAttachments) => {
  const [dragActive, setDragActive] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [initialEditImage, setInitialEditImage] = useState('');
  const fileInputRef = useRef(null);

  const handleEditOpen = (index) => {
    const att = attachments[index];
    const mimeType = (att?.type || att?.mimeType || '').toLowerCase();
    if (att && mimeType?.startsWith('image')) {
      const url = att.url || att.filePath || (att.file ? URL.createObjectURL(att.file) : '');
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

  const addFiles = (files) => {
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  return {
    dragActive,
    editorOpen,
    editingIndex,
    initialEditImage,
    fileInputRef,
    handleEditOpen,
    handleEditSave,
    handleDrag,
    handleDrop,
    handleChange,
    onButtonClick,
    addFiles
  };
};
