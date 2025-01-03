import React from 'react';
import { Loader } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Loader className="w-8 h-8 animate-spin text-gray-600" />
      <div className="text-gray-600">Connexion en cours...</div>
    </div>
  );
}