'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, Paper, Skeleton } from '@mui/material';
import { ChevronLeft, ChevronRight, Download, File, ExternalLink, MessageSquare, Play } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectFade } from 'swiper/modules';
import Stack from '@mui/material/Stack';
import { handleImageError } from '@/utils/glocalfunc';
import { getFileNameFromUrl, getMimeTypeFromUrl } from '@/utils/fileUtils';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const AttachmentSlider = ({ attachments = [], onImageClick }) => {
  const [loadedImages, setLoadedImages] = useState({});

  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  // Map API attachment format to expected structure
  const mappedAttachments = attachments.map(f => {
    const filePath = f.url || f.filepath || '';
    const inferredType = getMimeTypeFromUrl(filePath);
    const apiType = (f.type || '').toLowerCase();
    const type = apiType && apiType !== 'application/octet-stream' ? f.type : inferredType;
    return {
      ...f,
      name: f.name || getFileNameFromUrl(filePath),
      url: filePath,
      type
    };
  });

  if (!mappedAttachments || mappedAttachments.length === 0) return null;

  const isImage = (type) => (type || '').toLowerCase().startsWith('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes((type || '').toLowerCase());
  const isVideo = (type) => (type || '').toLowerCase().startsWith('video') || ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'].includes((type || '').toLowerCase());

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Swiper
        modules={[EffectFade, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        navigation={{
          nextEl: '.swiper-next',
          prevEl: '.swiper-prev',
        }}
        style={{
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: 'transparent',
          height: '400px',
        }}
      >
        {mappedAttachments.map((file, index) => (
          <SwiperSlide key={`${file.id || index}-${file.url}`}>
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
                <>
                  {!loadedImages[index] && (
                    <Skeleton
                      variant="rectangular"
                      sx={{
                        width: '100%',
                        maxHeight: '600px',
                        height: '300px',
                        borderRadius: '8px',
                        bgcolor: '#EAECEF'
                      }}
                    />
                  )}
                  <Box
                    component="img"
                    src={file.url}
                    alt={file.name}
                    crossOrigin="anonymous"
                    onError={handleImageError}
                    onLoad={() => handleImageLoad(index)}
                    sx={{
                      width: '100%',
                      maxHeight: '600px',
                      objectFit: 'contain',
                      height: 'auto',
                      display: loadedImages[index] ? 'block' : 'none',
                      borderRadius: '8px',
                      border: '1px solid #EAECEF',
                    }}
                  />
                </>
              ) : isVideo(file.type) ? (
                <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box
                    component="video"
                    src={file.url}
                    controls
                    preload="metadata"
                    crossOrigin="anonymous"
                    sx={{
                      width: '100%',
                      maxHeight: '600px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #EAECEF',
                      bgcolor: '#000',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                  >
                    <Play size={24} color="#fff" fill="#fff" />
                  </Box>
                </Box>
              ) : (
                <Stack alignItems="center" spacing={2}>
                  <Box sx={{ 
                    p: 4, 
                    bgcolor: 'white', 
                    borderRadius: '32px', 
                    boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                    border: '1px solid #EAECEF'
                  }}>
                    <File size={64} color="#6366F1" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#444050', letterSpacing: '-0.01em' }}>
                    {file.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-2nd-color)', fontWeight: 600 }}>
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
                color: '#444050',
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
                color: '#444050',
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
