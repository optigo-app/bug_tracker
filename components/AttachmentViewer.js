'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    Box,
    IconButton,
    Typography,
    Stack,
    Button,
    Fade,
    Paper,
    Tooltip
} from '@mui/material';

import {
    X,
    Maximize2,
    Minimize2,
    ChevronLeft,
    ChevronRight,
    Download,
    File,
    ZoomIn,
    ZoomOut,
    RotateCw
} from 'lucide-react';

import { handleImageError } from '@/utils/glocalfunc';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Mousewheel } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function AttachmentViewer({
    open,
    onClose,
    attachments = [],
    initialIndex = 0
}) {
    const [fullMode, setFullMode] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    // Map API attachment format to expected structure
    const mappedAttachments = attachments.map(f => ({
        ...f,
        name: f.name || f.fileName,
        url: f.url || f.filePath,
        type: f.type || f.mimeType
    }));

    if (!mappedAttachments.length) return null;

    const currentFile = mappedAttachments[currentIndex];
    const isImage = (currentFile?.type || currentFile?.mimeType || '').toLowerCase().startsWith('image');

    useEffect(() => {
        const handleKeyDown = (e) => {

            if (!isImage) return;

            if (e.ctrlKey || e.metaKey) {

                if (["+", "=", "NumpadAdd"].includes(e.key)) {
                    e.preventDefault();
                    e.stopPropagation();
                    setZoom(prev => Math.min(prev + 0.25, 3));
                }

                if (["-", "NumpadSubtract"].includes(e.key)) {
                    e.preventDefault();
                    e.stopPropagation();
                    setZoom(prev => Math.max(prev - 0.25, 0.5));
                }

                if (["0", "Numpad0"].includes(e.key)) {
                    e.preventDefault();
                    e.stopPropagation();
                    setZoom(1);
                    setRotation(0);
                }

            }
        };
        if (open) {
            window.addEventListener("keydown", handleKeyDown, { passive: false });
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

    }, [open, isImage]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullMode}
            maxWidth={fullMode ? false : 'lg'}
            fullWidth
            TransitionProps={{
                timeout: {
                    enter: 400,
                    exit: 300
                }
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.3s ease-in-out'
                }
            }}
            PaperProps={{
                elevation: 24,
                sx: {
                    bgcolor: '#FFFFFF',
                    borderRadius: fullMode ? 0 : 3,
                    overflow: 'hidden',
                    backgroundImage: 'none',
                    boxShadow: fullMode ? 'none' : '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    height: fullMode ? '100vh' : '90vh',
                    border: fullMode ? 'none' : '1px solid #E2E8F0'
                }
            }}
        >

            {/* Header - WhatsApp Style */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(248, 250, 252, 0.95)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
            >

                <Stack direction="row" spacing={1.5} alignItems="center">

                    <Typography
                        sx={{
                            color: '#0F172A',
                            fontWeight: 700,
                            fontSize: '1rem',
                            letterSpacing: '-0.01em'
                        }}
                    >
                        Viewing Files
                    </Typography>

                    <Box
                        sx={{
                            px: 1.25,
                            py: 0.5,
                            bgcolor: '#E2E8F0',
                            borderRadius: 1.5,
                            transition: 'all 0.2s'
                        }}
                    >
                        <Typography
                            sx={{
                                color: '#475569',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                letterSpacing: '0.02em'
                            }}
                        >
                            {currentIndex + 1} / {mappedAttachments.length}
                        </Typography>
                    </Box>

                </Stack>

                <Stack direction="row" spacing={1}>

                    {isImage && (
                        <>
                            <Tooltip title="Zoom Out">
                                <IconButton
                                    size="small"
                                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                                    sx={{
                                        color: '#64748B',
                                        bgcolor: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: '#F8FAFC',
                                            borderColor: '#CBD5E1',
                                            color: '#0F172A'
                                        }
                                    }}
                                >
                                    <ZoomOut size={18} />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Zoom In">
                                <IconButton
                                    size="small"
                                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                                    sx={{
                                        color: '#64748B',
                                        bgcolor: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: '#F8FAFC',
                                            borderColor: '#CBD5E1',
                                            color: '#0F172A'
                                        }
                                    }}
                                >
                                    <ZoomIn size={18} />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Rotate">
                                <IconButton
                                    size="small"
                                    onClick={() => setRotation((rotation + 90) % 360)}
                                    sx={{
                                        color: '#64748B',
                                        bgcolor: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: '#F8FAFC',
                                            borderColor: '#CBD5E1',
                                            color: '#0F172A'
                                        }
                                    }}
                                >
                                    <RotateCw size={18} />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Download">
                                <IconButton
                                    size="small"
                                    component="a"
                                    href={currentFile.url}
                                    download={currentFile.name}
                                    sx={{
                                        color: '#64748B',
                                        bgcolor: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: '#F8FAFC',
                                            borderColor: '#CBD5E1',
                                            color: '#0F172A'
                                        }
                                    }}
                                >
                                    <Download size={18} />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}

                    <Tooltip title={fullMode ? "Minimize" : "Full Screen"}>
                        <IconButton
                            size="small"
                            onClick={() => setFullMode(!fullMode)}
                            sx={{
                                color: '#64748B',
                                bgcolor: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: '#F8FAFC',
                                    borderColor: '#CBD5E1',
                                    color: '#0F172A'
                                }
                            }}
                        >
                            {fullMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Close">
                        <IconButton
                            size="small"
                            onClick={onClose}
                            sx={{
                                color: '#64748B',
                                bgcolor: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: '#FEF2F2',
                                    borderColor: '#FECACA',
                                    color: '#EF4444',
                                    transform: 'rotate(90deg)'
                                }
                            }}
                        >
                            <X size={18} />
                        </IconButton>
                    </Tooltip>

                </Stack>
            </Box>


            {/* Viewer Area */}
            <Box
                sx={{
                    position: 'relative',
                    height: fullMode ? "calc(100vh - 68px)" : "calc(90vh - 68px)",
                    mt: "68px",
                    bgcolor: '#F8FAFC'
                }}
            >

                <Swiper
                    initialSlide={initialIndex}
                    modules={[Navigation, Pagination, Keyboard, Mousewheel]}
                    navigation={{
                        prevEl: '.viewer-prev',
                        nextEl: '.viewer-next'
                    }}
                    pagination={{ clickable: true }}
                    keyboard={{ enabled: true }}
                    mousewheel
                    onSlideChange={(swiper) => {
                        setCurrentIndex(swiper.activeIndex);
                        setZoom(1);
                        setRotation(0);
                    }}
                    style={{ width: '100%', height: '100%' }}
                    className="attachment-swiper-light"
                >

                    {mappedAttachments.map((file, idx) => (

                        <SwiperSlide
                            key={file.id || idx}
                        >

                            <Box
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    p: (file.type || file.mimeType || '').toLowerCase().startsWith('image') ? 0 : { xs: 2 }
                                }}
                            >

                                {(file.type || file.mimeType || '').toLowerCase().startsWith('image') ? (

                                    <Fade in timeout={500}>

                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                display: "flex",
                                                alignItems: zoom > 1 ? "flex-start" : "center",
                                                justifyContent: zoom > 1 ? "flex-start" : "center",
                                                overflow: zoom > 1 ? 'auto' : 'hidden',
                                                p: zoom > 1 ? 4 : 0,
                                                '&::-webkit-scrollbar': {
                                                    width: '8px',
                                                    height: '8px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                    background: 'transparent',
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    background: 'rgba(0,0,0,0.1)',
                                                    borderRadius: '10px',
                                                },
                                                '&::-webkit-scrollbar-thumb:hover': {
                                                    background: 'rgba(0,0,0,0.2)',
                                                }
                                            }}
                                        >

                                            <Box
                                                component="img"
                                                src={file.url}
                                                alt={file.name}
                                                onError={handleImageError}
                                                sx={{
                                                    maxWidth: zoom > 1 ? "none" : "100%",
                                                    maxHeight: zoom > 1 ? "none" : "100%",
                                                    objectFit: "contain",
                                                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                                    transformOrigin: 'center center',
                                                    transition: 'transform 0.2s ease',
                                                    cursor: zoom > 1 ? "zoom-out" : "zoom-in",
                                                    margin: zoom > 1 ? 'auto' : '0'
                                                }}
                                                onClick={() => {
                                                    if (zoom > 1) setZoom(1);
                                                    else setZoom(2);
                                                }}
                                            />

                                        </Box>

                                    </Fade>

                                ) : (

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 6,
                                            borderRadius: 4,
                                            bgcolor: "#fff",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: 3,
                                            border: "1px solid #EEF2F7",
                                            maxWidth: 400,
                                            width: "100%"
                                        }}
                                    >

                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 3,
                                                bgcolor: "#EEF2FF",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            <File size={40} color="#6366F1" />
                                        </Box>

                                        <Box textAlign="center">

                                            <Typography
                                                variant="h6"
                                                sx={{ fontWeight: 800 }}
                                            >
                                                {file.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{ color: "#64748B" }}
                                            >
                                                {file.size}
                                            </Typography>

                                        </Box>

                                        <Button
                                            variant="contained"
                                            startIcon={<Download size={18} />}
                                            href={file.url}
                                            download
                                            fullWidth
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 700,
                                                textTransform: "none"
                                            }}
                                        >
                                            Download Attachment
                                        </Button>

                                    </Paper>
                                )}

                            </Box>

                        </SwiperSlide>
                    ))}


                    {/* Navigation Buttons */}
                    {mappedAttachments.length > 1 && (
                        <>
                            <IconButton
                                className="viewer-prev"
                                sx={{
                                    position: "absolute",
                                    left: 20,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    zIndex: 20,
                                    bgcolor: "white"
                                }}
                            >
                                <ChevronLeft size={28} />
                            </IconButton>

                            <IconButton
                                className="viewer-next"
                                sx={{
                                    position: "absolute",
                                    right: 20,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    zIndex: 20,
                                    bgcolor: "white"
                                }}
                            >
                                <ChevronRight size={28} />
                            </IconButton>
                        </>
                    )}

                </Swiper>
            </Box>


            <style jsx global>{`

            .attachment-swiper-light .swiper-pagination-bullet {
                background:#CBD5E1;
                opacity:1;
            }

            .attachment-swiper-light .swiper-pagination-bullet-active {
                background:#6366F1;
                width:24px;
                border-radius:4px;
            }

            .attachment-swiper-light .swiper-pagination {
                bottom:20px !important;
            }

            `}</style>

        </Dialog>
    );
}