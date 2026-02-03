const API_BASE_URL = 'http://localhost:3001/api';

export const handleGoogleLogin = () => {
  try {
    window.location.href = `${API_BASE_URL}/auth/google`;
  } catch (error) {
    console.error('Google OAuth error:', error);
    alert('Failed to initiate Google login');
  }
};

export const handleGitHubLogin = () => {
  try {
    window.location.href = `${API_BASE_URL}/auth/github`;
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    alert('Failed to initiate GitHub login');
  }
};

export const handleOAuthCallback = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    localStorage.setItem('token', token);
    return token;
  }
  
  return null;
};