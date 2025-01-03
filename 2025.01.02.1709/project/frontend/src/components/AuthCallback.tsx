import React, { useEffect, useState } from 'react';
import { handleOAuthCallback } from '../services/auth';

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    
    if (!code) {
      setError('No authorization code found');
      return;
    }

    handleOAuthCallback(code)
      .then(() => {
        // Redirect to game or dashboard
        window.location.href = '/game';
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <p className="text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}