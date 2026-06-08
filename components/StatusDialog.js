'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress
} from '@mui/material';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import RemarkSelector from './RemarkSelector';

export default function StatusDialog({
    open,
    onClose,
    statusLabel,
    onConfirm,
    saving
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
        switch (statusLabel) {
            case 'Assigned':
                return {
                    title: 'Approve & Assign Bug',
                    message: 'This bug will be approved and assigned to the developer.',
                    icon: <AlertCircle size={32} color="#7367f0" />,
                    color: '#7367f0',
                    showRemarks: false,
                    confirmText: 'Assign Bug',
                    remarkRole: 'DEFAULT'
                };
            case 'In Progress':
                return {
                    title: 'Accept Bug',
                    message: 'Developer is accepting this bug and starting work.',
                    icon: <AlertCircle size={32} color="#7367f0" />,
                    color: '#7367f0',
                    showRemarks: false,
                    confirmText: 'Start Progress',
                    remarkRole: 'DEFAULT'
                };
            case 'Ready For Test':
                return {
                    title: 'Move to Ready For Test',
                    message: 'Fix is done and this bug will be moved to testing for QA verification.',
                    icon: <AlertCircle size={32} color="#7367f0" />,
                    color: '#7367f0',
                    showRemarks: false,
                    confirmText: 'Send to Testing',
                    remarkRole: 'developer'
                };
            case 'Fixed':
                return {
                    title: 'Mark as Fixed',
                    message: 'Are you sure you want to mark this bug as fixed?',
                    icon: <CheckCircle2 size={32} color="#16A34A" />,
                    color: '#16A34A',
                    showRemarks: false,
                    confirmText: 'Mark as Fixed',
                    remarkRole: 'developer'
                };
            case 'Verified':
                return {
                    title: 'Verify Bug Fix',
                    message: 'Tester confirms the fix works as expected and marks this bug as verified.',
                    icon: <CheckCircle2 size={32} color="#16A34A" />,
                    color: '#16A34A',
                    showRemarks: false,
                    confirmText: 'Mark as Verified',
                    remarkRole: 'tester'
                };
            case 'Rejected':
                return {
                    title: 'Reject Bug',
                    message: 'Please provide a reason for rejecting this bug to help the developer understand the issue.',
                    icon: <AlertCircle size={32} color="#E11D48" />,
                    color: '#E11D48',
                    showRemarks: true,
                    confirmText: 'Reject Bug',
                    remarkRole: 'admin'
                };
            case 'Reopen':
                return {
                    title: 'Reopen Bug',
                    message: 'Please provide a reason for reopening. This bug will return to the development cycle.',
                    icon: <RotateCcw size={32} color="#E11D48" />,
                    color: '#E11D48',
                    showRemarks: true,
                    confirmText: 'Reopen Bug',
                    remarkRole: 'reopened'
                };
            case 'Deferred':
                return {
                    title: 'Defer Bug',
                    message: 'This bug will be deferred and moved out of the active fixing cycle for now.',
                    icon: <AlertCircle size={32} color="#F59E0B" />,
                    color: '#F59E0B',
                    showRemarks: true,
                    confirmText: 'Defer Bug',
                    remarkRole: 'admin'
                };
            case 'Closed':
                return {
                    title: 'Close Bug',
                    message: 'Bug is verified and will now be marked as completed (closed).',
                    icon: <CheckCircle2 size={32} color="#16A34A" />,
                    color: '#16A34A',
                    showRemarks: false,
                    confirmText: 'Close Bug',
                    remarkRole: 'DEFAULT'
                };
            default:
                return {
                    title: 'Change Status',
                    message: `Are you sure you want to change the status to ${statusLabel}?`,
                    icon: <AlertCircle size={32} color="#7D7f85" />,
                    color: '#7367f0',
                    showRemarks: false,
                    confirmText: 'Confirm',
                    remarkRole: 'DEFAULT'
                };
        }
    };

    const config = getDialogConfig();

    const handleConfirm = () => {
        const finalRemark = remark === 'Other' ? customRemark.trim() : remark;
        onConfirm(finalRemark);
    };

    const isRemarkInvalid = config.showRemarks && (!remark || (remark === 'Other' && !customRemark.trim()));

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
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, fontSize: '1.15rem', letterSpacing: '-0.01em' }}>
                    {config.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-2nd-color)', fontWeight: 500, px: 2, mb: 3, lineHeight: 1.6 }}>
                    {config.message}
                </Typography>

                {config.showRemarks && (
                    <Box sx={{ textAlign: 'left', mb: 2 }}>
                        <RemarkSelector
                            role={config.remarkRole}
                            value={remark}
                            customValue={customRemark}
                            onChange={setRemark}
                            onCustomChange={setCustomRemark}
                        />
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5, bgcolor: '#FAFAFA', borderTop: '1px solid #EAECEF' }}>
                <Button 
                    fullWidth 
                    variant="outlined" 
                    onClick={onClose}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        color: 'var(--text-2nd-color)',
                        borderColor: '#EAECEF',
                        py: 1.25,
                        textTransform: 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: '#CBD5E1',
                            bgcolor: '#FAFAFA',
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={handleConfirm}
                    disabled={saving || isRemarkInvalid}
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
                            background: '#EAECEF',
                            color: 'var(--text-2nd-color)'
                        }
                    }}
                >
                    {saving ? <CircularProgress size={18} color="inherit" /> : config.confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
