import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { AuthCallback } from './components/AuthCallback';
import { Success } from './pages/Success';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/42/callback" element={<AuthCallback />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}