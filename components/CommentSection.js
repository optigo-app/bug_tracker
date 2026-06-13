'use client';

import React from 'react';
import {
    Box,
    Stack,
    Avatar,
    Typography,
    Divider
} from '@mui/material';
import { MessageSquareText, File } from 'lucide-react';
import { getAvatarColor, getInitials, handleImageError, formatCommentDate } from '@/utils/glocalfunc';
import { getFileNameFromUrl, getMimeTypeFromUrl } from '@/utils/fileUtils';
import CommentInput from '@/components/CommentInput';

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
                            ? c.attachments.map((file) => {
                                const filePath = file.url || file.filepath || '';
                                return {
                                    ...file,
                                    id: file.id,
                                    name: file.name || getFileNameFromUrl(filePath) || 'Attachment',
                                    type: file.type || getMimeTypeFromUrl(filePath) || 'file',
                                    url: filePath,
                                };
                            })
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
                                            <Typography variant="caption" sx={{ color: 'var(--text-2nd-color)', fontWeight: 500 }}>
                                                {formatCommentDate(c.entrydate)}
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
                                                            bgcolor: '#FAFAFA',
                                                            border: '1px solid #E5E7EB',
                                                            borderRadius: 1.5,
                                                            cursor: 'pointer',
                                                            '&:hover': { bgcolor: '#EAECEF' }
                                                        }}
                                                    >
                                                        {file.type?.toLowerCase().startsWith('image') ? (
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
                                                            <File size={20} color="var(--text-2nd-color)" />
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
                            </React.Fragment>
                        );
                    })}
                </Stack>
            ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <MessageSquareText size={24} color="var(--text-2nd-color)" />
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
