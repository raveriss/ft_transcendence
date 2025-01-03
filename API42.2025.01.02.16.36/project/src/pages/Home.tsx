import React from 'react';
import { useLocation } from 'react-router-dom';
import { LoginButton } from '../components/LoginButton';

export function Home() {
  const location = useLocation();
  const error = location.state?.error;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      <LoginButton />
    </div>
  );
}