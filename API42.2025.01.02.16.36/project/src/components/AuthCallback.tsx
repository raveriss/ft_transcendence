import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, getUserInfo } from '../services/auth';
import { LoadingSpinner } from './LoadingSpinner';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const authError = params.get('error');

        if (authError) {
          throw new Error('Authentication failed');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        const tokenData = await getAccessToken(code);
        const userData = await getUserInfo(tokenData.access_token);

        // Only navigate after we have all the data
        navigate('/success', { 
          state: { username: userData.login },
          replace: true // Use replace to prevent going back to the callback page
        });
      } catch (err) {
        console.error('Auth error:', err);
        navigate('/', { 
          state: { error: 'Erreur lors de la connexion, veuillez réessayer.' },
          replace: true 
        });
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}