import React, { useState } from 'react';
import { MapPin, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setIsSubmitting(true);

  try {
    const data = await authApi.login(email, password);
    
    // Inspect backend payload structure in console
    console.log('Login response payload:', data);

    // Normalize potential token keys (data.token, data.accessToken, data.data.token, etc.)
    const token =
      data?.token ||
      data?.accessToken ||
      data?.jwt ||
      data?.data?.token ||
      data?.data?.accessToken;

    const userData = data?.user || data?.officer || data?.data?.user || null;

    if (!token) {
      console.error('No token found in response:', data);
      setError('Authentication succeeded, but no access token was returned by the server.');
      return;
    }

    login(token, userData);
  } catch (err) {
    console.error('Login error:', err);
    setError(err.response?.data?.message || err.message || 'Invalid officer credentials');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between p-6 select-none font-sans">
      <header className="flex items-center gap-2">
        <div className="bg-white text-black p-1.5 rounded-lg flex items-center justify-center">
          <MapPin size={18} className="stroke-[2.5]" />
        </div>
        <span className="font-bold tracking-widest text-sm text-neutral-100">CIVICFIX</span>
      </header>

      <main className="w-full max-w-[420px] mx-auto my-auto flex flex-col">
        <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 text-neutral-400">
          <Lock size={20} />
        </div>

        <p className="text-[11px] font-bold tracking-[0.2em] text-neutral-400 uppercase mb-2">
          Officer Portal
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2">
          Log in to continue.
        </h1>
        <p className="text-neutral-400 text-sm mb-6">
          Access civic infrastructure logs and severity queue.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@civicfix.gov"
                className="w-full bg-[#121212] border border-neutral-800 focus:border-neutral-500 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-200 placeholder-neutral-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#121212] border border-neutral-800 focus:border-neutral-500 focus:outline-none rounded-xl pl-10 pr-10 py-3 text-sm text-neutral-200 placeholder-neutral-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-neutral-200 hover:bg-white text-black font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? 'Authenticating...' : 'Log in'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
          <ShieldCheck size={14} />
          <span>Internal government access only</span>
        </div>
      </main>

      <footer className="text-center text-xs text-neutral-500 py-2">
        © 2026 CivicFix &nbsp;•&nbsp; Built for better communities
      </footer>
    </div>
  );
}

export default Login;