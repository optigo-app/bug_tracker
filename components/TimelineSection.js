'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Stack,
    Typography,
    Button,
    Paper
} from '@mui/material';
import { History } from 'lucide-react';
import { formatDateTime, SectionLabel } from '@/utils/glocalfunc';

function getLabelById(id, data, fallbackKey = 'labelname') {
    if (!id || !data || data.length === 0) return id;
    const item = data.find(d => String(d?.id) === String(id));
    return item?.[fallbackKey] || item?.label || item?.name || id;
}



export default function TimelineSection({ timeline = [], getUserName, showFullTimeline, setShowFullTimeline }) {
    const [statusData, setStatusData] = useState([]);
    const [priorityData, setPriorityData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [assigneeData, setAssigneeData] = useState([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                setStatusData(JSON.parse(localStorage.getItem('taskbugstatusData') || '[]'));
                setPriorityData(JSON.parse(localStorage.getItem('taskbugpriorityData') || '[]'));
                setCategoryData(JSON.parse(localStorage.getItem('bug_categoryData') || localStorage.getItem('taskbugcategoryData') || '[]'));
                setAssigneeData(JSON.parse(localStorage.getItem('taskAssigneeData') || '[]'));
            } catch (error) {
                console.error('Error loading reference data for timeline:', error);
            }
        }
    }, []);

    const formatValue = (field, value) => {
        if (!value) return value;
        const lowerField = String(field).toLowerCase();

        if (lowerField.includes('status')) {
            return getLabelById(value, statusData, 'labelname');
        }
        if (lowerField.includes('priority')) {
            return getLabelById(value, priorityData, 'labelname');
        }
        if (lowerField.includes('category')) {
            return getLabelById(value, categoryData, 'labelname');
        }
        if (lowerField.includes('assignee')) {
            const user = assigneeData.find(u => String(u?.id) === String(value) || String(u?.userid) === String(value));
            if (user) {
                return `${user.firstname || ''} ${user.lastname || ''}`.trim() || value;
            }
            return value;
        }
        return value;
    };

    const formatFieldName = (field) => {
        if (!field) return field;
        return field.replace(/Id$/i, '').replace(/([A-Z])/g, ' $1').trim();
    };

    // Transform history data to timeline format if needed
    const transformedTimeline = timeline.map(item => {
        const fieldKey = item.fieldName || item.field;
        // Check if this is history data (has fieldName/field, oldvalue, newvalue)
        if (fieldKey && item.oldvalue !== undefined && item.newvalue !== undefined) {
            const formattedOldvalue = formatValue(fieldKey, item.oldvalue);
            const formattedNewvalue = formatValue(fieldKey, item.newvalue);
            const formattedFieldName = formatFieldName(fieldKey);
            return {
                id: item.id,
                userId: item.userId ?? item.userid,
                time: item.time ?? item.entrydate,
                action: `Changed ${formattedFieldName} from "${formattedOldvalue}" to "${formattedNewvalue}"`,
                remark: item.remark
            };
        }
        // Otherwise return as-is (legacy timeline format)
        return item;
    });

    return (
        <Paper sx={{ borderRadius: 2.5, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #FAFAFA' }}>
                <SectionLabel>Activity</SectionLabel>
            </Box>
            <Box sx={{ px: 3, py: 2.5 }}>
                {transformedTimeline?.length > 0 ? (
                    <Box sx={{ position: 'relative', pl: 2.5 }}>
                        <Box sx={{ position: 'absolute', left: 6, top: 8, bottom: 8, width: 1.5, bgcolor: '#EAECEF', borderRadius: 1 }} />
                        <Stack spacing={2.5}>
                            {(showFullTimeline ? transformedTimeline : transformedTimeline.slice(0, 5)).map((item, i) => {  
                                console.log("kdjskj", item)
                                const userName = getUserName ? getUserName(item.userId) : item.user;
                                return (
                                    <Box key={item.id ?? i} sx={{ position: 'relative' }}>
                                        <Box sx={{ position: 'absolute', left: -19, top: 5, width: 9, height: 9, borderRadius: '50%', bgcolor: i === 0 ? '#4F46E5' : '#CBD5E1', border: '2px solid white', boxShadow: i === 0 ? '0 0 0 2px #C7D2FE' : 'none', zIndex: 1 }} />
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', mb: 0.25, lineHeight: 1.4 }}>
                                            {userName}{' '}
                                            <Box component="span" sx={{ fontWeight: 500, color: 'var(--text-2nd-color)' }}>{item.action}</Box>
                                        </Typography>
                                        {/* {item.remark && (
                                            <Typography variant="caption" sx={{ display: 'block', bgcolor: '#FAFAFA', p: 1, borderRadius: 1, color: '#475569', fontStyle: 'italic', border: '1px solid #EAECEF', mb: 0.5 }}>
                                                "{item.remark}"
                                            </Typography>
                                        )} */}
                                        <Typography sx={{ fontSize: '0.72rem', color: 'var(--text-2nd-color)', fontWeight: 600 }}>{formatDateTime(item.time)}</Typography>
                                    </Box>
                                );
                            })}
                        </Stack>
                        {transformedTimeline.length > 5 && setShowFullTimeline && (
                            <Button
                                size="small"
                                onClick={() => setShowFullTimeline(!showFullTimeline)}
                                sx={{
                                    mt: 2,
                                    ml: -2.5,
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    color: '#4F46E5',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                }}
                            >
                                {showFullTimeline ? 'Show Less' : `+ View ${transformedTimeline.length - 5} More`}
                            </Button>
                        )}
                    </Box>
                ) : (
                    <Box sx={{
                        textAlign: 'center',
                        py: 5,
                        bgcolor: '#FAFAFA',
                        borderRadius: '12px',
                        border: '1px dashed #EAECEF'
                    }}>
                        <History size={32} color="#CBD5E1" />
                        <Typography variant="body2" color="text.disabled" sx={{ mt: 1.5, fontStyle: 'italic' }}>
                            No activity recorded yet.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
