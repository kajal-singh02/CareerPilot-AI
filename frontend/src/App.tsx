import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

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
