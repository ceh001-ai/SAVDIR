import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, User, Lock, ArrowRight, Sparkles, AlertCircle, FileUp } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (username: string) => void;
  usersList: { username: string; passwordHash: string }[];
  onRegisterUser: (username: string, passwordHash: string) => void;
  triggerToast: (msg: string) => void;
  onImportBackup: (file: File) => void;
}

export default function AuthScreen({
  onLoginSuccess,
  usersList,
  onRegisterUser,
  triggerToast,
  onImportBackup
}: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // A simple hashing function for client-side localStorage passwords
  const hashPassword = (pwd: string): string => {
    let hash = 0;
    for (let i = 0; i < pwd.length; i++) {
      const char = pwd.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return 'sh_' + Math.abs(hash).toString(36);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (cleanPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    const hashed = hashPassword(cleanPassword);

    if (isRegistering) {
      if (cleanPassword !== confirmPassword.trim()) {
        setError('Passwords do not match.');
        return;
      }

      // Check if user already exists
      const userExists = usersList.some(u => u.username === cleanUsername);
      if (userExists) {
        setError('Username is already taken.');
        return;
      }

      // Register the user
      onRegisterUser(cleanUsername, hashed);
      triggerToast(`Account created successfully for ${cleanUsername}!`);
      onLoginSuccess(cleanUsername);
    } else {
      // Find the user
      const user = usersList.find(u => u.username === cleanUsername);
      if (!user) {
        setError('Invalid username or password.');
        return;
      }

      if (user.passwordHash !== hashed) {
        setError('Invalid username or password.');
        return;
      }

      triggerToast(`Welcome back, ${cleanUsername}!`);
      onLoginSuccess(cleanUsername);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 select-none relative overflow-hidden" id="auth-root">
      {/* Background Decorative Mesh */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none z-0" />
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white border border-gray-100 rounded-md p-8 shadow-xs z-10 relative"
        id="auth-card"
      >
        {/* App Logo & Brand Header */}
        <div className="text-center mb-8">
          <div className="w-9 h-9 rounded-sm bg-black text-white flex items-center justify-center font-bold text-sm tracking-wider mx-auto mb-3">
            S
          </div>
          <h1 className="text-xl font-bold font-display text-gray-900 tracking-tight">
            SAVDIR
          </h1>
          <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-1">
            Personal Learning Hub
          </p>
        </div>

        {/* Action Toggle Tab Header */}
        <div className="flex border-b border-gray-100 mb-6" id="auth-mode-toggle">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setError(null);
            }}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b transition-colors duration-200 ${
              !isRegistering
                ? 'border-black text-black'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setError(null);
            }}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b transition-colors duration-200 ${
              isRegistering
                ? 'border-black text-black'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Notification */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded text-rose-700 text-xs font-medium flex items-start gap-2 overflow-hidden"
              id="auth-error-message"
            >
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Username
            </label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="auth-username-input"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 border border-gray-100 bg-gray-50/50 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white transition-all"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="auth-password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 border border-gray-100 bg-gray-50/50 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white transition-all"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {isRegistering && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="auth-confirm-password-input"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-100 bg-gray-50/50 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white transition-all"
                  autoComplete="new-password"
                />
              </div>
            </motion.div>
          )}

          <button
            id="btn-auth-submit"
            type="submit"
            className="w-full py-2.5 bg-black hover:bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition flex items-center justify-center gap-1.5 mt-2"
          >
            <span>{isRegistering ? 'Create Account' : 'Access Hub'}</span>
            <ArrowRight size={13} />
          </button>
        </form>

        {/* Offline & backup restoration section */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 leading-relaxed font-sans max-w-[320px] mx-auto">
            <Shield size={12} className="inline-block mr-1 text-gray-400" />
            SAVDIR uses isolated, client-side browser storage. Your credentials and learning notes are 100% private.
          </p>

          <div className="mt-4 flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Have a device backup?</span>
            <label
              htmlFor="auth-backup-upload"
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-black rounded-md text-[10px] font-semibold uppercase tracking-wider transition"
            >
              <FileUp size={11} />
              Restore Backup File
            </label>
            <input
              id="auth-backup-upload"
              type="file"
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
