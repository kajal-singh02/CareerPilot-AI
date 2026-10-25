import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import {
  FileText,
  Target,
  Milestone,
  Video,
  ArrowRight,
  Clock,
  Briefcase,
  Sparkles,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-[#ef233c] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner in Red Noir Luxury Styling */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d0608] via-[#0f0304] to-black p-6 md:p-8 text-white border border-white/15 shadow-2xl">
        {/* Subtle Ambient Red Glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-red-600/15 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-[#ef233c]/15 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ef233c]/20 text-[#ff4d6d] text-xs font-mono font-bold mb-3 border border-[#ef233c]/40 shadow-sm shadow-[#ef233c]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#ef233c]" />
              <span>Target Role: {user?.profile?.preferred_role || 'Full Stack Developer'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-manrope tracking-tight mb-2 text-white">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Candidate'}!
            </h2>
            <p className="text-zinc-200 text-sm md:text-base max-w-xl font-normal leading-relaxed">
              Track your ATS score optimization, match against new vacancies, and practice technical STAR interviews.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/resumes">
              <Button variant="primary" size="sm" className="font-semibold shadow-md shadow-[#ef233c]/30">
                <FileText className="w-4 h-4" />
                <span>Resume Library</span>
              </Button>
            </Link>
            <Link to="/job-matcher">
              <Button variant="secondary" size="sm" className="font-semibold border-white/20 text-white hover:bg-white/15">
                <Target className="w-4 h-4 text-[#ef233c]" />
                <span>Match Job</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metric Gauges & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Readiness Composite Score Card */}
        <Card className="flex flex-col items-center justify-center text-center p-6 bg-[#0e0e12]/95 border-white/15">
          <ScoreGauge
            score={stats?.readiness_score || 0}
            label="Readiness"
            sublabel="Composite Metric"
            size={110}
          />
          <span className="mt-3 text-sm font-bold text-white font-mono tracking-wide">
            {stats?.readiness_verdict || 'Getting Started'}
          </span>
          <p className="text-xs text-zinc-300 mt-1 font-medium">Based on resume, tests & roadmaps</p>
        </Card>

        {/* ATS Score Card */}
        <Card className="flex flex-col justify-between bg-[#0e0e12]/95 border-white/15">
          <div>
            <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-2">
              <span>ATS Resume Score</span>
              <FileText className="w-4 h-4 text-[#ef233c]" />
            </div>
            <div className="text-3xl font-extrabold font-manrope text-white">
              {stats?.resume_quality_score ? (
                <span>
                  {stats.resume_quality_score} <span className="text-sm text-zinc-400 font-semibold font-mono">/ 100</span>
                </span>
              ) : (
                <span className="text-zinc-400 text-xl font-medium font-mono">No Resume Yet</span>
              )}
            </div>
            <p className="text-xs text-zinc-300 mt-1.5 font-medium">5-dimension algorithmic audit</p>
          </div>
          <Link
            to="/resumes"
            className="mt-4 text-xs font-bold text-[#ef233c] hover:text-[#ff4d6d] flex items-center space-x-1.5 transition-colors font-mono"
          >
            <span>View audit report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* Application Pipeline Card */}
        <Card className="flex flex-col justify-between bg-[#0e0e12]/95 border-white/15">
          <div>
            <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-2">
              <span>Applications Tracked</span>
              <Briefcase className="w-4 h-4 text-[#ef233c]" />
            </div>
            <div className="text-3xl font-extrabold font-manrope text-white">
              {stats?.applications_count || 0}
            </div>
            <p className="text-xs text-zinc-300 mt-1.5 font-medium">Across active recruiting stages</p>
          </div>
          <Link
            to="/applications"
            className="mt-4 text-xs font-bold text-[#ef233c] hover:text-[#ff4d6d] flex items-center space-x-1.5 transition-colors font-mono"
          >
            <span>Manage pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* Sprint Roadmap Progress Card */}
        <Card className="flex flex-col justify-between bg-[#0e0e12]/95 border-white/15">
          <div>
            <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-2">
              <span>Roadmap Sprint</span>
              <Milestone className="w-4 h-4 text-[#ef233c]" />
            </div>
            <div className="text-3xl font-extrabold font-manrope text-white">
              {stats?.roadmap_progress || 0}%
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#ef233c] to-[#ff4d6d] h-full rounded-full transition-all duration-700 shadow-sm shadow-[#ef233c]"
                style={{ width: `${stats?.roadmap_progress || 0}%` }}
              ></div>
            </div>
          </div>
          <Link
            to="/roadmap"
            className="mt-4 text-xs font-bold text-[#ef233c] hover:text-[#ff4d6d] flex items-center space-x-1.5 transition-colors font-mono"
          >
            <span>View milestones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Match & Quick Actions (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Matched Opportunity Card */}
          <Card className="bg-[#0e0e12]/95 border-white/15">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-manrope font-bold text-lg text-white">
                Top Matched Opportunity
              </h3>
              <Badge variant="brand">Highest Compatibility</Badge>
            </div>

            {stats?.top_matched_job ? (
              <div className="p-4 rounded-xl bg-black/70 border border-white/15 flex items-center justify-between shadow-inner">
                <div>
                  <h4 className="font-bold text-white text-base font-manrope">
                    {stats.top_matched_job.job_title}
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 font-medium">
                    {stats.top_matched_job.company_name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                    {stats.top_matched_job.match_score}%
                  </span>
                  <p className="text-xs text-zinc-300 font-medium font-mono">Compatibility</p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-black/50 border border-white/15">
                <Target className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">No Job Matched Yet</p>
                <p className="text-xs text-zinc-300 mt-1 max-w-sm mx-auto font-normal">
                  Compare your resume against any job description to evaluate matching evidence and missing competencies.
                </p>
                <Link to="/job-matcher" className="mt-4 inline-block">
                  <Button variant="outline" size="sm" className="font-semibold border-white/20 text-white hover:bg-white/10">
                    Match a Job Description
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Quick Action Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/resumes" className="group">
              <Card className="h-full bg-[#0e0e12]/95 border-white/15 hover:border-[#ef233c]/60 hover:bg-white/[0.04] transition">
                <FileText className="w-6 h-6 text-[#ef233c] mb-2 group-hover:scale-105 transition" />
                <h4 className="font-bold text-base text-white font-manrope">Resume Audit</h4>
                <p className="text-xs text-zinc-300 mt-1 font-normal leading-relaxed">Run ATS check and XYZ bullet rewrites.</p>
              </Card>
            </Link>

            <Link to="/interviews" className="group">
              <Card className="h-full bg-[#0e0e12]/95 border-white/15 hover:border-[#ef233c]/60 hover:bg-white/[0.04] transition">
                <Video className="w-6 h-6 text-[#ef233c] mb-2 group-hover:scale-105 transition" />
                <h4 className="font-bold text-base text-white font-manrope">Mock Interview</h4>
                <p className="text-xs text-zinc-300 mt-1 font-normal leading-relaxed">Practice STAR questions with instant evaluation.</p>
              </Card>
            </Link>

            <Link to="/resume-builder" className="group">
              <Card className="h-full bg-[#0e0e12]/95 border-white/15 hover:border-[#ef233c]/60 hover:bg-white/[0.04] transition">
                <Sparkles className="w-6 h-6 text-[#ef233c] mb-2 group-hover:scale-105 transition" />
                <h4 className="font-bold text-base text-white font-manrope">Tailor Resume</h4>
                <p className="text-xs text-zinc-300 mt-1 font-normal leading-relaxed">1-click customization for specific roles.</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Applications */}
        <div>
          <Card className="h-full flex flex-col justify-between bg-[#0e0e12]/95 border-white/15">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-manrope font-bold text-lg text-white">
                  Recent Applications
                </h3>
                <Link to="/applications" className="text-xs font-mono font-bold text-[#ef233c] hover:text-[#ff4d6d]">
                  View All
                </Link>
              </div>

              {stats?.recent_applications && stats.recent_applications.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent_applications.slice(0, 4).map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl border border-white/15 bg-black/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white font-manrope text-sm">{app.job_title}</p>
                        <p className="text-zinc-300 text-xs font-mono mt-0.5">{app.company}</p>
                      </div>
                      <Badge
                        variant={
                          app.status === 'offer'
                            ? 'success'
                            : app.status === 'interview'
                            ? 'brand'
                            : app.status === 'rejected'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {app.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-300">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-zinc-400" />
                  <span className="font-medium">No applications tracked yet</span>
                </div>
              )}
            </div>

            <Link to="/applications" className="mt-4">
              <Button variant="outline" size="sm" className="w-full font-semibold border-white/20 text-white hover:bg-white/10">
                Track New Application
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
