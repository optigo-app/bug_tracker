'use client';

import { Dialog, DialogContent, Button, Box } from '@mui/material';
import DrawEditor from './draw/DrawEditor';
import { Download } from 'lucide-react';

export default function ImageDrawEditor({ open, onClose, imageSrc, onSave, onSaveAndNew }) {
  const handleEditorSave = (file) => {
    if (file) {
      // Convert SVG to PNG for ImageDrawEditor
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 800;
          canvas.height = img.naturalHeight || img.height || 600;

          const context = canvas.getContext('2d');
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((pngBlob) => {
            if (!pngBlob) {
              console.error('Failed to build PNG.');
              return;
            }
            const pngFile = new File([pngBlob], 'edited-image.png', { type: 'image/png' });
            onSave(pngFile);
            onClose();
          }, 'image/png');
        };
        img.onerror = () => {
          console.error('Failed to load SVG.');
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditorSaveAndNew = (file) => {
    if (file) {
      // Convert SVG to PNG for ImageDrawEditor
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 800;
          canvas.height = img.naturalHeight || img.height || 600;

          const context = canvas.getContext('2d');
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((pngBlob) => {
            if (!pngBlob) {
              console.error('Failed to build PNG.');
              return;
            }
            const pngFile = new File([pngBlob], 'new-edited-image.png', { type: 'image/png' });
            onSaveAndNew(pngFile);
            onClose();
          }, 'image/png');
        };
        img.onerror = () => {
          console.error('Failed to load SVG.');
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '100%',
          height: '100vh',
          maxHeight: '100vh',
          bgcolor: '#f1f3f5',
          overflow: 'hidden',
          margin: 0
        }
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, width: '100%', overflow: 'hidden' }}>
          <DrawEditor
            onSave={handleEditorSave}
            onSaveAndNew={onSaveAndNew ? handleEditorSaveAndNew : null}
            onClose={onClose}
            initialImageSrc={imageSrc}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
