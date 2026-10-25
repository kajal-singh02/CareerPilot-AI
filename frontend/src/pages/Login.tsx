import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth as useAppAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Lock, Mail, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SignIn, useUser } from '@clerk/clerk-react';
import { TubesBackground } from '../components/ui/TubesBackground';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'clerk' | 'email'>('clerk');
  const [isSyncing, setIsSyncing] = useState(false);
  const { login } = useAppAuth();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const isSyncingRef = React.useRef(false);

  // If user signed in via Clerk, automatically sync to backend
  useEffect(() => {
    const syncClerkSession = async () => {
      if (isLoaded && isSignedIn && clerkUser && !isSyncingRef.current) {
        isSyncingRef.current = true;
        setIsSyncing(true);
        try {
          const emailAddress = clerkUser.primaryEmailAddress?.emailAddress || `${clerkUser.id}@clerk.user`;
          const fullName = clerkUser.fullName || clerkUser.firstName || 'Candidate';
          const res = await api.clerkSync(clerkUser.id, emailAddress, fullName);
          await login(res.access_token);
          navigate('/dashboard');
        } catch (err: any) {
          console.error('Clerk backend sync error:', err);
          setError(err.message || 'Failed to sync authentication session with backend.');
          isSyncingRef.current = false;
          setIsSyncing(false);
        }
      }
    };
    syncClerkSession();
  }, [isLoaded, isSignedIn, clerkUser, login, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      await login(res.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter relative overflow-x-hidden selection-red">
      {/* Background Parallax Stars & Grid (Identical to Landing Page) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] via-[#090202] to-black"></div>
        <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]"></div>
        <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-[animStar_80s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[140px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_85%)]"></div>
      </div>

      <TubesBackground
        className="min-h-screen text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-transparent relative z-10"
        initialPalette="redNoir"
        customTubesColors={['#ef233c', '#d90429', '#ffffff']}
        customLightsColors={['#ef233c', '#ff2a4a', '#8d0801', '#ffffff']}
        lightsIntensity={260}
        showShuffleBadge={true}
      >
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pointer-events-auto">
          {/* Left Side: Red Noir AI Intelligence Showcase */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <div className="w-5 h-5 bg-[#ef233c] rounded-xs rotate-45 shadow-sm shadow-[#ef233c]/50 group-hover:rotate-90 transition-transform duration-300"></div>
              <span className="font-manrope font-bold text-2xl tracking-tight text-white">
                CareerPilot <span className="text-[#ef233c]">AI</span>
              </span>
            </Link>

            <div>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ef233c]/10 border border-[#ef233c]/30 text-[#ef233c] text-xs font-mono font-bold uppercase tracking-wider mb-3">
                <Shield className="w-3.5 h-3.5" />
                <span>Enterprise Single Sign-On</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-manrope text-white tracking-tight leading-tight">
                Welcome back to your career intelligence hub.
              </h1>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed font-light">
                Review your transparent 100-point ATS audits, run real-time job matches, and practice STAR mock interviews.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
                <span>Official Anthropic Claude 3.5 Engine</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
                <span>Multi-Provider Authentication (Google, GitHub, Email)</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
                <span>Encrypted token credentials via Clerk</span>
              </div>
            </div>
          </div>

          {/* Right Side: Clerk Authentication / Demo Toggle */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-md bg-black/85 border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
              {/* Auth Mode Toggle Tabs */}
              <div className="flex rounded-xl bg-zinc-900/90 p-1 mb-6 border border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMode('clerk')}
                  className={`flex-1 py-1.5 rounded-lg transition font-mono ${
                    authMode === 'clerk' ? 'bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/30 font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Clerk SSO
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('email')}
                  className={`flex-1 py-1.5 rounded-lg transition font-mono ${
                    authMode === 'email' ? 'bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/30 font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Email & Password
                </button>
              </div>

              {isSyncing && (
                <div className="mb-4 p-3 rounded-xl bg-[#ef233c]/10 border border-[#ef233c]/30 text-[#ef233c] text-xs flex items-center justify-center space-x-2 font-mono">
                  <div className="w-4 h-4 border-2 border-[#ef233c] border-t-transparent rounded-full animate-spin"></div>
                  <span>Synchronizing session with CareerPilot AI...</span>
                </div>
              )}

              {authMode === 'clerk' ? (
                <div className="flex justify-center">
                  <SignIn
                    routing="path"
                    path="/login"
                    signUpUrl="/register"
                    fallbackRedirectUrl="/dashboard"
                    forceRedirectUrl="/dashboard"
                    appearance={{
                      variables: {
                        colorPrimary: '#ef233c',
                        colorBackground: '#000000',
                        colorText: '#FFFFFF',
                        colorInputBackground: '#0f0f10',
                        colorInputText: '#FFFFFF',
                        colorNeutral: '#a1a1aa',
                        borderRadius: '12px',
                      },
                      elements: {
                        rootBox: { width: '100%' },
                        card: {
                          backgroundColor: '#000000',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: 'none',
                          padding: '1.25rem',
                        },
                        formButtonPrimary: {
                          backgroundColor: '#ef233c',
                          '&:hover': {
                            backgroundColor: '#d90429',
                          },
                        },
                        footerActionLink: {
                          color: '#ef233c',
                          '&:hover': {
                            color: '#ff4d6d',
                          },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div>
                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="candidate@example.com"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef233c]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef233c]"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full py-2.5 bg-[#ef233c] hover:bg-[#d90429] text-white border-none shadow-lg shadow-[#ef233c]/20"
                      isLoading={isLoading}
                    >
                      Sign In
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </TubesBackground>
    </div>
  );
};
