import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth as useAppAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { supabase } from './services/supabase';
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

/**
 * Handles Supabase OAuth redirect (Google Sign-In)
 */
const AuthCallbackHandler: React.FC = () => {
  const { login } = useAppAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session && session.user) {
          const user = session.user;
          const email = user.email || `${user.id}@supabase.user`;
          const fullName = user.user_metadata?.full_name || email.split('@')[0];
          
          // Sync with CareerPilot Backend
          const res = await api.supabaseSync(user.id, email, fullName);
          await login(res.access_token);
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback failed:', err);
        navigate('/login', { replace: true });
      }
    };

    handleAuth();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="w-10 h-10 border-4 border-[#ef233c] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-mono text-zinc-400">Authenticating with CareerPilot AI...</p>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth-callback" element={<AuthCallbackHandler />} />
          {/* Legacy fallback */}
          <Route path="/sso-callback/*" element={<Navigate to="/auth-callback" replace />} />

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
    </BrowserRouter>
  );
};

export default App;
