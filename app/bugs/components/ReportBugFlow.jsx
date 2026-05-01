'use client';

import React from 'react';
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
        onSuccess={onSuccess}
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
