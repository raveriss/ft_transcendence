interface Tokens {
  access: string;
  refresh: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
}

interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export async function handleOAuthCallback(code: string): Promise<AuthResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/42/callback/?code=${code}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Authentication failed');
  }

  const data = await response.json();
  
  // Store tokens in localStorage
  localStorage.setItem('access_token', data.tokens.access);
  localStorage.setItem('refresh_token', data.tokens.refresh);
  
  return data;
}