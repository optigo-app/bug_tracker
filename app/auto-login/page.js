'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { CommonAPI } from '@/src/utils/commonApi';
import { fetchMasterGlFunc } from '@/app/api/masterApi';

function AutoLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const [authAttempted, setAuthAttempted] = useState(false);

  useEffect(() => {
    if (authAttempted) {
      console.log('Auto-login: Authentication already attempted, skipping');
      return;
    }

    const data = searchParams.get('data');
    const taskData = searchParams.get('taskData');
    console.log('Auto-login: searchParams:', searchParams.toString());
    console.log('Auto-login: data parameter:', data);
    console.log('Auto-login: taskData parameter:', taskData);

    // Check if user is already authenticated
    const existingAuth = sessionStorage.getItem('AuthqueryParams');
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

    if (isAuthenticated && existingAuth) {
      console.log('Auto-login: User already authenticated, skipping authentication');
      setStatus('success');

      // Handle taskData redirect if present
      if (taskData) {
        try {
          const decodedTaskData = JSON.parse(atob(decodeURIComponent(taskData)));
          const encodedParams = encodeURIComponent(btoa(JSON.stringify(decodedTaskData)));
          router.push(`/bugs?data=${encodedParams}`);
        } catch (e) {
          console.error('Auto-login: Error parsing taskData:', e);
          router.push('/');
        }
      } else {
        router.push('/');
      }
      return;
    }

    if (data) {
      setAuthAttempted(true);
      handleAutoLogin(data, taskData);
    } else {
      const timer = setTimeout(() => {
        const retryData = searchParams.get('data');
        const retryTaskData = searchParams.get('taskData');
        console.log('Auto-login: retry data parameter:', retryData);
        if (retryData) {
          setAuthAttempted(true);
          handleAutoLogin(retryData, retryTaskData);
        } else {
          if (status !== 'success') {
            setStatus('error');
            setErrorMessage('No login data provided in URL');
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams, authAttempted, status]);

  const handleAutoLogin = async (encodedData, taskData) => {
    try {
      console.log('Auto-login: Starting authentication');
      console.log('Auto-login: Raw encoded data:', encodedData);

      let urlDecoded = encodedData;
      try {
        if (encodedData.includes('%')) {
          urlDecoded = decodeURIComponent(encodedData);
          console.log('Auto-login: URL decoded data:', urlDecoded);
        }
      } catch (urlError) {
        console.error('Auto-login: URL decode error:', urlError);
      }

      let decoded;
      try {
        decoded = JSON.parse(atob(urlDecoded));
      } catch (e) {
        setStatus('error');
        setErrorMessage('Invalid login data format');
        return;
      }

      const uid = decoded.uid;
      sessionStorage.setItem('AuthqueryParams', JSON.stringify(decoded));
      console.log('Auto-login: User ID:', uid);
      if (!uid) {
        setStatus('error');
        setErrorMessage('User ID not found in login data');
        return;
      }

      // Call gettoken API using CommonAPI
      const body = {
        "con": JSON.stringify({
          "id": "",
          "mode": "gettoken",
          "appuserid": uid,
          "IPAddress": "0.0.0.0"
        }),
        "p": "{}",
        "f": "bug-tracker (getToken)"
      };

      const response = await CommonAPI(body);
      if (response && response.Status === "200" && response.Data?.rd?.[0]) {
        const rd = response.Data.rd[0];
        const authQueryParams = {
          token: rd.token,
          ukey: rd.ukey,
          sv: rd.sv?.toString() || "0",
          url_path: rd.url_path,
          companycode: rd.companycode,
          uid: uid,
          yc: decoded.yc || ""
        };
        sessionStorage.setItem('AuthqueryParams', JSON.stringify(authQueryParams));
        sessionStorage.setItem('isAuthenticated', 'true');
        setStatus('success');
        // Call master API in background without blocking redirect
        fetchMasterGlFunc().catch((masterError) => {
          console.error('Auto-login: Error fetching master data:', masterError);
        });
        // Redirect to bugs page with task data if present, otherwise to dashboard
        if (taskData) {
          try {
            const decodedTaskData = JSON.parse(atob(decodeURIComponent(taskData)));
            const encodedParams = encodeURIComponent(btoa(JSON.stringify(decodedTaskData)));
            router.push(`/bugs?data=${encodedParams}`);
          } catch (e) {
            console.error('Auto-login: Error parsing taskData:', e);
            router.push('/');
          }
        } else {
          try {
            router.push('/');
          } catch (routerError) {
            window.location.href = '/';
          }
        }
      } else {
        setStatus('error');
        setErrorMessage(response?.Message || 'Authentication failed from API');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      setStatus('error');
      setErrorMessage('An unexpected error occurred during login');
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: '#fafafa',
    }}>
      <Box sx={{
        bgcolor: 'white',
        borderRadius: 4,
        p: 6,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        minWidth: 400
      }}>
        {status === 'processing' && (
          <Stack spacing={3} alignItems="center">
            <CircularProgress size={60} thickness={4} sx={{ color: '#7367f0' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Authenticating...
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-2nd-color)' }}>
                Setting up your session
              </Typography>
            </Box>
          </Stack>
        )}

        {status === 'success' && (
          <Stack spacing={3} alignItems="center">
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={48} color="#16A34A" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Authentication Successful!
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-2nd-color)' }}>
                Redirecting to dashboard...
              </Typography>
            </Box>
          </Stack>
        )}

        {status === 'error' && (
          <Stack spacing={3} alignItems="center">
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={48} color="#EF4444" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Authentication Failed
              </Typography>
              <Typography variant="body2" sx={{ color: '#EF4444', mb: 2, fontWeight: 600 }}>
                {errorMessage}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-2nd-color)' }}>
                Please ensure you are accessing this application through the correct portal.
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default function AutoLogin() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AutoLoginContent />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: '#fafafa',
    }}>
      <Box sx={{
        bgcolor: 'white',
        borderRadius: 4,
        p: 6,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        minWidth: 400
      }}>
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={60} thickness={4} sx={{ color: '#7367f0' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Loading...
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-2nd-color)' }}>
              Preparing authentication
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
