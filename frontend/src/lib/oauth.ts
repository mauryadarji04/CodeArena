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

export const handleOAuthCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    localStorage.setItem('token', token);
    
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('userId', data.data.user._id);
        localStorage.setItem('userEmail', data.data.user.email);
        localStorage.setItem('userName', data.data.user.name);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    
    return token;
  }
  
  return null;
};