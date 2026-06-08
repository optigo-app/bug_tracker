'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Box,
    Typography,
    Button,
    CircularProgress,
    TextField
} from '@mui/material';
import DepartmentAssigneeAutocomplete from './Common/DepartmentAssigneeAutocomplete';
import RemarkSelector from './RemarkSelector';
import { commonTextFieldProps } from '@/utils/glocalfunc';
import { decodeUrlParams } from '@/utils/urlParams';

export default function ReassignDialog({
    open,
    onClose,
    developers,
    selectedDev,
    setSelectedDev,
    onConfirm,
    saving,
    currentUser,
    bug,
    assigneeids = ''
}) {
    const [remark, setRemark] = useState('');
    const [customRemark, setCustomRemark] = useState('');
    const [assignees, setAssignees] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        // Load assignees from sessionStorage
        if (typeof window !== 'undefined') {
            const taskAssigneeData = sessionStorage.getItem('taskAssigneeData');
            if (taskAssigneeData) {
                try {
                    const parsedData = JSON.parse(taskAssigneeData);
                    // Map the data to match DepartmentAssigneeAutocomplete format
                    const mappedData = parsedData.map(user => ({
                        id: user.id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        department: user.department,
                        designation: user.designation
                    }));
                    setAssignees(mappedData);
                } catch (error) {
                    console.error('Error parsing taskAssigneeData:', error);
                    setAssignees([]);
                }
            }
        }
    }, [open]);

    const resolvedAssigneeIds = React.useMemo(() => {
        if (assigneeids) return assigneeids;
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const dataParam = searchParams.get('data');
            if (dataParam) {
                try {
                    const decoded = decodeUrlParams(dataParam);
                    return decoded.assigneeids || '';
                } catch (error) {
                    console.error('Error decoding params in ReassignDialog:', error);
                }
            }
        }
        return '';
    }, [assigneeids]);

    // Map developers to DepartmentAssigneeAutocomplete format if needed
    const mappedDevelopers = React.useMemo(() => {
        return developers.map(dev => ({
            id: dev.id,
            firstname: dev.firstname || (typeof dev.name === 'string' ? dev.name.split(' ')[0] : '') || '',
            lastname: dev.lastname || (typeof dev.name === 'string' ? dev.name.split(' ').slice(1).join(' ') : '') || '',
            department: dev.department || dev.role || '',
            designation: dev.designation || dev.role || ''
        }));
    }, [developers]);

    const filteredAssignees = React.useMemo(() => {
        const baseList = assignees.length > 0 ? assignees : mappedDevelopers;
        let filteredList = baseList;
        if (resolvedAssigneeIds) {
            const assigneeIdArray = resolvedAssigneeIds
                .split(',')
                .map(id => id.trim())
                .filter(id => id);

            if (assigneeIdArray.length > 0) {
                filteredList = filteredList.filter(
                    (user) =>
                        assigneeIdArray.includes(String(user.id)) ||
                        assigneeIdArray.includes(String(user.userid))
                );
            }
        }
        filteredList = filteredList.filter((user) =>
            String(user.designation || '')
                .toLowerCase()
                .includes('developer')
        );
        return filteredList;
    }, [assignees, mappedDevelopers, resolvedAssigneeIds]);

    const handleClose = () => {
        setRemark('');
        setCustomRemark('');
        setError('');
        onClose();
    };

    const handleConfirm = () => {
        if (!selectedDev) {
            setError('Please select an assignee');
            return;
        }
        const finalRemark = remark === 'Other' ? customRemark : remark;
        onConfirm(selectedDev, finalRemark);
        setRemark('');
        setCustomRemark('');
        setError('');
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
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
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }
            }}
        >
            <DialogTitle sx={{
                fontWeight: 700,
                pb: 1,
                pt: 3,
                px: 3,
                fontSize: '1.15rem',
                letterSpacing: '-0.01em',
                bgcolor: '#FAFAFA',
                borderBottom: '1px solid #EAECEF'
            }}>
                forward Bug
                {bug && (
                    <Typography sx={{
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: 'var(--text-2nd-color)',
                        mt: 0.5,
                        display: 'block'
                    }}>
                        #{bug.bugNo || bug.id?.substring(0, 6).toUpperCase()} – {bug.title?.substring(0, 50)}{bug.title?.length > 50 ? '...' : ''}
                    </Typography>
                )}
            </DialogTitle>
            <DialogContent sx={{ mt: 2.5, pb: 3, px: 3 }}>
                <Stack spacing={2}>
                    <Box>
                        <Typography sx={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            mb: 0.75,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.25
                        }}>
                            Assign To <Typography sx={{ color: '#DC2626' }}>*</Typography>
                        </Typography>
                        <DepartmentAssigneeAutocomplete
                            options={filteredAssignees}
                            label=""
                            placeholder="Search assignee..."
                            multiple={false}
                            value={filteredAssignees.find(a => a.id === selectedDev) || null}
                            onChange={(newValue) => {
                                setSelectedDev(newValue?.id || '');
                                setError('');
                            }}
                            error={!!error}
                        />
                        {error && (
                            <Typography sx={{
                                fontSize: '0.75rem',
                                color: '#DC2626',
                                mt: 0.5,
                                fontWeight: 600
                            }}>
                                {error}
                            </Typography>
                        )}
                    </Box>

                    <Box>
                        <Typography sx={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            mb: 0.75
                        }}>
                            Quick Remark (Optional)
                        </Typography>
                        <RemarkSelector
                            role={currentUser?.role}
                            value={remark}
                            customValue={customRemark}
                            onChange={setRemark}
                            onCustomChange={setCustomRemark}
                        />
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
                <Button
                    onClick={handleClose}
                    disabled={saving}
                    className='secondaryBtnClassname'
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!selectedDev || saving}
                    className='buttonClassname'
                >
                    {saving ? <CircularProgress size={18} color="inherit" /> : 'forward'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
