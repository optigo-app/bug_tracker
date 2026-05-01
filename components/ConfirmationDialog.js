'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    Stack
} from '@mui/material';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to perform this action?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger' // 'danger' or 'info'
}) {
    const isDanger = type === 'danger';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionProps={{
                timeout: {
                    enter: 300,
                    exit: 200
                }
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.3s ease-in-out'
                }
            }}
            PaperProps={{
                elevation: 24,
                sx: {
                    borderRadius: 3,
                    p: 0,
                    maxWidth: 400,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }
            }}
        >
            <DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
                <Stack spacing={2} alignItems="center" textAlign="center">
                    <Box
                        sx={{
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isDanger ? '#FEF2F2' : '#EFF6FF',
                            color: isDanger ? '#EF4444' : '#3B82F6',
                            boxShadow: isDanger ? '0 8px 24px rgba(239, 68, 68, 0.2)' : '0 8px 24px rgba(59, 130, 246, 0.2)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <AlertTriangle size={32} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, fontSize: '1.15rem', letterSpacing: '-0.01em' }}>
                            {title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, px: 2, lineHeight: 1.6 }}>
                            {message}
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2, gap: 1.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={onClose}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        color: '#64748B',
                        borderColor: '#E2E8F0',
                        py: 1.25,
                        textTransform: 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: '#F8FAFC',
                            borderColor: '#CBD5E1',
                        }
                    }}
                >
                    {cancelText}
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={onConfirm}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        py: 1.25,
                        textTransform: 'none',
                        background: isDanger 
                            ? 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)'
                            : 'linear-gradient(135deg, #7367f0 0%, #9E95F5 100%)',
                        boxShadow: isDanger ? '0 4px 14px rgba(239, 68, 68, 0.3)' : '0 4px 14px rgba(115, 103, 240, 0.3)',
                        transition: 'all 0.2s',
                        '&:hover': {
                            boxShadow: isDanger ? '0 6px 20px rgba(239, 68, 68, 0.4)' : '0 6px 20px rgba(115, 103, 240, 0.4)',
                            transform: 'translateY(-1px)'
                        },
                        '&:active': {
                            transform: 'translateY(0)'
                        }
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
