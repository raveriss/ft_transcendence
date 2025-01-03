import React from 'react';
import { LogIn } from 'lucide-react';
import { OAUTH_CONFIG } from '../config/oauth';

export function LoginButton() {
  const handleLogin = () => {
    const params = new URLSearchParams({
      client_id: OAUTH_CONFIG.clientId,
      redirect_uri: OAUTH_CONFIG.redirectUri,
      response_type: 'code',
      scope: OAUTH_CONFIG.scope
    });

    window.location.href = `${OAUTH_CONFIG.authUrl}?${params}`;
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
    >
      <LogIn size={20} />
      Continue with 42
    </button>
  );
}