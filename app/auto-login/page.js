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
    console.log('Auto-login: searchParams:', searchParams.toString());
    console.log('Auto-login: data parameter:', data);

    if (data) {
      setAuthAttempted(true);
      handleAutoLogin(data);
    } else {
      const timer = setTimeout(() => {
        const retryData = searchParams.get('data');
        console.log('Auto-login: retry data parameter:', retryData);
        if (retryData) {
          setAuthAttempted(true);
          handleAutoLogin(retryData);
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

  const handleAutoLogin = async (encodedData) => {
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
        try {
          await fetchMasterGlFunc();
        } catch (masterError) {
          console.error('Auto-login: Error fetching master data:', masterError);
        }
        setTimeout(() => {
          try {
            router.push('/');
          } catch (routerError) {
            window.location.href = '/';
          }
        }, 1500);
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
      bgcolor: '#F8FAFC',
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
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                Authenticating...
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
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
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                Authentication Successful!
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
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
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                Authentication Failed
              </Typography>
              <Typography variant="body2" sx={{ color: '#EF4444', mb: 2, fontWeight: 600 }}>
                {errorMessage}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
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
      bgcolor: '#F8FAFC',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
              Loading...
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Preparing authentication
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
