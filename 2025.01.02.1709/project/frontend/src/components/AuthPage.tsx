import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleFortyTwoLogin = () => {
    const clientId = import.meta.env.VITE_42_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_42_REDIRECT_URI;
    const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Morpion</h1>
          <p className="text-gray-600 mt-2">Please sign in to continue</p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 rounded-md transition-colors ${
              isLogin
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <LogIn size={20} />
              <span>Login</span>
            </div>
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 rounded-md transition-colors ${
              !isLogin
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <UserPlus size={20} />
              <span>Sign Up</span>
            </div>
          </button>
        </div>

        <button
          onClick={handleFortyTwoLogin}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
        >
          <img
            src="https://42.fr/wp-content/uploads/2021/08/42-Final-sigle-seul.svg"
            alt="42 Logo"
            className="w-6 h-6"
          />
          <span>Continue with 42</span>
        </button>
      </div>
    </div>
  );
}