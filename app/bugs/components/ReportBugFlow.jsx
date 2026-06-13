'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
import DrawEditor from '@/components/draw/DrawEditor';
import BugModal from '@/components/BugModal';

export default function ReportBugFlow({
  canReportBug,
  drawEditorOpen,
  setDrawEditorOpen,
  modalOpen,
  setModalOpen,
  editedImage,
  setEditedImage,
  onSuccess,
  taskNo = '',
  taskName = '',
  taskId = '',
  assigneeids = '',
  dueDate = ''
}) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userProfile = localStorage.getItem('UserProfileData');
        if (userProfile) {
          const parsed = JSON.parse(userProfile);
          const name = `${parsed.firstname || ''} ${parsed.lastname || ''}`.trim();
          setUsername(name);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }
  }, []);

  return (
    <>
      <Dialog
        open={drawEditorOpen}
        onClose={() => setDrawEditorOpen(false)}
        fullScreen
        PaperProps={{ sx: { bgcolor: 'transparent' } }}
      >
        <DrawEditor
          onClose={() => setDrawEditorOpen(false)}
          taskNo={taskNo}
          username={username}
          onSave={(file) => {
            if (file) {
              setEditedImage(file);
            }
            setDrawEditorOpen(false);
            if (canReportBug) {
              setModalOpen(true);
            }
          }}
        />
      </Dialog>

      <BugModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditedImage(null);
        }}
        onSuccess={(newBug, shouldSaveAndNew) => {
          if (shouldSaveAndNew) {
            setModalOpen(false);
            setEditedImage(null);
            setDrawEditorOpen(true);
          }
          onSuccess?.(newBug, shouldSaveAndNew);
        }}
        bug={null}
        taskNo={taskNo}
        taskName={taskName}
        taskId={taskId}
        assigneeids={assigneeids}
        dueDate={dueDate}
        initialAttachment={editedImage}
      />
    </>
  );
}
