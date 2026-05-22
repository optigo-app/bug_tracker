'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  Stack,
  Drawer,
  Tooltip,
  Chip
} from '@mui/material';
import { X, Upload, File as FileIcon, Edit2 } from 'lucide-react';
import { handleImageError } from '@/utils/glocalfunc';
import { INITIAL_FORM_DATA, CATEGORY_OPTIONS, getCategoryOptions, getPriorityOptions, getStatusOptions } from './bugModal/constants';
import { useUserSession, useAssignees } from './bugModal/useUserSession';
import { useAttachmentHandlers } from './bugModal/useAttachmentHandlers';
import { handleSubmit, initializeFormData, initializeAttachments } from './bugModal/useFormHandlers';
import DepartmentAssigneeAutocomplete from './Common/DepartmentAssigneeAutocomplete.jsx';
import CustomAutocomplete from './Common/CustomAutocomplete.jsx';
import CustomDatePicker from './Common/CustomDatePicker.jsx';
import ImageDrawEditor from './ImageDrawEditor.jsx';

export default function BugModal({ open, onClose, bug = null, onSuccess, taskNo = '', taskName = '', taskId = '', initialAttachment = null, assigneeids = '', dueDate = '' }) {
  const isEdit = !!bug;
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [categoryOptions, setCategoryOptions] = useState(CATEGORY_OPTIONS);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [editingImage, setEditingImage] = useState(null);
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  const [drawEditorOpen, setDrawEditorOpen] = useState(false);
  const environments = ["local", "alpha", "beta", "live"];

  const currentUser = useUserSession();
  const assignees = useAssignees(open);
  const [errors, setErrors] = useState({});

  // Filter assignees based on assigneeids from URL and ensure only developers are selected
  const filteredAssignees = (() => {
    if (isEdit) return assignees; // Don't filter if editing
    let result = assignees;
    
    // First, filter by assigneeids from URL
    if (assigneeids) {
      const assigneeIdArray = assigneeids.split(',').map(id => id.trim()).filter(id => id);
      if (assigneeIdArray.length > 0) {
        result = result.filter(a => assigneeIdArray.includes(String(a?.id)) || assigneeIdArray.includes(String(a?.userid)));
      }
    }
    
    // Then, filter to only show developers
    const developers = result.filter(a => (a?.designation || '').toLowerCase().includes('developer'));
    
    return developers.length > 0 ? developers : result;
  })();

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const getNormalizedDueDate = (value) => {
    if (!value) return getTodayDate();
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? getTodayDate() : parsedDate.toISOString().split('T')[0];
  };

  const getDefaultOptionId = (storageKey, preferredLabel) => {
    if (typeof window === 'undefined') return '';
    try {
      const parsed = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(parsed) || parsed.length === 0) return '';
      const preferred = parsed.find((item) =>
        String(item?.labelname || item?.label || item?.name || '').trim().toLowerCase() === preferredLabel
      );
      return preferred?.id || parsed[0]?.id || '';
    } catch (error) {
      console.error(`Error loading default option from ${storageKey}:`, error);
      return '';
    }
  };

  const getDefaultStatus = () => getDefaultOptionId('taskbugstatusData', 'new');
  const getDefaultPriority = () => getDefaultOptionId('taskbugpriorityData', 'high');

  const hasAutoSelected = React.useRef(false);

  useEffect(() => {
    if (!open) {
      hasAutoSelected.current = false;
    }
  }, [open]);

  // Auto-select the top assignee if not editing
  useEffect(() => {
    if (open && !isEdit && assigneeids && filteredAssignees.length > 0 && !formData.assigneeId && !hasAutoSelected.current) {
      const topAssignee = filteredAssignees[0];
      setFormData(prev => ({ ...prev, assigneeId: topAssignee?.id || '' }));
      hasAutoSelected.current = true;
    }
  }, [open, assigneeids, filteredAssignees, isEdit, formData.assigneeId]);

  const handleDrawEditorSave = (editedFile) => {
    if (editingImageIndex !== null) {
      setAttachments(prev => prev.map((att, index) => {
        if (index === editingImageIndex) {
          return {
            ...att,
            file: editedFile,
            type: editedFile?.type || att?.type,
            mimeType: editedFile?.type || att?.mimeType,
            previewUrl: editedFile ? URL.createObjectURL(editedFile) : att?.previewUrl,
            url: '',
            filePath: '',
            isEdited: true,
          };
        }
        return att;
      }));
      setEditingImageIndex(null);
      setEditingImage(null);
    }
  };

  const handleDrawEditorSaveAndNew = (editedFile) => {
    if (editedFile) {
      setAttachments(prev => [...prev, {
        file: editedFile,
        name: editedFile.name || 'bug-screenshot.png',
        type: editedFile.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(editedFile),
        isEdited: true,
      }]);
    }
  };

  // Load priority and status options from session storage and initialize form
  useEffect(() => {
    setCategoryOptions(getCategoryOptions());
    setPriorityOptions(getPriorityOptions());
    setStatusOptions(getStatusOptions());
  }, []);

  // Initialize form data when bug changes or modal opens
  useEffect(() => {
    if (open) {
      if (bug) {
        setFormData(initializeFormData(bug, taskNo, taskName, taskId, isEdit, INITIAL_FORM_DATA));
        setAttachments(initializeAttachments(bug));
      } else {
        const defaultStatus = getDefaultStatus();
        const defaultPriority = getDefaultPriority();
        setFormData({
          ...INITIAL_FORM_DATA,
          taskNo,
          taskName,
          taskId,
          status: defaultStatus,
          priority: defaultPriority,
          dueDate: getNormalizedDueDate(dueDate)
        });
        if (initialAttachment) {
          setAttachments([{
            file: initialAttachment,
            name: initialAttachment.name,
            type: initialAttachment.type.startsWith('image/') ? 'image' : 'file',
            url: URL.createObjectURL(initialAttachment)
          }]);
        } else {
          setAttachments([]);
        }
      }
    }
  }, [bug, open, taskNo, taskName, taskId, dueDate, isEdit, initialAttachment]);

  useEffect(() => {
    if (!open || isEdit) return;
    setFormData((prev) => ({
      ...prev,
      category: prev.category || '',
      priority: prev.priority || priorityOptions.find((option) => String(option?.label || '').toLowerCase() === 'high')?.value || priorityOptions[0]?.value || '',
      status: prev.status || statusOptions.find((option) => String(option?.label || '').toLowerCase() === 'new')?.value || statusOptions[0]?.value || '',
      dueDate: prev.dueDate || getNormalizedDueDate(dueDate),
    }));
  }, [open, isEdit, categoryOptions, priorityOptions, statusOptions, dueDate]);

  const {
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
  } = useAttachmentHandlers(attachments, setAttachments);

  const imageAttachments = useMemo(
    () => attachments.filter(att => (att?.type || att?.mimeType || '').toLowerCase().startsWith('image')),
    [attachments]
  );

  const nonImageAttachments = useMemo(
    () => attachments.filter(att => !(att?.type || att?.mimeType || '').toLowerCase().startsWith('image')),
    [attachments]
  );

  useEffect(() => {
    const handlePaste = (e) => {
      if (open) {
        const files = Array.from(e.clipboardData.files);
        if (files.length > 0) {
          addFiles(files);
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [open]);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!attachments?.length) newErrors.attachments = 'At least one attachment is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (attachments?.length > 0 && errors.attachments) {
      setErrors((prev) => ({ ...prev, attachments: null }));
    }
  }, [attachments, errors.attachments]);

  const handleFormSubmit = (e, saveAndNew = false) => {
    e.preventDefault();
    if (validateForm()) {
      handleSubmit(e, formData, attachments, currentUser, isEdit, bug, onClose, (newBug, shouldSaveAndNew) => {
        if (shouldSaveAndNew) {
          const defaultStatus = getDefaultStatus();
          const defaultPriority = getDefaultPriority();
          setFormData({
            ...INITIAL_FORM_DATA,
            taskNo,
            taskName,
            taskId,
            status: defaultStatus,
            priority: defaultPriority,
            dueDate: getNormalizedDueDate(dueDate)
          });
          setAttachments([]);
          setErrors({});
        }
        if (onSuccess) onSuccess(newBug, shouldSaveAndNew);
      }, saveAndNew);
    }
  };

  const renderAutocomplete = (label, name, value, placeholder, options, onChange, error = false, helperText = '', disabled = false) => (
    <CustomAutocomplete
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      helperText={helperText}
    />
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={{ enter: 400, exit: 300 }}
      SlideProps={{
        easing: {
          enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
          exit: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }}
      ModalProps={{
        keepMounted: false,
        BackdropProps: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s ease-in-out'
          }
        }
      }}
      PaperProps={{
        elevation: 24,
        sx: {
          width: { xs: '100%', sm: 480, md: 620 },
          maxWidth: '100vw',
          p: 0,
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
          borderLeft: { xs: 'none', sm: '1px solid #E2E8F0' },
          boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }}
    >
      <Box component="form" onSubmit={handleFormSubmit} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header - WhatsApp Style */}
        <Box sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h6" sx={{
                fontWeight: 700,
                fontSize: '1.05rem',
                letterSpacing: '-0.01em'
              }}>
                {isEdit ? 'Edit Bug' : 'Create New Bug'}
              </Typography>
              {isEdit && bug?.bugNo && (
                <Chip
                  label={bug.bugNo}
                  sx={{
                    fontWeight: 850,
                    fontSize: '0.85rem',
                    color: '#7367f0',
                    bgcolor: '#EEF2FF',
                    border: '1px solid #C7D2FE',
                    borderRadius: 1.5,
                    height: 28
                  }}
                />
              )}
              {formData.taskNo && (
                <Tooltip title={formData.taskName || ''} arrow>
                  <Chip
                    label={formData.taskNo}
                    sx={{
                      fontWeight: 850,
                      fontSize: '0.85rem',
                      color: '#64748B',
                      bgcolor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: 1.5,
                      height: 28,
                      cursor: 'help',
                      '&:hover': {
                        bgcolor: '#E5E7EB',
                        borderColor: '#CBD5E1'
                      }
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              p: 0.5,
              bgcolor: 'transparent',
              color: '#64748B',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#F1F5F9',
                transform: 'rotate(90deg)'
              },
              opacity: 0.7,
              '&:hover': { opacity: 1 }
            }}
          >
            <X size={22} color="#334155" />
          </IconButton>
        </Box>

        <Box sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
          bgcolor: '#FFFFFF',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#CBD5E1',
            borderRadius: '10px',
            '&:hover': {
              bgcolor: '#94A3B8'
            }
          }
        }}>
          <Grid container spacing={2.5}>
            {/* Title */}
            <Grid size={{ xs: 12 }} sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 1, display: 'block' }}>
                TITLE <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                className="textfieldsClass"
                placeholder="e.g. Login page keeps crashing on mobile Safari"
                variant="outlined"
                size="small"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                  if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                }}
                error={!!errors.title}
                helperText={errors.title}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '42px',
                    '& fieldset': { borderWidth: '1px' },
                    '&:hover fieldset': { borderColor: '#6366f1' }
                  },
                  '& .MuiInputBase-input': { fontWeight: 600 }
                }}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }} sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 1, display: 'block' }}>
                DESCRIPTION
              </Typography>
              <TextField
                fullWidth
                className="textareaCustCss textfieldsClass"
                multiline
                rows={2}
                placeholder="Describe the issue in detail..."
                variant="outlined"
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  if (errors.description) setErrors(prev => ({ ...prev, description: null }));
                }}
                error={!!errors.description}
                helperText={errors.description}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#6366f1' }
                  },
                  '& .MuiInputBase-input': { fontWeight: 600 }
                }}
              />
            </Grid>

            {/* Assignee & Category */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>ASSIGNEE</Typography>
              {(() => {
                const selectedAssignee = filteredAssignees.find((a) => {
                  const currentAssigneeId = String(formData.assigneeId || '');
                  return String(a?.id || '') === currentAssigneeId || String(a?.userid || '') === currentAssigneeId;
                }) || null;

                return (
                  <DepartmentAssigneeAutocomplete
                    options={filteredAssignees}
                    label=""
                    placeholder="Search and select assignee..."
                    multiple={false}
                    value={selectedAssignee}
                    onChange={(newValue) => {
                      setFormData(prev => ({ ...prev, assigneeId: newValue?.id || '' }));
                    }}
                    minWidth="100%"
                  />
                );
              })()}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              {renderAutocomplete(
                'CATEGORY',
                'category',
                formData.category,
                'Select Category',
                categoryOptions,
                (name, value) => setFormData(prev => ({ ...prev, category: value }))
              )}
            </Grid>

            {/* Environment */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}
              >
                ENVIRONMENT
              </Typography>

              <Stack direction="row" spacing={1}>
                {environments.map((env) => {
                  const isActive = formData.environment[env];

                  return (
                    <Chip
                      key={env}
                      label={`${env.charAt(0).toUpperCase() + env.slice(1)} Version`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          environment: {
                            ...prev.environment,
                            [env]: !prev.environment[env]
                          }
                        }))
                      }
                      sx={{
                        bgcolor: isActive ? '#7367f0' : '#F1F5F9',
                        color: isActive ? '#fff' : '#475569',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        borderRadius: 1.5,
                        px: 1,
                        py: 0.75,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: isActive ? '#6366f1' : '#E2E8F0'
                        }
                      }}
                    />
                  );
                })}
              </Stack>
            </Grid>

            {/* Priority & Status */}
            <Grid size={{ xs: 12, sm: 6 }}>
              {renderAutocomplete(
                'PRIORITY',
                'priority',
                formData.priority,
                'Select Priority',
                priorityOptions,
                (name, value) => setFormData(prev => ({ ...prev, priority: value })),
                false,
                ''
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              {renderAutocomplete(
                'STATUS',
                'status',
                formData.status,
                'Select Status',
                statusOptions,
                (name, value) => setFormData(prev => ({ ...prev, status: value }))
              )}
            </Grid>

            {/* Due Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomDatePicker
                label="DUE DATE"
                value={formData.dueDate}
                onChange={(value) => setFormData(prev => ({ ...prev, dueDate: value }))}
                width="100%"
                textFieldProps={{
                  className: "textfieldsClass",
                  size: "small"
                }}
                sx={{
                  '& .MuiOutlinedInput-root': { height: '42px' },
                  '& .MuiInputBase-input': { fontWeight: 600 }
                }}
              />
            </Grid>

            {/* Attachments */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 1, display: 'block' }}>ATTACHMENTS <span style={{ color: '#EF4444' }}>*</span></Typography>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleChange}
                style={{ display: 'none' }}
              />

              {/* Image Previews Grid */}
              {imageAttachments.length > 0 && (
                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  {imageAttachments.map((att, index) => {
                    const originalIndex = attachments.indexOf(att);
                    return (
                      <Grid key={originalIndex} size={{ xs: 4, sm: 3, md: 2 }}>
                        <Box
                          sx={{
                            position: 'relative',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            aspectRatio: '1',
                            bgcolor: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#6366F1',
                              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          <Box
                            component="img"
                            src={att.previewUrl || att.url || att.filePath || ''}
                            onError={handleImageError}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 4, right: 4 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); setEditingImage(att); setEditingImageIndex(originalIndex); setDrawEditorOpen(true); }}
                              sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                color: '#64748B',
                                width: 24,
                                height: 24,
                                '&:hover': { bgcolor: '#EEF2FF', color: '#7367f0' },
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                              }}
                            >
                              <Edit2 size={12} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); setAttachments(prev => prev.filter((_, i) => i !== originalIndex)); }}
                              sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                color: '#64748B',
                                width: 24,
                                height: 24,
                                '&:hover': { bgcolor: '#FEF2F2', color: '#EF4444' },
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                              }}
                            >
                              <X size={14} />
                            </IconButton>
                          </Stack>
                          {att.isEdited && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 4,
                                left: 4,
                                px: 0.5,
                                py: 0.25,
                                bgcolor: '#7367f0',
                                borderRadius: 0.5,
                                fontSize: '0.55rem',
                                fontWeight: 700,
                                color: '#fff',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                              }}
                            >
                              Edited
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}

              {/* Non-image attachments */}
              {nonImageAttachments.length > 0 && (
                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  {nonImageAttachments.map((att, index) => {
                    const originalIndex = attachments.indexOf(att);
                    return (
                      <Grid key={originalIndex} size={{ xs: 12 }}>
                        <Box
                          sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            bgcolor: '#FFFFFF',
                            border: '1px solid #F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              border: '1px solid #E2E8F0',
                              bgcolor: '#F8FAFC',
                              boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                            }
                          }}
                        >
                          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #E0E7FF' }}>
                            <FileIcon size={18} color="#6366F1" />
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography noWrap sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>{att.name}</Typography>
                              {att.isEdited && (
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#6366F1', bgcolor: '#EEF2FF', px: 0.6, py: 0.05, borderRadius: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Edited
                                </Typography>
                              )}
                            </Stack>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748B' }}>
                              {typeof att.size === 'string' ? att.size : `${(+att.size / 1024 / 1024).toFixed(2)} MB`}
                            </Typography>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== originalIndex))}
                            sx={{
                              color: '#94A3B8',
                              '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' }
                            }}
                          >
                            <X size={14} />
                          </IconButton>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}

              {/* Drag & Drop Area */}
              <Box
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                sx={{
                  border: '2px dashed',
                  borderColor: errors.attachments ? '#EF4444' : (dragActive ? '#6366F1' : '#CBD5E1'),
                  borderRadius: 1.5,
                  py: 1.5,
                  px: 2,
                  textAlign: 'center',
                  bgcolor: errors.attachments ? '#FEF2F2' : (dragActive ? 'rgba(99, 102, 241, 0.04)' : '#fafafa'),
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#6366F1',
                    bgcolor: 'rgba(99, 102, 241, 0.04)',
                    boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.04)'
                  }
                }}
              >
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: dragActive ? '#6366F1' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1, border: '1px solid #EEF2F7', transition: 'all 0.2s ease' }}>
                  <Upload size={20} color={dragActive ? '#FFFFFF' : '#64748B'} />
                </Box>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                  Click to upload or drag and drop
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748B', mt: 0.25 }}>
                  PDF, DOC, PNG, JPG (max. 10MB)
                </Typography>
              </Box>
              {!!errors.attachments && (
                <Typography sx={{ mt: 0.75, fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>
                  {errors.attachments}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Footer Actions - WhatsApp Style */}
        <Box sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.5,
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0'
        }}>
          <Button
            className="secondaryBtnClassname"
            onClick={onClose}
          >
            Cancel
          </Button>
          {!isEdit && (
            <Button
              className="buttonClassname"
              type="button"
              variant="contained"
              onClick={(e) => {
                handleFormSubmit(e, true);
              }}
            >
              Save & New
            </Button>
          )}
          <Button
            className="buttonClassname"
            type="submit"
            variant="contained"
          >
            {isEdit ? 'Update Bug' : 'Create Bug'}
          </Button>
        </Box>
      </Box>

      <ImageDrawEditor
        open={drawEditorOpen}
        onClose={() => { setDrawEditorOpen(false); setEditingImage(null); setEditingImageIndex(null); }}
        imageSrc={editingImage?.previewUrl || editingImage?.url || editingImage?.filePath || (editingImage?.file ? URL.createObjectURL(editingImage.file) : '')}
        onSave={handleDrawEditorSave}
        onSaveAndNew={handleDrawEditorSaveAndNew}
      />
    </Drawer>
  );
}
