// Client-side authentication check utility
export const checkAuth = () => {
  if (typeof window === 'undefined') return false;
  
  const authParams = sessionStorage.getItem('AuthqueryParams');
  const isAuthenticated = sessionStorage.getItem('isAuthenticated');
  
  return authParams && isAuthenticated === 'true';
};

export const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/auto-login';
  }
};

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  
  const authParams = sessionStorage.getItem('AuthqueryParams');
  if (!authParams) return null;
  
  try {
    const parsed = JSON.parse(authParams);
    return parsed.token;
  } catch (e) {
    console.error('Failed to parse AuthqueryParams:', e);
    return null;
  }
};
