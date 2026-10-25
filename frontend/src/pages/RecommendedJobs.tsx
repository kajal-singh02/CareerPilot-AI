import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Job } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Briefcase,
  Search,
  Bookmark,
  BookmarkCheck,
  Target,
  MapPin,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const RecommendedJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState('all');

  const fetchJobs = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listJobs({
        search: search || undefined,
        work_mode: workMode !== 'all' ? workMode : undefined,
        experience_level: experienceLevel !== 'all' ? experienceLevel : undefined,
      });
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [search, workMode, experienceLevel]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleSave = async (job: Job) => {
    try {
      if (job.is_saved) {
        await api.unsaveJob(job.id);
      } else {
        await api.saveJob(job.id);
      }
      setJobs(
        jobs.map((j) => (j.id === job.id ? { ...j, is_saved: !job.is_saved } : j))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update saved job');
    }
  };

  const handleQuickTrack = async (job: Job) => {
    try {
      await api.createApplication({
        job_id: job.id,
        job_title: job.title,
        company: job.company,
        status: 'applied',
        notes: `Application recorded from Recommended Opportunities board.`
      });
      alert(`Tracked "${job.title} at ${job.company}" in your Application Pipeline!`);
    } catch (err: any) {
      alert(err.message || 'Failed to track application');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold font-manrope text-white tracking-tight">
          Recommended Opportunities
        </h2>
        <p className="text-sm text-zinc-300 font-normal mt-1">
          Curated opportunities matching your technical competencies. Compare against your resume with 1 click.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/15 text-zinc-200 text-xs flex items-center justify-between gap-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-[#ef233c] shrink-0" />
          <span>
            <b className="text-white">Sample Dataset Notice:</b> These vacancies are high-fidelity sample positions for local evaluation. Integratable with external ATS/job APIs.
          </span>
        </div>
        <span className="font-mono font-bold text-[#ef233c] uppercase tracking-wider text-[10px] shrink-0 px-2 py-0.5 rounded-full bg-[#ef233c]/15 border border-[#ef233c]/30">
          Verified Sandbox
        </span>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-[#0e0e12]/95 border-white/15">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, company, or tech keywords (React, Python...)"
              className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ef233c]"
            />
          </div>

          <div>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#ef233c]"
            >
              <option value="all" className="bg-zinc-900 text-white">Work Mode: All</option>
              <option value="remote" className="bg-zinc-900 text-white">Remote</option>
              <option value="hybrid" className="bg-zinc-900 text-white">Hybrid</option>
              <option value="onsite" className="bg-zinc-900 text-white">Onsite</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#ef233c]"
            >
              <option value="all" className="bg-zinc-900 text-white">Experience: All</option>
              <option value="Entry-Level" className="bg-zinc-900 text-white">Entry-Level</option>
              <option value="Mid-Level" className="bg-zinc-900 text-white">Mid-Level</option>
              <option value="Senior" className="bg-zinc-900 text-white">Senior</option>
            </select>
            <Button type="submit" variant="primary" size="md" className="font-semibold px-5 shadow-md shadow-[#ef233c]/30">
              Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Job Cards Grid */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#ef233c] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-12 bg-[#0e0e12]/95 border-white/15">
          <Briefcase className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
          <p className="font-bold text-white text-base">No vacancies match your filter</p>
          <p className="text-xs text-zinc-400 mt-1">Try broadening your search term or work mode filter.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="bg-[#0e0e12]/95 border-white/15 hover:border-white/30 transition shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2.5 flex-wrap">
                    <h3 className="font-manrope font-bold text-lg text-white">
                      {job.title}
                    </h3>
                    <Badge variant="neutral">{job.work_mode.toUpperCase()}</Badge>
                    <Badge variant="brand">{job.experience_level}</Badge>
                  </div>

                  <p className="text-xs font-semibold text-zinc-300 flex items-center space-x-3.5 flex-wrap">
                    <span className="text-white font-bold">{job.company}</span>
                    <span className="flex items-center space-x-1 text-zinc-300 font-normal">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{job.location}</span>
                    </span>
                    {job.salary_range && (
                      <span className="flex items-center space-x-1 text-emerald-400 font-mono font-bold">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{job.salary_range}</span>
                      </span>
                    )}
                  </p>

                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-light">
                    {job.description}
                  </p>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {job.required_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-zinc-900 text-zinc-200 border border-white/15"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                  <button
                    onClick={() => toggleSave(job)}
                    className={`p-2 rounded-xl border transition ${
                      job.is_saved
                        ? 'border-[#ef233c] bg-[#ef233c]/20 text-[#ef233c]'
                        : 'border-white/15 hover:bg-white/10 text-zinc-400 hover:text-white'
                    }`}
                    title={job.is_saved ? 'Saved' : 'Save Bookmark'}
                  >
                    {job.is_saved ? <BookmarkCheck className="w-4 h-4 text-[#ef233c]" /> : <Bookmark className="w-4 h-4" />}
                  </button>

                  <Link to={`/job-matcher?jobId=${job.id}`}>
                    <Button variant="primary" size="sm" className="font-semibold shadow-md shadow-[#ef233c]/30">
                      <Target className="w-3.5 h-3.5" />
                      <span>Match Resume</span>
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickTrack(job)}
                    className="font-medium border-white/20 text-zinc-200 hover:text-white hover:bg-white/10"
                  >
                    <span>Track Status</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
