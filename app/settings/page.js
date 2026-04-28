'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel, 
  Divider, 
  Avatar, 
  Stack,
  Card,
  CardContent,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
  Chip
} from '@mui/material';
import { 
  User, 
  Bell, 
  Lock, 
  ShieldCheck,
  Save,
  Camera,
  ChevronRight,
  Mail,
  Globe,
  Smartphone
} from 'lucide-react';
import { getAvatarColor, getInitials } from '@/utils/glocalfunc';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    bugs: true,
    comments: true
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userProfileData = sessionStorage.getItem('UserProfileData');
    if (userProfileData) {
      try {
        const profile = JSON.parse(userProfileData);
        setCurrentUser({
          id: profile.id,
          name: `${profile.firstname} ${profile.lastname}`.trim() || profile.id,
          role: profile.designation || 'User',
          email: profile.userid
        });
      } catch (error) {
        console.error('Error parsing UserProfileData:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" sx={{ fontWeight: 700 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          You need admin privileges to access this page.
        </Typography>
      </Box>
    );
  }

  const colors = getAvatarColor(currentUser.name);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 1 }}>
          <MuiLink component={Link} underline="hover" color="inherit" href="/" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Dashboard
          </MuiLink>
          <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Settings</Typography>
        </Breadcrumbs>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Settings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
          Manage your account preferences, profile details, and security settings.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Forms */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            {/* Profile Section */}
            <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Profile Information</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Update your photo and personal details here.
                  </Typography>
                </Box>
                <Button variant="contained" startIcon={<Save size={18} />} sx={{ fontWeight: 700 }}>
                  Save Changes
                </Button>
              </Box>

              <Grid container spacing={4} alignItems="center" sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 'auto' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar 
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        bgcolor: colors.bg, 
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: colors.text,
                        border: '4px solid white',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                      }}
                    >
                      {getInitials(currentUser.name)}
                    </Avatar>
                    <IconButton 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0, 
                        bgcolor: 'white', 
                        border: '1px solid #F1F5F9',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        '&:hover': { bgcolor: '#F8FAFC' }
                      }}
                    >
                      <Camera size={16} />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: true }}>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block', textTransform: 'uppercase' }}>Full Name</Typography>
                      <TextField fullWidth defaultValue={currentUser.name} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block', textTransform: 'uppercase' }}>Email Address</Typography>
                      <TextField fullWidth defaultValue={currentUser.email} size="small" disabled />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block', textTransform: 'uppercase' }}>Role</Typography>
                  <TextField fullWidth defaultValue={currentUser.role.replace('_', ' ').toLowerCase()} size="small" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block', textTransform: 'uppercase' }}>Location</Typography>
                  <TextField 
                    fullWidth 
                    defaultValue="San Francisco, CA" 
                    size="small"
                    slotProps={{
                      input: {
                        startAdornment: <Globe size={16} style={{ marginRight: 8, color: '#94A3B8' }} />
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Security Section */}
            <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 1 }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Security & Authentication</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Manage your password and security preferences.
                </Typography>
              </Box>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block', textTransform: 'uppercase' }}>Current Password</Typography>
                  <TextField fullWidth type="password" placeholder="••••••••••••" size="small" />
                </Box>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block', textTransform: 'uppercase' }}>New Password</Typography>
                    <TextField fullWidth type="password" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block', textTransform: 'uppercase' }}>Confirm New Password</Typography>
                    <TextField fullWidth type="password" size="small" />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button variant="outlined" sx={{ fontWeight: 700 }}>Update Password</Button>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column: Settings */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={4}>
            {/* Notification Preferences */}
            <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Notification Settings</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1, display: 'flex' }}><Mail size={18} color="#64748B" /></Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Email</Typography>
                      <Typography variant="caption" color="text.secondary">Weekly digests</Typography>
                    </Box>
                  </Stack>
                  <Switch checked={notifications.email} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1, display: 'flex' }}><Smartphone size={18} color="#64748B" /></Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Push</Typography>
                      <Typography variant="caption" color="text.secondary">Real-time alerts</Typography>
                    </Box>
                  </Stack>
                  <Switch checked={notifications.push} size="small" />
                </Box>
                <Divider sx={{ my: 1 }} />
                <FormControlLabel
                  control={<Switch checked={notifications.bugs} size="small" />}
                  label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Bug Assignments</Typography>}
                  sx={{ justifyContent: 'space-between', width: '100%', ml: 0, mr: 0 }}
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={<Switch checked={notifications.comments} size="small" />}
                  label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Comments</Typography>}
                  sx={{ justifyContent: 'space-between', width: '100%', ml: 0, mr: 0 }}
                  labelPlacement="start"
                />
              </Stack>
            </Paper>

            {/* System Info Card */}
            <Card variant="outlined" sx={{ borderRadius: 1, bgcolor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                  <ShieldCheck size={20} color="#4F46E5" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>System Status</Typography>
                </Stack>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Plan</Typography>
                    <Chip label="PRO" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'primary.main', color: 'white' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Version</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>v1.2.4-stable</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Database</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>Connected</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
