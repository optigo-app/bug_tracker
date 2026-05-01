'use client';

import React, { useState } from 'react';
import {
    FormControl,
    Select,
    MenuItem,
    TextField,
    Box
} from '@mui/material';
import { commonTextFieldProps } from '@/utils/glocalfunc';

const REMARKS_DATA = {
    developer: [
        "Fixed branch merged to dev",
        "Performance optimization completed",
        "Backend API integrated",
        "Needs more info from reporter",
        "Partial fix - handling edge cases",
        "Code refactored for clarity"
    ],
    tester: [
        "Verified on Staging environment",
        "Bug reproduced successfully",
        "Regression tests passed",
        "Failed verification - issue persists",
        "Needs screen recording/logs",
        "Inconsistent behavior observed"
    ],
    admin: [
        "Priority reassessed",
        "Project scope adjusted",
        "Awaiting client approval",
        "Duplicate of another issue"
    ],
    reopened: [
        "Issue persists in live environment",
        "Found new edge case in same module",
        "Fix causes regression in other features",
        "Needs further optimization",
        "Documentation/Comments not updated",
        "Incomplete fix - missing sub-tasks"
    ],
    DEFAULT: [
        "Assigned for review",
        "Moving to next sprint",
        "Checked the initial logs"
    ]
};

export default function RemarkSelector({ role, value, customValue, onChange, onCustomChange }) {
    const remarks = REMARKS_DATA[role] || REMARKS_DATA.DEFAULT;
    const isOther = value === 'Other';

    const handleSelectChange = (e) => {
        onChange(e.target.value);
    };

    return (
        <Box>
            <FormControl fullWidth size="small">
                <Select
                    value={value}
                    onChange={handleSelectChange}
                    displayEmpty
                    sx={{ borderRadius: 1.5, fontSize: '0.875rem', ...commonTextFieldProps }}
                    renderValue={(selected) => selected || 'Select remark...'}
                >
                    <MenuItem value="" sx={{ fontSize: '0.85rem', py: 1, fontStyle: 'italic', color: '#9CA3AF' }}>Select remark...</MenuItem>
                    {remarks.map((r) => (
                        <MenuItem key={r} value={r} sx={{ fontSize: '0.85rem', py: 1 }}>{r}</MenuItem>
                    ))}
                    <MenuItem value="Other" sx={{ fontSize: '0.85rem', py: 1, fontWeight: 700, color: '#6366F1' }}>Other...</MenuItem>
                </Select>
            </FormControl>

            {isOther && (
                <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="Enter your custom remark here..."
                    value={customValue}
                    onChange={(e) => onCustomChange(e.target.value)}
                    sx={{ mt: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.875rem' }, ...commonTextFieldProps }}
                />
            )}
        </Box>
    );
}
