import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Executive Career Dashboard',
  '/resumes': 'Resume Library & Parser',
  '/job-matcher': 'Job Description Matcher',
  '/jobs': 'Recommended Opportunities',
  '/roadmap': 'Skill Gap Analysis & Sprint Roadmap',
  '/resume-builder': 'AI Resume Builder & Tailoring',
  '/interviews': 'AI Technical & Behavioral Mock Interview',
  '/applications': 'Job Application Pipeline Tracker',
  '/chat': 'Career Strategy AI Assistant',
  '/settings': 'Profile & Account Settings',
};

export const Layout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#ef233c] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold font-mono text-zinc-400">Loading CareerPilot AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const pageTitle = routeTitles[location.pathname] || 'CareerPilot AI';

  return (
    <div className="flex h-screen bg-black text-white relative overflow-hidden font-inter selection-red">
      {/* Red Noir Global Stars & Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#150406] via-[#090202] to-black"></div>
        <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_60s_linear_infinite]"></div>
        <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-[animStar_90s_linear_infinite]"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-red-600/5 rounded-full blur-[140px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_50%,transparent_90%)]"></div>
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Navbar pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
