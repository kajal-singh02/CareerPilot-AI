import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth as useAppAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { supabase } from '../services/supabase';
import { Lock, Mail, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TubesBackground } from '../components/ui/TubesBackground';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login } = useAppAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error: supaErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supaErr) {
        throw new Error(supaErr.message);
      }

      if (data.user) {
        const fullName = data.user.user_metadata?.full_name || email.split('@')[0];
        // 2. Sync to Backend & generate CareerPilot JWT
        const res = await api.supabaseSync(data.user.id, data.user.email || email, fullName);
        await login(res.access_token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback: try local backend direct login if existing account
      try {
        const res = await api.login(email, password);
        await login(res.access_token);
        navigate('/dashboard');
        return;
      } catch {
        setError(err.message || 'Invalid credentials. Please verify your email and password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Failed to initiate Google authentication.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter relative overflow-x-hidden selection-red">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] via-[#090202] to-black"></div>
        <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]"></div>
        <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-[animStar_80s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[140px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_85%)]"></div>
      </div>

      <TubesBackground className="min-h-screen text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-transparent relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ef233c] to-[#d90429] flex items-center justify-center shadow-lg shadow-[#ef233c]/30 group-hover:scale-105 transition-transform duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white font-manrope">
              Career<span className="text-[#ef233c]">Pilot</span> AI
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-manrope">
            Welcome back to your career intelligence hub.
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in via Supabase secure authentication.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-black/80 border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-xl space-y-6">
            
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm flex items-center justify-center space-x-3 transition-colors duration-200 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 w-full"></div>
              <span className="bg-black px-3 text-xs text-zinc-500 uppercase tracking-widest font-mono">or email</span>
              <div className="border-t border-white/10 w-full"></div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#ef233c] focus:ring-1 focus:ring-[#ef233c] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#ef233c] focus:ring-1 focus:ring-[#ef233c] transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#ef233c] hover:bg-[#d90429] text-white font-bold rounded-xl shadow-lg shadow-[#ef233c]/20 transition-all duration-200 mt-2"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#ef233c] hover:underline font-semibold">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </TubesBackground>
    </div>
  );
};
