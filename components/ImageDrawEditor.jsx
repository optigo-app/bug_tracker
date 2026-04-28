'use client';

import { Dialog, DialogContent, Button, Box } from '@mui/material';
import DrawEditor from './draw/DrawEditor';
import { Download } from 'lucide-react';

export default function ImageDrawEditor({ open, onClose, imageSrc, onSave }) {
  const handleEditorSave = (file) => {
    if (file) {
      // Convert SVG to PNG for ImageDrawEditor
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 800;
          canvas.height = img.height || 600;

          const context = canvas.getContext('2d');
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0);

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
        <Box sx={{ 
          height: 48, 
          bgcolor: '#f1f3f5', 
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: '#7367f0', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem'
            }}>
              t
            </Box>
            <Box sx={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
              SketchFlow
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onClose} sx={{ color: '#64748B' }}>
              Cancel
            </Button>
            <Button 
              onClick={() => document.querySelector('.continueButton')?.click()}
              variant="contained" 
              startIcon={<Download size={16} />}
              sx={{ bgcolor: '#7367f0', '&:hover': { bgcolor: '#6366f1' } }}
            >
              Save
            </Button>
          </Box>
        </Box>
        <Box sx={{ flex: 1, width: '100%', overflow: 'hidden' }}>
          <DrawEditor onSave={handleEditorSave} onClose={onClose} initialImageSrc={imageSrc} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
