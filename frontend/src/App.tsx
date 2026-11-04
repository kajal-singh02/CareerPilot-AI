import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ClerkProvider, AuthenticateWithRedirectCallback, useUser } from '@clerk/clerk-react';
import { AuthProvider, useAuth as useAppAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { api } from './services/api';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ResumeLibrary } from './pages/ResumeLibrary';
import { ResumeAnalysisPage } from './pages/ResumeAnalysis';
import { JobMatcher } from './pages/JobMatcher';
import { RecommendedJobs } from './pages/RecommendedJobs';
import { SkillGapRoadmap } from './pages/SkillGapRoadmap';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { MockInterview } from './pages/MockInterview';
import { ApplicationTracker } from './pages/ApplicationTracker';
import { CareerChatbot } from './pages/CareerChatbot';
import { SettingsPage } from './pages/Settings';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_c21pbGluZy1jcmFuZS0yMzUuY2xlcmsuYWNjb3VudHMuZGV2JA";

/**
 * Handles SSO/OAuth callbacks (e.g. Google Sign-In redirect)
 * and syncs session with backend to obtain JWT access token
 */
const SSOCallbackHandler: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { login } = useAppAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSync = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          const email = user.primaryEmailAddress?.emailAddress || `${user.id}@clerk.user`;
          const fullName = user.fullName || user.firstName || 'Candidate';
          const res = await api.clerkSync(user.id, email, fullName);
          await login(res.access_token);
          navigate('/dashboard', { replace: true });
        } catch (err) {
          console.error('SSO sync error:', err);
          navigate('/login', { replace: true });
        }
      }
    };
    handleSync();
  }, [isLoaded, isSignedIn, user, login, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <AuthenticateWithRedirectCallback signUpForceRedirectUrl="/dashboard" signInForceRedirectUrl="/dashboard" />
      <div className="mt-4 flex items-center space-x-3 text-sm text-zinc-400 font-mono">
        <div className="w-5 h-5 border-2 border-[#ef233c] border-t-transparent rounded-full animate-spin"></div>
        <span>Authenticating with CareerPilot AI...</span>
      </div>
    </div>
  );
};

const ClerkWithRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ClerkWithRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login/*" element={<Login />} />
            <Route path="/register/*" element={<Register />} />
            <Route path="/sso-callback/*" element={<SSOCallbackHandler />} />

          {/* Authenticated Application Shell */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resumes" element={<ResumeLibrary />} />
            <Route path="/resumes/:resumeId/analysis" element={<ResumeAnalysisPage />} />
            <Route path="/job-matcher" element={<JobMatcher />} />
            <Route path="/jobs" element={<RecommendedJobs />} />
            <Route path="/roadmap" element={<SkillGapRoadmap />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/interviews" element={<MockInterview />} />
            <Route path="/applications" element={<ApplicationTracker />} />
            <Route path="/chat" element={<CareerChatbot />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </ClerkWithRouter>
    </BrowserRouter>
  );
};

export default App;
