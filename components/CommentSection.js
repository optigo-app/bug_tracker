'use client';

import React from 'react';
import {
    Box,
    Stack,
    Avatar,
    Typography,
    Divider
} from '@mui/material';
import { MessageSquare, File } from 'lucide-react';
import { getAvatarColor, getInitials, handleImageError } from '@/utils/glocalfunc';
import CommentInput from '@/components/CommentInput';

function formatDateTime(d) {
    if (!d) return '';
    const date = new Date(d);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (isToday) return `Today at ${time}`;
    if (isYesterday) return `Yesterday at ${time}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ` · ${time}`;
}

export default function CommentSection({
    comments = [],
    bugId,
    currentUser,
    getUserName,
    onCommentAdded,
    onAttachmentClick
}) {
    return (
        <Box>
            {comments?.length > 0 ? (
                <Stack spacing={0} sx={{ mb: 3 }}>
                    {comments?.map((c, idx) => {
                        const userName = getUserName(c.userId);
                        const cc = getAvatarColor(userName);
                        const normalizedAttachments = Array.isArray(c.attachments)
                            ? c.attachments.map((file) => ({
                                ...file,
                                id: file.id,
                                name: file.name || file.fileName || 'Attachment',
                                type: file.type || file.mimeType || 'file',
                                url: file.url || file.filePath || '',
                            }))
                            : [];
                        return (
                            <React.Fragment key={c.id}>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 2,
                                    py: 2.5,
                                    px: 1,
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: '#FAFAFA' },
                                    transition: 'bg 0.1s'
                                }}>
                                    <Avatar sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: cc.bg,
                                        color: cc.text,
                                        fontWeight: 800,
                                        fontSize: '0.75rem',
                                        flexShrink: 0,
                                        mt: 0.25
                                    }}>
                                        {getInitials(userName)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="baseline" sx={{ mb: 0.75 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                                                {userName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                                                {formatDateTime(c.createdAt)}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" sx={{
                                            color: '#475569',
                                            lineHeight: 1.75,
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {c.content}
                                        </Typography>

                                        {normalizedAttachments.length > 0 && (
                                            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                                                {normalizedAttachments.map((file) => (
                                                    <Box
                                                        key={file.id}
                                                        onClick={() => onAttachmentClick?.(file)}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            p: 0.75,
                                                            pr: 1.25,
                                                            bgcolor: '#F8FAFC',
                                                            border: '1px solid #E5E7EB',
                                                            borderRadius: 1.5,
                                                            cursor: 'pointer',
                                                            '&:hover': { bgcolor: '#F1F5F9' }
                                                        }}
                                                    >
                                                        {(file.type || file.mimeType || '').toLowerCase().startsWith('image') ? (
                                                            <Box
                                                                component="img"
                                                                src={file.url}
                                                                onError={handleImageError}
                                                                sx={{
                                                                    width: 20,
                                                                    height: 20,
                                                                    borderRadius: 0.5,
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        ) : (
                                                            <File size={20} color="#94A3B8" />
                                                        )}
                                                        <Typography sx={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            color: '#475569'
                                                        }}>
                                                            {file.name}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </Box>
                                {idx < comments.length - 1 && <Divider sx={{ mx: 1, borderColor: '#F8FAFC' }} />}
                            </React.Fragment>
                        );
                    })}
                </Stack>
            ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <MessageSquare size={24} color="#CBD5E1" />
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 1, fontStyle: 'italic' }}>
                        No comments yet. Be the first.
                    </Typography>
                </Box>
            )}
            <CommentInput
                bugId={bugId}
                currentUser={currentUser}
                onCommentAdded={onCommentAdded}
            />
        </Box>
    );
}
