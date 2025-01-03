import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export function Success() {
  const location = useLocation();
  const username = location.state?.username;

  if (!username) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <Trophy className="mx-auto mb-4 text-yellow-500" size={48} />
        <h1 className="text-2xl font-bold mb-2">
          Bravo {username} !
        </h1>
      </div>
    </div>
  );
}