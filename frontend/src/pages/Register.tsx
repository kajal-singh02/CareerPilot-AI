import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth as useAppAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Lock, Mail, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TubesBackground } from '../components/ui/TubesBackground';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAppAuth();
  const navigate = useNavigate();

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.register(email, password, fullName);
      await login(res.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please verify details and try again.');
    } finally {
      setIsLoading(false);
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
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Benefits */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <Link to="/" className="inline-flex items-center space-x-3 mb-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ef233c] to-[#d90429] flex items-center justify-center shadow-lg shadow-[#ef233c]/30 group-hover:scale-105 transition-transform duration-300">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-manrope">
                Career<span className="text-[#ef233c]">Pilot</span> AI
              </span>
            </Link>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-manrope">
              Supercharge your career with <span className="text-[#ef233c]">AI-driven</span> intelligence.
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Join thousands of software engineers optimizing their resumes, preparing for STAR mock interviews, and tracking applications.
            </p>

            <div className="space-y-3 pt-2 text-sm text-zinc-300 font-medium">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#ef233c] shrink-0" />
                <span>Instant ATS Resume Score & Keyword Analysis</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#ef233c] shrink-0" />
                <span>Personalized Skill Gap Sprint Roadmaps</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#ef233c] shrink-0" />
                <span>Claude 3.5 Powered Mock Interviews</span>
              </div>
            </div>
          </div>

          {/* Right Column: Register Form */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-md bg-black/85 border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-xl space-y-6">
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white font-manrope">Create your account</h2>
                <p className="text-xs text-zinc-400 mt-1">Get started in 30 seconds</p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleManualRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Johnson"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#ef233c] focus:ring-1 focus:ring-[#ef233c] transition-colors"
                    />
                  </div>
                </div>

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
                      placeholder="alex@domain.com"
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
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#ef233c] focus:ring-1 focus:ring-[#ef233c] transition-colors"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#ef233c] hover:bg-[#d90429] text-white font-bold rounded-xl shadow-lg shadow-[#ef233c]/20 transition-all duration-200 mt-2"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-zinc-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#ef233c] hover:underline font-semibold">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </TubesBackground>
    </div>
  );
};
