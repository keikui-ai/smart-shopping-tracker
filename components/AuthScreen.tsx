import React, { useState } from 'react';
import { ShoppingBagIcon, KeyIcon, MailIcon, UserIcon } from './icons';
import { authService } from '../services/authService';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await authService.signIn(email, password);
      } else {
        await authService.signUp(email, password);
      }
      // The onAuthStateChanged listener in App.tsx will handle the redirect.
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
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
          <p className="text-gray-400 mt-2">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>

        <div className="bg-base-200 p-8 rounded-xl shadow-2xl border border-base-300 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MailIcon className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full bg-base-300 text-base-content rounded-lg p-3 pl-10 focus:ring-2 focus:ring-brand-primary focus:outline-none transition placeholder-gray-500"
                aria-label="Email Address"
              />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <KeyIcon className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full bg-base-300 text-base-content rounded-lg p-3 pl-10 focus:ring-2 focus:ring-brand-primary focus:outline-none transition placeholder-gray-500"
                aria-label="Password"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 mt-2 p-3 bg-gradient-to-r from-brand-primary to-indigo-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 disabled:from-base-300 disabled:to-base-300 disabled:text-gray-500 shadow-lg hover:shadow-glow"
              disabled={isLoading || !email || password.length < 6}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
              ) : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
          <p className="text-sm text-gray-400 text-center mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleForm} className="font-semibold text-brand-secondary hover:text-purple-400 ml-2">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;