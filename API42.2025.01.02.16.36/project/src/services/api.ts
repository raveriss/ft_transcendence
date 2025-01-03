import { OAUTH_CONFIG } from '../config/oauth';

export async function getAccessToken(code: string) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: OAUTH_CONFIG.clientId,
    client_secret: OAUTH_CONFIG.clientSecret,
    code,
    redirect_uri: OAUTH_CONFIG.redirectUri
  });

  const response = await fetch(OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to get access token');
  }

  return response.json();
}

export async function getUserInfo(accessToken: string) {
  const response = await fetch('https://api.intra.42.fr/v2/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  return response.json();
}