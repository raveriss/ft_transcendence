import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';

export function GameLobby() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white rounded-lg shadow-md p-4 mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {user?.avatar_url && (
              <img
                src={user.avatar_url}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            )}
            <h1 className="text-xl font-bold">Welcome, {user?.username}!</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </header>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Game Lobby</h2>
          <p className="text-gray-600">
            Waiting for implementation of the game features...
          </p>
        </div>
      </div>
    </div>
  );
}