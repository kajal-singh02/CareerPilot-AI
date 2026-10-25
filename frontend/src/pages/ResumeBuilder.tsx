import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Resume } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

export const ResumeBuilder: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | ''>('');
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [jobDescription, setJobDescription] = useState('');

  const [tailorResult, setTailorResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const list = await api.listResumes();
        setResumes(list);
        if (list.length > 0) setSelectedResumeId(list[0].id);
      } catch (err) {
        console.error('Failed to load resumes:', err);
      }
    };
    loadResumes();
  }, []);

  const handleTailor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Please select or upload a resume first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await api.tailorResume({
        resume_id: selectedResumeId as number,
        target_role: targetRole,
        job_description: jobDescription || undefined,
      });
      setTailorResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to tailor resume content.');
    } finally {
      setLoading(false);
    }
  };

  const copyCoverLetter = () => {
    if (!tailorResult?.tailored_cover_letter) return;
    navigator.clipboard.writeText(tailorResult.tailored_cover_letter);
    setCopiedCoverLetter(true);
    setTimeout(() => setCopiedCoverLetter(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold font-manrope text-white tracking-tight">
          AI Resume Builder & Role Tailoring
        </h2>
        <p className="text-sm text-zinc-300 font-normal mt-1">
          Tailor your summary, highlight top role-specific skills, and optimize bullet points with Google XYZ methodology while strictly preserving factual accuracy.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-2 backdrop-blur-md">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#ef233c]" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Configuration Card */}
      <Card className="bg-[#0e0e12]/95 border-white/15 shadow-2xl">
        <form onSubmit={handleTailor} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                Base Resume
              </label>
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
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                Target Role Title
              </label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Architect"
                className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
              Specific Job Requirements / Description (Optional)
            </label>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste specific JD context to align keywords and priority highlights..."
              className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
            ></textarea>
          </div>

          <Button type="submit" variant="primary" isLoading={loading} className="font-semibold shadow-md shadow-[#ef233c]/30">
            <Sparkles className="w-4 h-4" />
            <span>Generate Role-Tailored Content</span>
          </Button>
        </form>
      </Card>

      {tailorResult && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <Card className="border-l-4 border-l-[#ef233c] bg-[#0e0e12]/95 border-white/15 shadow-2xl">
            <h3 className="font-manrope font-bold text-lg text-white mb-2">
              Tailored Professional Summary
            </h3>
            <p className="text-sm text-zinc-200 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/10 font-normal">
              {tailorResult.tailored_summary}
            </p>
          </Card>

          {/* Recommended Prominent Skills */}
          <Card className="bg-[#0e0e12]/95 border-white/15 shadow-2xl">
            <h3 className="font-manrope font-bold text-lg text-white mb-3">
              Prominent Skills to Feature for {targetRole}
            </h3>
            <div className="flex flex-wrap gap-2">
              {tailorResult.recommended_skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-900 text-zinc-200 border border-white/15"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>

          {/* Optimized XYZ Experience Bullets */}
          <Card className="bg-[#0e0e12]/95 border-white/15 shadow-2xl">
            <h3 className="font-manrope font-bold text-lg text-white mb-4">
              Optimized Google XYZ Experience Bullets
            </h3>
            <div className="space-y-4">
              {tailorResult.optimized_bullets.map((b: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2 text-xs">
                  <div className="text-zinc-400 italic">
                    <span className="font-mono font-semibold text-[#ef233c] uppercase text-[10px] not-italic mr-1">Before:</span>
                    "{b.original}"
                  </div>
                  <div className="text-white font-semibold bg-zinc-900/90 p-3 rounded-lg border border-white/10">
                    <span className="font-mono font-bold text-emerald-400 uppercase text-[10px] block mb-1">
                      Optimized (XYZ Formula):
                    </span>
                    "{b.improved}"
                  </div>
                  <p className="text-zinc-400 text-[11px] font-light">
                    <b className="text-zinc-300 font-semibold">Strategic Impact:</b> {b.rationale}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Tailored Cover Letter */}
          <Card className="bg-[#0e0e12]/95 border-white/15 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-manrope font-bold text-lg text-white">
                  Tailored Cover Letter
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Concise 3-paragraph outreach letter aligning your experience with {targetRole}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={copyCoverLetter} className="border-white/15 text-zinc-200 hover:text-white hover:bg-white/10">
                {copiedCoverLetter ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Letter</span>
                  </>
                )}
              </Button>
            </div>

            <div className="bg-black/50 p-5 rounded-xl border border-white/10 font-sans text-xs text-zinc-200 whitespace-pre-line leading-relaxed">
              {tailorResult.tailored_cover_letter}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
