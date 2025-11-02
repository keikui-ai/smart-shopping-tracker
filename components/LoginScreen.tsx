
import React, { useState } from 'react';
import { ShoppingBagIcon, KeyIcon } from './icons';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const CORRECT_PASSWORD = "password"; 

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setError('');
      onLoginSuccess();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-base-200 rounded-full shadow-lg">
            <ShoppingBagIcon className="w-16 h-16 text-brand-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-base-content mt-6 tracking-tight">
            Smart Shopping Tracker
          </h1>
          <p className="text-gray-400 mt-2">Please log in to continue</p>
        </div>

        <div className="bg-base-200 p-8 rounded-xl shadow-2xl border border-base-300">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <KeyIcon className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-base-300 text-base-content rounded-lg p-3 pl-10 focus:ring-2 focus:ring-brand-primary focus:outline-none transition placeholder-gray-500"
                aria-label="Password"
              />
            </div>

            {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full p-3 bg-gradient-to-r from-brand-primary to-indigo-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 disabled:from-base-300 disabled:to-base-300 disabled:text-gray-500 shadow-lg hover:shadow-glow"
              disabled={!password}
            >
              Login
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-4">Hint: The password is "password"</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;