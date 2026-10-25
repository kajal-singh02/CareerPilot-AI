import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth as useAppAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Shield, CheckCircle2 } from 'lucide-react';
import { SignUp, useUser } from '@clerk/clerk-react';
import { TubesBackground } from '../components/ui/TubesBackground';

export const Register: React.FC = () => {
  const [isSyncing, setIsSyncing] = React.useState(false);
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
          isSyncingRef.current = false;
          setIsSyncing(false);
        }
      }
    };
    syncClerkSession();
  }, [isLoaded, isSignedIn, clerkUser, login, navigate]);

  return (
    <div className="min-h-screen bg-black text-white font-inter relative overflow-x-hidden selection-red">
      {/* Background Parallax Stars & Grid (Same as Landing Page) */}
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
          {/* Left Side: Red Noir Brand & Benefits */}
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
                <span>Free Candidate Access</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-manrope text-white tracking-tight leading-tight">
                Unlock explainable ATS audits and mock interviews.
              </h1>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed font-light">
                Create your account in seconds using Google, GitHub, or email through Clerk's secure identity portal.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
                <span>Explainable 100-point ATS rubric scoring</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
                <span>Tailored 6-week technical sprint roadmaps</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
                <span>STAR mock interviews with Claude 3.5 critique</span>
              </div>
            </div>
          </div>

          {/* Right Side: Clerk Sign Up Component in Red Noir Theme */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {isSyncing && (
              <div className="mb-4 p-3 rounded-xl bg-[#ef233c]/10 border border-[#ef233c]/30 text-[#ef233c] text-xs flex items-center justify-center space-x-2 font-mono">
                <div className="w-4 h-4 border-2 border-[#ef233c] border-t-transparent rounded-full animate-spin"></div>
                <span>Synchronizing candidate profile with CareerPilot AI...</span>
              </div>
            )}
            <div className="w-full max-w-md bg-black/85 border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
              <SignUp
                routing="path"
                path="/register"
                signInUrl="/login"
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
          </div>
        </div>
      </TubesBackground>
    </div>
  );
};
