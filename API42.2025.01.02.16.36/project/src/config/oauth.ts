// OAuth configuration
export const OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_CLIENT_ID,
  clientSecret: import.meta.env.VITE_CLIENT_SECRET, 
  redirectUri: import.meta.env.VITE_REDIRECT_URI,
  authUrl: 'https://api.intra.42.fr/oauth/authorize',
  tokenUrl: 'https://api.intra.42.fr/oauth/token',
  scope: 'public'
};