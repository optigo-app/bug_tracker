'use client';

import React from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { ChevronLeft, ChevronRight, Download, File, ExternalLink, MessageSquare } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectFade } from 'swiper/modules';
import Stack from '@mui/material/Stack';
import { handleImageError } from '@/utils/glocalfunc';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const AttachmentSlider = ({ attachments = [], onImageClick }) => {
  // Map API attachment format to expected structure
  const mappedAttachments = attachments.map(f => ({
    ...f,
    name: f.name || f.fileName,
    url: f.url || f.filePath,
    type: f.type || f.mimeType
  }));

  if (!mappedAttachments || mappedAttachments.length === 0) return null;

  const isImage = (type) => (type || '').toLowerCase().startsWith('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes((type || '').toLowerCase());

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Swiper
        modules={[EffectFade, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoHeight={true}
        navigation={{
          nextEl: '.swiper-next',
          prevEl: '.swiper-prev',
        }}
        style={{
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}
      >
        {mappedAttachments.map((file, index) => (
          <SwiperSlide key={file.id || index}>
            <Box 
              onClick={() => onImageClick?.(index)}
              sx={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative',
                p: 0.5,
                cursor: 'pointer'
              }}
            >
              {isImage(file.type) ? (
                <Box
                  component="img"
                  src={file.url}
                  alt={file.name}
                  onError={handleImageError}
                  sx={{
                    width: '100%',
                    maxHeight: '600px',
                    objectFit: 'contain',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '8px',
                    border: '1px solid #F1F5F9', // Subtle integrated border
                  }}
                />
              ) : (
                <Stack alignItems="center" spacing={2}>
                  <Box sx={{ 
                    p: 4, 
                    bgcolor: 'white', 
                    borderRadius: '32px', 
                    boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                    border: '1px solid #F1F5F9'
                  }}>
                    <File size={64} color="#6366F1" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', letterSpacing: '-0.01em' }}>
                    {file.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    {file.size} · {(file.type || '').toUpperCase()}
                  </Typography>
                </Stack>
              )}

              {/* Minimal Slide Indicator */}
              {mappedAttachments.length > 1 && (
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'rgba(203, 213, 225, 0.6)',
                  backdropFilter: 'blur(12px)',
                  color: '#444050',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '20px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em'
                }}>
                  {index + 1} / {mappedAttachments.length}
                </Box>
              )}
            </Box>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Buttons */}
        {mappedAttachments.length > 1 && (
          <>
            <IconButton 
              className="swiper-prev"
              sx={{ 
                position: 'absolute', 
                left: 12, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                zIndex: 10,
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                color: '#1E293B',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                '&.swiper-button-disabled': { opacity: 0.3, cursor: 'default' }
              }}
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </IconButton>
            <IconButton 
              className="swiper-next"
              sx={{ 
                position: 'absolute', 
                right: 12, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                zIndex: 10,
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                color: '#1E293B',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                '&.swiper-button-disabled': { opacity: 0.3, cursor: 'default' }
              }}
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </IconButton>
          </>
        )}
      </Swiper>
    </Box>
  );
};


export default AttachmentSlider;
