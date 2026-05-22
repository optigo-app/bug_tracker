'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Dialog,
    Box,
    IconButton,
    Typography,
    Stack,
    Button,
    Fade,
    Paper,
    Tooltip,
    Slide,
    Divider
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
    RotateCw,
    Info,
    MousePointer2,
    Keyboard as KeyboardIcon,
    Play,
    Pause,
    RefreshCcw
} from 'lucide-react';

/**
 * Enhanced AttachmentViewer
 * Features: Panning, Smooth Zoom, Keyboard Shortcuts, Info Panel, Slideshow
 * Note: Swiper dependency removed and replaced with a custom native React slider
 * for better environment compatibility.
 */
export default function AttachmentViewer({
    open,
    onClose,
    attachments = [],
    initialIndex = 0
}) {
    const [fullMode, setFullMode] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [isAutoplay, setIsAutoplay] = useState(false);
    
    // Drag/Pan State
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });
    const viewerRef = useRef(null);

    // Map API attachment format
    const mappedAttachments = useMemo(() => attachments.map(f => ({
        ...f,
        name: f.name || f.fileName || 'Untitled File',
        url: f.url || f.filePath,
        type: f.type || f.mimeType || 'application/octet-stream',
        size: f.size || 'Unknown size',
        uploadedAt: f.uploadedAt || new Date().toLocaleDateString()
    })), [attachments]);

    const currentFile = mappedAttachments[currentIndex];
    const isImage = currentFile?.type?.toLowerCase().startsWith('image');

    // Reset view state
    const resetView = useCallback(() => {
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    }, []);

    // Navigation Handlers
    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % mappedAttachments.length);
        resetView();
    }, [mappedAttachments.length, resetView]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + mappedAttachments.length) % mappedAttachments.length);
        resetView();
    }, [mappedAttachments.length, resetView]);

    // Zoom Handlers
    const handleZoom = (delta) => {
        setZoom(prev => {
            const newZoom = Math.min(Math.max(prev + delta, 0.5), 5);
            if (newZoom === 1) setPosition({ x: 0, y: 0 });
            return newZoom;
        });
    };

    // Pan Handlers
    const handlePointerDown = useCallback((e) => {
        if (zoom <= 1 || !isImage) return;
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }, [zoom, isImage, position.x, position.y]);

    const handlePointerMove = useCallback((e) => {
        if (!isDragging || zoom <= 1) return;
        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        });
    }, [isDragging, zoom]);

    const handlePointerUp = useCallback(() => setIsDragging(false), []);

    // Wheel Zoom
    const handleWheel = (e) => {
        if (isImage) {
            if (e.deltaY < 0) handleZoom(0.25);
            else handleZoom(-0.25);
        }
    };

    // Window-level pointer listeners for panning outside viewer
    useEffect(() => {
        if (!isDragging) return;
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [isDragging, handlePointerMove, handlePointerUp]);

    // Autoplay Timer
    useEffect(() => {
        let interval;
        if (isAutoplay && open) {
            interval = setInterval(goToNext, 3000);
        }
        return () => clearInterval(interval);
    }, [isAutoplay, open, goToNext]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!open) return;
            
            // Zoom: Ctrl + / Ctrl -
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '=' || e.key === '+') { e.preventDefault(); handleZoom(0.5); }
                if (e.key === '-') { e.preventDefault(); handleZoom(-0.5); }
                if (e.key === '0') { e.preventDefault(); resetView(); }
            }

            // Navigation
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrev();

            // Utils
            if (e.key === 'r') setRotation(prev => (prev + 90) % 360);
            if (e.key === 'i') setShowInfo(prev => !prev);
            if (e.key === 'f') setFullMode(prev => !prev);
            if (e.key === ' ') { e.preventDefault(); setIsAutoplay(prev => !prev); }
            if (e.key === 'Escape' && !fullMode) onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, fullMode, isImage, resetView, onClose, goToNext, goToPrev]);

    if (!mappedAttachments.length) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullMode}
            maxWidth="xl"
            fullWidth
            TransitionProps={{ timeout: 400 }}
            PaperProps={{
                sx: {
                    bgcolor: '#f8fafc',
                    borderRadius: fullMode ? 0 : 4,
                    overflow: 'hidden',
                    height: fullMode ? '100vh' : '85vh',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            {/* --- Top Header Bar --- */}
            <Box sx={{ 
                p: 1.5, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                bgcolor: 'white',
                borderBottom: '1px solid #e2e8f0',
                zIndex: 100
            }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
                        <X size={20} />
                    </IconButton>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1 }}>
                            {currentFile.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            {currentIndex + 1} of {mappedAttachments.length}
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    {isImage && (
                        <Stack direction="row" spacing={0.5} sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: 2 }}>
                            <Tooltip title="Zoom Out (Ctrl -)">
                                <IconButton size="small" onClick={() => handleZoom(-0.25)}><ZoomOut size={18} /></IconButton>
                            </Tooltip>
                            <Tooltip title="Reset (Ctrl 0)">
                                <IconButton size="small" onClick={resetView}><RefreshCcw size={16} /></IconButton>
                            </Tooltip>
                            <Tooltip title="Zoom In (Ctrl +)">
                                <IconButton size="small" onClick={() => handleZoom(0.25)}><ZoomIn size={18} /></IconButton>
                            </Tooltip>
                        </Stack>
                    )}

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <Tooltip title={isAutoplay ? "Pause Slideshow" : "Start Slideshow"}>
                        <IconButton size="small" onClick={() => setIsAutoplay(!isAutoplay)} color={isAutoplay ? "primary" : "default"}>
                            {isAutoplay ? <Pause size={18} /> : <Play size={18} />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Rotate (R)">
                        <IconButton size="small" onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw size={18} /></IconButton>
                    </Tooltip>

                    <Tooltip title="File Info (I)">
                        <IconButton size="small" onClick={() => setShowInfo(!showInfo)} color={showInfo ? "primary" : "default"}>
                            <Info size={18} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Toggle Fullscreen (F)">
                        <IconButton size="small" onClick={() => setFullMode(!fullMode)}>
                            {fullMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </IconButton>
                    </Tooltip>

                    <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        startIcon={<Download size={16} />}
                        href={currentFile.url}
                        download={currentFile.name}
                        sx={{ borderRadius: 2, textTransform: 'none', ml: 1 }}
                    >
                        Download
                    </Button>
                </Stack>
            </Box>

            {/* --- Main Viewer Container --- */}
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                
                {/* File Information Sidebar */}
                <Slide direction="right" in={showInfo} mountOnEnter unmountOnExit>
                    <Paper sx={{ 
                        width: 280, 
                        borderRight: '1px solid #e2e8f0', 
                        zIndex: 50, 
                        p: 3, 
                        bgcolor: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3
                    }}>
                        <Box>
                            <Typography variant="overline" color="text.secondary">File Details</Typography>
                            <Stack spacing={1} mt={1}>
                                <DetailItem label="Type" value={currentFile.type.split('/')[1]?.toUpperCase()} />
                                <DetailItem label="Size" value={currentFile.size} />
                                <DetailItem label="Date" value={currentFile.uploadedAt} />
                            </Stack>
                        </Box>
                        
                        <Divider />
                        
                        <Box>
                            <Typography variant="overline" color="text.secondary">Shortcuts</Typography>
                            <Stack spacing={1.5} mt={1}>
                                <ShortcutItem icon={<MousePointer2 size={14}/>} text="Double Click" desc="Zoom Toggle" />
                                <ShortcutItem icon={<KeyboardIcon size={14}/>} text="Space" desc="Play/Pause" />
                                <ShortcutItem icon={<KeyboardIcon size={14}/>} text="Arrows" desc="Next/Prev" />
                                <ShortcutItem icon={<KeyboardIcon size={14}/>} text="R" desc="Rotate" />
                            </Stack>
                        </Box>
                    </Paper>
                </Slide>

                <Box sx={{ 
                    flex: 1, 
                    position: 'relative', 
                    cursor: isDragging ? 'grabbing' : (zoom > 1 ? 'grab' : 'default'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f1f5f9'
                }}>
                    {/* Viewport for content */}
                    <Box 
                        ref={viewerRef}
                        onWheel={handleWheel}
                        onPointerDown={handlePointerDown}
                        sx={{ 
                            width: '100%', 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {isImage ? (
                            <Box
                                component="img"
                                draggable={false}
                                src={currentFile.url}
                                alt={currentFile.name}
                                onDragStart={(e) => e.preventDefault()}
                                onDoubleClick={() => zoom > 1 ? resetView() : setZoom(2.5)}
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    userSelect: 'none',
                                    pointerEvents: 'auto',
                                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)',
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                    filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.1))'
                                }}
                            />
                        ) : (
                            <Paper sx={{ p: 5, textAlign: 'center', maxWidth: 400, borderRadius: 4 }}>
                                <File size={64} color="#6366f1" style={{ marginBottom: 16 }} />
                                <Typography variant="h6" gutterBottom>{currentFile.name}</Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    This file type ({currentFile.type}) cannot be previewed directly.
                                </Typography>
                                <Button variant="outlined" href={currentFile.url} download>Download to View</Button>
                            </Paper>
                        )}
                    </Box>

                    {/* Progress Indicator */}
                    <Box sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        height: 3, 
                        bgcolor: 'rgba(0,0,0,0.05)',
                        zIndex: 10
                    }}>
                        <Box sx={{ 
                            height: '100%', 
                            bgcolor: '#6366f1', 
                            width: `${((currentIndex + 1) / mappedAttachments.length) * 100}%`,
                            transition: 'width 0.3s ease'
                        }} />
                    </Box>

                    {/* Nav Arrows */}
                    <IconButton onClick={goToPrev} sx={navBtnStyle('left')}>
                        <ChevronLeft size={32} />
                    </IconButton>
                    <IconButton onClick={goToNext} sx={navBtnStyle('right')}>
                        <ChevronRight size={32} />
                    </IconButton>

                    {/* Zoom Mini Map (only if zoomed in) */}
                    {zoom > 1 && isImage && (
                        <Fade in>
                            <Box sx={{
                                position: 'absolute',
                                bottom: 40,
                                right: 40,
                                width: 120,
                                height: 80,
                                bgcolor: 'rgba(255,255,255,0.8)',
                                backdropFilter: 'blur(4px)',
                                border: '2px solid white',
                                borderRadius: 2,
                                zIndex: 100,
                                overflow: 'hidden',
                                pointerEvents: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <Box 
                                    component="img" 
                                    src={currentFile.url} 
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
                                />
                                <Box sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: `${100 / zoom}%`,
                                    height: `${100 / zoom}%`,
                                    border: '1px solid #6366f1',
                                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                                    transform: `translate(calc(-50% - ${position.x / (zoom * 5)}px), calc(-50% - ${position.y / (zoom * 5)}px))`
                                }} />
                            </Box>
                        </Fade>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
}

// Helper Components
function DetailItem({ label, value }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
        </Box>
    );
}

function ShortcutItem({ icon, text, desc }) {
    return (
        <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ p: 0.5, bgcolor: '#f1f5f9', borderRadius: 1, display: 'flex' }}>{icon}</Box>
            <Box>
                <Typography variant="caption" display="block" sx={{ fontWeight: 700, lineHeight: 1 }}>{text}</Typography>
                <Typography variant="caption" color="text.secondary">{desc}</Typography>
            </Box>
        </Stack>
    );
}

const navBtnStyle = (dir) => ({
    position: 'absolute',
    [dir]: 20,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    bgcolor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    '&:hover': { bgcolor: '#f8fafc' },
    display: { xs: 'none', md: 'flex' }
});