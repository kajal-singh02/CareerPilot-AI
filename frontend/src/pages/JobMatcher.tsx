import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Resume, Job, JobMatch } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import {
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const JobMatcher: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialResumeId = searchParams.get('resumeId');
  const initialJobId = searchParams.get('jobId');

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | ''>(initialResumeId ? parseInt(initialResumeId, 10) : '');
  const [selectedJobId, setSelectedJobId] = useState<number | ''>(initialJobId ? parseInt(initialJobId, 10) : '');

  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [matchResult, setMatchResult] = useState<JobMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resList, jobList] = await Promise.all([api.listResumes(), api.listJobs()]);
        setResumes(resList);
        setJobs(jobList);

        if (resList.length > 0) {
          setSelectedResumeId((prev) => (prev ? prev : resList[0].id));
        }

        if (initialJobId) {
          const j = jobList.find((item) => item.id === parseInt(initialJobId, 10));
          if (j) {
            setSelectedJobId(j.id);
            setJobTitle(j.title);
            setCompanyName(j.company);
            setJobDescription(j.description);
          }
        }
      } catch (err: any) {
        console.error('Failed to load initial data:', err);
      }
    };
    fetchData();
  }, [initialResumeId, initialJobId]);

  const handleSelectPreloadedJob = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setSelectedJobId('');
      return;
    }
    const id = parseInt(val, 10);
    setSelectedJobId(id);
    const j = jobs.find((item) => item.id === id);
    if (j) {
      setJobTitle(j.title);
      setCompanyName(j.company);
      setJobDescription(j.description);
    }
  };

  const handleRunMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Please select or upload a resume first.');
      return;
    }
    if (!jobTitle || !jobDescription) {
      setError('Please provide a job title and description.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const match = await api.matchJob({
        resume_id: selectedResumeId as number,
        job_id: selectedJobId ? (selectedJobId as number) : undefined,
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
      });
      setMatchResult(match);
    } catch (err: any) {
      setError(err.message || 'Job match analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold font-manrope text-white tracking-tight">
          Job Description Matcher
        </h2>
        <p className="text-sm text-zinc-300 font-normal mt-1">
          Compare your resume against any job description to evaluate matching evidence, missing skills, and truthful improvements.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-2 font-mono">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Section */}
      <Card className="bg-[#0e0e12]/95 border-white/15">
        <form onSubmit={handleRunMatch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resume Selector */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                Select Resume
              </label>
              {resumes.length === 0 ? (
                <div className="p-2 border border-zinc-700 rounded-xl text-xs text-zinc-300 flex items-center justify-between bg-zinc-900">
                  <span>No resume found</span>
                  <Link to="/resumes" className="text-[#ef233c] font-bold underline font-mono">
                    Upload
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(parseInt(e.target.value, 10))}
                  className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id} className="bg-zinc-900 text-white">
                      {r.filename}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quick Fill From Sample Vacancies */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                Or Quick Fill From Saved Vacancies
              </label>
              <select
                value={selectedJobId}
                onChange={handleSelectPreloadedJob}
                className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
              >
                <option value="" className="bg-zinc-900 text-white">-- Choose vacancy or paste custom JD below --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id} className="bg-zinc-900 text-white">
                    {j.title} ({j.company})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                Target Job Title
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                Company Name (Optional)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Stripe, Airbnb"
                className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
              Full Job Description / Requirements
            </label>
            <textarea
              required
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description, required qualifications, and technology stack here..."
              className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
            ></textarea>
          </div>

          <Button type="submit" variant="primary" isLoading={loading} className="w-full sm:w-auto font-semibold px-6 shadow-md shadow-[#ef233c]/30">
            <Target className="w-4 h-4" />
            <span>Calculate Compatibility Match</span>
          </Button>
        </form>
      </Card>

      {/* Match Results Display */}
      {matchResult && (
        <div className="space-y-6">
          {/* Match Score & Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="flex flex-col items-center justify-center text-center p-6 bg-[#0e0e12]/95 border-white/15">
              <ScoreGauge
                score={matchResult.match_score}
                label="Match Score"
                sublabel="Role Alignment"
                size={130}
              />
              <div className="mt-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  Target Position
                </span>
                <p className="text-base font-bold text-white mt-0.5 font-manrope">
                  {matchResult.job_title} {matchResult.company_name ? `@ ${matchResult.company_name}` : ''}
                </p>
              </div>
            </Card>

            <Card className="lg:col-span-2 bg-[#0e0e12]/95 border-white/15">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">
                Component Score Breakdown (100 Points Max)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>Technical Skills Match</span>
                    <span className="text-emerald-400 font-mono">{matchResult.component_scores.skills_match} / 40</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] font-normal">Direct technology & tool overlap</p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>Projects & Experience Evidence</span>
                    <span className="text-emerald-400 font-mono">{matchResult.component_scores.projects_experience} / 30</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] font-normal">Real-world delivery & project substance</p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>Education & Qualifications</span>
                    <span className="text-emerald-400 font-mono">{matchResult.component_scores.education_qualifications} / 15</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] font-normal">Degree & foundational prerequisites</p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>Explicit JD Requirements</span>
                    <span className="text-emerald-400 font-mono">{matchResult.component_scores.explicit_requirements} / 15</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] font-normal">Stated years, domain experience, and certifications</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Skill Tag Overlap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <Card className="border-l-4 border-l-emerald-500 bg-[#0e0e12]/95 border-white/15">
              <h4 className="font-manrope font-bold text-sm text-emerald-400 flex items-center space-x-1.5 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Matching Verified Skills ({matchResult.matching_skills.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.matching_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 text-xs font-mono font-medium border border-emerald-500/30"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </Card>

            {/* Missing Skills */}
            <Card className="border-l-4 border-l-rose-500 bg-[#0e0e12]/95 border-white/15">
              <h4 className="font-manrope font-bold text-sm text-rose-400 flex items-center space-x-1.5 mb-3">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Missing Requirements ({matchResult.missing_skills.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.missing_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 text-xs font-mono font-medium border border-rose-500/30"
                  >
                    ✕ {s}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* Evidence Table */}
          <Card className="bg-[#0e0e12]/95 border-white/15">
            <h3 className="font-manrope font-bold text-base text-white mb-4">
              Requirement-by-Requirement Evidence Audit
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-300 font-mono uppercase tracking-wider">
                    <th className="py-2.5 px-3">Job Requirement</th>
                    <th className="py-2.5 px-3">Evidence Found In Resume</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {matchResult.evidence.map((ev, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-semibold text-white">{ev.requirement}</td>
                      <td className="py-3 px-3 text-zinc-300 font-light">{ev.resume_evidence}</td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            ev.status.includes('Full')
                              ? 'success'
                              : ev.status.includes('Partial')
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {ev.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="border-l-4 border-l-[#ef233c] bg-[#0e0e12]/95 border-white/15">
            <h3 className="font-manrope font-bold text-base text-white mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#ef233c]" />
              <span>Recommended Next Actions for this Position</span>
            </h3>
            <ul className="space-y-2 text-xs text-zinc-200">
              {matchResult.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#ef233c] font-bold">•</span>
                  <span className="font-normal leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};
