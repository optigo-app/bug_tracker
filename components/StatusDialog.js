'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Stack,
    CircularProgress
} from '@mui/material';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import RemarkSelector from './RemarkSelector';

export default function StatusDialog({ 
    open, 
    onClose, 
    newStatus, 
    onConfirm, 
    saving, 
    role 
}) {
    const [remark, setRemark] = useState('');
    const [customRemark, setCustomRemark] = useState('');

    useEffect(() => {
        if (!open) {
            setRemark('');
            setCustomRemark('');
        }
    }, [open]);

    const getDialogConfig = () => {
        switch (newStatus) {
            case 'TESTING':
                return {
                    title: 'Move to Testing',
                    message: 'Are you sure this issue is ready for QA? This will notify the testing team.',
                    icon: <AlertCircle size={32} color="#7367f0" />,
                    color: '#7367f0',
                    showRemarks: false,
                    confirmText: 'Move to Testing'
                };
            case 'REOPENED':
                return {
                    title: 'Reopen Bug',
                    message: 'Please provide a reason for reopening this bug to help the developer understand the regression.',
                    icon: <RotateCcw size={32} color="#E11D48" />,
                    color: '#E11D48',
                    showRemarks: true,
                    confirmText: 'Reopen Bug'
                };
            case 'CLOSED':
                return {
                    title: 'Verify & Close',
                    message: 'Has this issue been fully verified in the target environments? This will sign off the bug.',
                    icon: <CheckCircle2 size={32} color="#16A34A" />,
                    color: '#16A34A',
                    showRemarks: false,
                    confirmText: 'Verify & Close'
                };
            default:
                return {
                    title: 'Change Status',
                    message: 'Are you sure you want to change the status?',
                    icon: <AlertCircle size={32} color="#7D7f85" />,
                    color: '#7367f0',
                    showRemarks: false,
                    confirmText: 'Confirm'
                };
        }
    };

    const config = getDialogConfig();

    const handleConfirm = () => {
        const finalRemark = remark === 'Other' ? customRemark : remark;
        onConfirm(finalRemark);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="xs" 
            fullWidth
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
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }
            }}
        >
            <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 3, px: 3 }}>
                <Box sx={{ 
                    width: 72, 
                    height: 72, 
                    borderRadius: '50%', 
                    bgcolor: (config.color + '10'), 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mx: 'auto', 
                    mb: 2.5,
                    boxShadow: `0 8px 24px ${config.color}20`,
                    transition: 'all 0.3s ease'
                }}>
                    {config.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 1.5, fontSize: '1.15rem', letterSpacing: '-0.01em' }}>
                    {config.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, px: 2, mb: 3, lineHeight: 1.6 }}>
                    {config.message}
                </Typography>

                {config.showRemarks && (
                    <Box sx={{ textAlign: 'left', mb: 2 }}>
                        <RemarkSelector
                            role="REOPENED" // Specialized role for reopening reasons
                            value={remark}
                            customValue={customRemark}
                            onChange={setRemark}
                            onCustomChange={setCustomRemark}
                        />
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
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
                            borderColor: '#CBD5E1',
                            bgcolor: '#F8FAFC',
                            color: '#0F172A'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={handleConfirm}
                    disabled={saving || (config.showRemarks && !remark)}
                    sx={{ 
                        borderRadius: 2, 
                        fontWeight: 700, 
                        bgcolor: config.color, 
                        py: 1.25, 
                        textTransform: 'none',
                        background: config.color === '#7367f0' 
                            ? 'linear-gradient(135deg, #7367f0 0%, #9E95F5 100%)'
                            : config.color === '#16A34A'
                            ? 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)'
                            : config.color === '#E11D48'
                            ? 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)'
                            : config.color,
                        boxShadow: `0 4px 14px ${config.color}40`,
                        transition: 'all 0.2s',
                        '&:hover': {
                            boxShadow: `0 6px 20px ${config.color}50`,
                            transform: 'translateY(-1px)'
                        },
                        '&:active': {
                            transform: 'translateY(0)'
                        },
                        '&.Mui-disabled': {
                            background: '#E2E8F0',
                            color: '#94A3B8'
                        }
                    }}
                >
                    {saving ? <CircularProgress size={18} color="inherit" /> : config.confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
