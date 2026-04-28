'use client';

import React, { useState } from 'react';
import {
    Box,
    Stack,
    Avatar,
    TextField,
    IconButton,
    Tooltip,
    Typography,
    Chip,
    Button,
    CircularProgress,
} from '@mui/material';
import { getAvatarColor, getInitials } from '@/utils/glocalfunc';
import { Paperclip, Send } from 'lucide-react';
import { uploadFilesForComment } from '@/src/utils/commentAttachmentApi';
import { addCommentApi } from '@/app/api/commentaddApi';

export default function CommentInput({ bugId, currentUser, onCommentAdded }) {
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim() && attachments.length === 0) return;
        setIsSubmitting(true);

        // Get userId from UserProfileData in sessionStorage
        const userProfileData = sessionStorage.getItem('UserProfileData');
        let userId = null;
        if (userProfileData) {
            try {
                const profile = JSON.parse(userProfileData);
                userId = profile.id; // Use id field for userId
            } catch (error) {
                console.error('Error parsing UserProfileData:', error);
            }
        }

        let uploadedAttachments = [];

        if (attachments.length > 0) {
            const uploadResult = await uploadFilesForComment({
                bugId,
                files: attachments,
            });

            if (!uploadResult.success) {
                console.error('Failed to upload comment attachments:', uploadResult.error);
                setIsSubmitting(false);
                return;
            }

            uploadedAttachments = uploadResult.attachments;
        }

        try {
            const data = await addCommentApi({
                bugId,
                userId,
                content: text,
                attachments: uploadedAttachments,
            });

            setText('');
            setAttachments([]);
            // Pass the new comment data to parent for instant update
            if (onCommentAdded) onCommentAdded(data);
        } catch (e) {
            console.error('Failed to post comment:', e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (idx) => {
        setAttachments(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <Box sx={{
            mt: 2,
            position: 'sticky',
            bottom: 0,
            px: 2,
            pb: 2,
            pt: 2,
            bgcolor: '#FFFFFF',
            zIndex: 10,
            borderTop: '1px solid #E5E7EB'
        }}>
            <Box sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <Stack direction="row" spacing={0}>
                    <Box sx={{ flex: 1, p: 1.5, }}>
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            maxRows={8}
                            placeholder="Add a comment… (Shift+Enter for new line)"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                            variant="standard"
                            slotProps={{
                                input: {
                                    disableUnderline: true,
                                    sx: { fontSize: '0.875rem', color: '#444050', lineHeight: 1.7, '& textarea::placeholder': { color: '#7D7f85' } }
                                }
                            }}
                        />

                        {attachments.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                                {attachments.map((file, idx) => (
                                    <Chip
                                        key={idx}
                                        label={file.name}
                                        size="small"
                                        onDelete={() => removeAttachment(idx)}
                                        sx={{ fontSize: '0.7rem', fontWeight: 700, borderRadius: 1.5 }}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 0.5, pb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {/* <>
                        <input
                            type="file"
                            id="comment-file-upload-isolated"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <Tooltip title="Attach Files">
                            <IconButton component="label" htmlFor="comment-file-upload-isolated" size="small" sx={{ color: '#6D6B77' }}>
                                <Paperclip size={18} />
                            </IconButton>
                        </Tooltip>
                        <Typography sx={{ fontSize: '0.72rem', color: text.length > 900 ? '#E11D48' : '#7D7f85', fontWeight: 600 }}>
                            {text.length > 0 ? `${text.length} chars` : 'Enter to send · Shift+Enter for new line'}
                        </Typography>
                        </> */}
                    </Stack>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !text.trim()}
                        endIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <Send size={14} />}
                        sx={{
                            fontWeight: 700,
                            borderRadius: 1.5,
                            fontSize: '0.8rem',
                            px: 2,
                            py: 0.75,
                            background: text.trim() ? 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)' : undefined,
                            boxShadow: text.trim() ? '0 1px 4px rgba(115,103,240,0.15)' : 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        {isSubmitting ? 'Sending…' : 'Send'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
