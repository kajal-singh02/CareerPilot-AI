import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Legacy redirects */}
      <Route path="/auth-callback" element={<Navigate to="/dashboard" replace />} />
      <Route path="/sso-callback/*" element={<Navigate to="/dashboard" replace />} />

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
  );
};

export const AppWithRouter: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

export default AppWithRouter;
