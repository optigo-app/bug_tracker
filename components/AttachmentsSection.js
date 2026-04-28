'use client';

import React from 'react';
import {
    Box,
    Grid,
    Typography,
    Stack,
    IconButton
} from '@mui/material';
import { Paperclip, File, Download } from 'lucide-react';
import { handleImageError } from '@/utils/glocalfunc';

function SectionLabel({ children }) {
    return (
        <Typography sx={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: '#7D7f85',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            mb: 0.75
        }}>
            {children}
        </Typography>
    );
}

export default function AttachmentsSection({ attachments = [], onAttachmentClick }) {
    // Map API attachment format to expected structure
    const mappedAttachments = attachments.map(f => ({
        ...f,
        name: f.name || f.fileName,
        url: f.url || f.filePath,
        type: f.type || f.mimeType
    }));

    return (
        <Box>
            <SectionLabel>
                Attachments ({mappedAttachments?.length || 0})
            </SectionLabel>
            {mappedAttachments?.length > 0 ? (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {mappedAttachments.map((f, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={f.id}>
                            <Box
                                onClick={() => onAttachmentClick?.(idx)}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: '1px solid #F1F5F9',
                                    bgcolor: '#FFFFFF',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    '&:hover': {
                                        bgcolor: '#F8FAFC',
                                        borderColor: '#E2E8F0',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                    }
                                }}
                            >
                                {/* Preview */}
                                <Box
                                    sx={{
                                        height: 110,
                                        bgcolor: '#F8FAFC',
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid #F1F5F9'
                                    }}
                                >
                                    {(f.type || f.mimeType || '').toLowerCase().startsWith('image') ? (
                                        <Box
                                            component="img"
                                            src={f.url || f.filePath}
                                            onError={handleImageError}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <File size={28} color="#94A3B8" />
                                    )}
                                </Box>

                                {/* File Info */}
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#1E293B',
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {f.name}
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        sx={{ mt: 0.5 }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{ color: '#94A3B8', fontSize: '0.65rem' }}
                                        >
                                            {f.size}
                                        </Typography>

                                        <IconButton
                                            size="small"
                                            sx={{ p: 0.5 }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <a
                                                href={f.url}
                                                download={f.name}
                                                style={{
                                                    color: '#94A3B8',
                                                    display: 'flex'
                                                }}
                                            >
                                                <Download size={14} />
                                            </a>
                                        </IconButton>
                                    </Stack>
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Paperclip size={24} color="#CBD5E1" />
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 1, fontStyle: 'italic' }}>
                        No attachments yet.
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
