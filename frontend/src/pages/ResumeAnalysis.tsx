import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ResumeAnalysis } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Target,
  Tag
} from 'lucide-react';

export const ResumeAnalysisPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!resumeId) return;
      try {
        setLoading(true);
        const data = await api.getResumeAnalysis(parseInt(resumeId, 10));
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load resume analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">
          Claude 3.5 is running transparent 100-point ATS audit...
        </p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl">
        <p className="text-[#ef233c] font-semibold mb-3 font-mono">{error || 'Analysis not found'}</p>
        <Link to="/resumes">
          <Button variant="outline" size="sm">Back to Resume Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/resumes"
          className="text-xs font-semibold text-zinc-300 hover:text-white inline-flex items-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#ef233c]" />
          <span>Back to Resume Library</span>
        </Link>

        <div className="flex items-center space-x-2">
          {analysis.is_live_claude ? (
            <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Claude 3.5 Engine</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-zinc-300 bg-zinc-900 border border-white/15 px-3 py-1 rounded-full">
              <span>Deterministic Algorithmic Audit</span>
            </span>
          )}

          <Link to={`/job-matcher?resumeId=${resumeId}`}>
            <Button variant="primary" size="sm" className="font-semibold shadow-md shadow-[#ef233c]/30">
              <Target className="w-3.5 h-3.5" />
              <span>Match Against Job Description</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview & Score Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score & Gauge Card */}
        <Card className="flex flex-col items-center justify-center text-center p-6 bg-[#0e0e12]/95 border-white/15 shadow-2xl">
          <ScoreGauge
            score={analysis.overall_score}
            label="ATS Score"
            sublabel="Explainable 100-Pt Index"
            size={130}
          />
          <div className="mt-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Grade Status
            </span>
            <p className="text-sm font-bold text-white font-manrope mt-0.5">
              {analysis.overall_score >= 85
                ? 'Excellent Match Readiness'
                : analysis.overall_score >= 70
                ? 'Solid Technical Foundation'
                : 'Actionable Optimization Required'}
            </p>
          </div>
        </Card>

        {/* Rubric Breakdown Grid (2 Spans) */}
        <Card className="lg:col-span-2 bg-[#0e0e12]/95 border-white/15 shadow-2xl">
          <h3 className="text-sm font-bold font-manrope text-white uppercase tracking-wider mb-4">
            100-Point Component Rubric
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Rubric 1 */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="flex justify-between font-bold text-white mb-1 font-manrope">
                <span>Structure & Readability</span>
                <span className="text-[#ef233c] font-mono">{analysis.rubric_scores.structure_readability} / 20</span>
              </div>
              <p className="text-zinc-300 text-[11px] font-light">Typography, section headings, and layout parsing</p>
            </div>

            {/* Rubric 2 */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="flex justify-between font-bold text-white mb-1 font-manrope">
                <span>Skills & Technical Relevance</span>
                <span className="text-[#ef233c] font-mono">{analysis.rubric_scores.skills_technical_relevance} / 25</span>
              </div>
              <p className="text-zinc-300 text-[11px] font-light">Keyword presence & modern tooling depth</p>
            </div>

            {/* Rubric 3 */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="flex justify-between font-bold text-white mb-1 font-manrope">
                <span>Project & Experience Evidence</span>
                <span className="text-[#ef233c] font-mono">{analysis.rubric_scores.projects_experience} / 25</span>
              </div>
              <p className="text-zinc-300 text-[11px] font-light">Substance of technical project outcomes</p>
            </div>

            {/* Rubric 4 */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="flex justify-between font-bold text-white mb-1 font-manrope">
                <span>Clarity & Impact (XYZ Metric)</span>
                <span className="text-[#ef233c] font-mono">{analysis.rubric_scores.clarity_impact} / 20</span>
              </div>
              <p className="text-zinc-300 text-[11px] font-light">Accomplished X as measured by Y</p>
            </div>

            {/* Rubric 5 */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 sm:col-span-2">
              <div className="flex justify-between font-bold text-white mb-1 font-manrope">
                <span>Completeness & Contact Integrity</span>
                <span className="text-[#ef233c] font-mono">{analysis.rubric_scores.completeness} / 10</span>
              </div>
              <p className="text-zinc-300 text-[11px] font-light">Links, education, contact details, and dates</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Executive Summary */}
      <Card className="bg-[#0e0e12]/95 border-white/15 shadow-2xl">
        <h3 className="font-manrope font-bold text-lg text-white mb-2">
          Executive Evaluation
        </h3>
        <p className="text-sm text-zinc-200 leading-relaxed font-normal">
          {analysis.overview.candidate_summary}
        </p>
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-4 text-xs text-zinc-300">
          <span><b className="text-white">Domain:</b> {analysis.overview.detected_domain}</span>
          <span><b className="text-white">Experience Level:</b> {analysis.overview.experience_level}</span>
          <span><b className="text-white">Education:</b> {analysis.overview.education_overview}</span>
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-l-4 border-l-emerald-500 bg-[#0e0e12]/95 border-white/15 shadow-2xl">
          <h4 className="font-manrope font-bold text-sm text-emerald-400 flex items-center space-x-1.5 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Demonstrated Strengths</span>
          </h4>
          <ul className="space-y-2 text-xs text-zinc-200">
            {analysis.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Weaknesses */}
        <Card className="border-l-4 border-l-[#ef233c] bg-[#0e0e12]/95 border-white/15 shadow-2xl">
          <h4 className="font-manrope font-bold text-sm text-[#ff4d6d] flex items-center space-x-1.5 mb-3">
            <AlertTriangle className="w-4 h-4 text-[#ef233c]" />
            <span>Priority Areas for Improvement</span>
          </h4>
          <ul className="space-y-2 text-xs text-zinc-200">
            {analysis.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-[#ef233c] font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Google XYZ Formula Bullet Rewrites */}
      <Card className="bg-[#0e0e12]/95 border-white/15 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-manrope font-bold text-lg text-white">
              High-Impact Bullet Point Rewrites (Google XYZ Formula)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Accomplished [X], as measured by [Y], by doing [Z]
            </p>
          </div>
          <Badge variant="brand">Proven Formula</Badge>
        </div>

        <div className="space-y-4">
          {analysis.improvements.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2 text-xs">
              <div className="text-zinc-400">
                <span className="font-semibold text-[#ef233c] uppercase tracking-wider text-[10px] font-mono">Original:</span>{' '}
                <span className="italic">"{item.original}"</span>
              </div>
              <div className="text-white font-semibold bg-zinc-900/90 p-3 rounded-lg border border-white/10">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block mb-1 font-mono">
                  Optimized Rewrite:
                </span>
                "{item.improved}"
              </div>
              <p className="text-zinc-400 text-[11px] font-light">
                <b className="text-zinc-300 font-semibold">Why this works:</b> {item.rationale}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Categorized Skills Breakdown */}
      <Card>
        <h3 className="font-manrope font-bold text-base text-white mb-4 flex items-center space-x-2">
          <Tag className="w-4 h-4 text-[#ef233c]" />
          <span>Extracted Skills by Category</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {Object.entries(analysis.categorized_skills).map(([cat, skills]) => (
            <div key={cat} className="p-3 rounded-xl bg-black/40 border border-white/10">
              <h5 className="font-bold text-white capitalize mb-2 font-manrope">{cat.replace('_', ' ')}</h5>
              <div className="flex flex-wrap gap-1.5">
                {skills && skills.length > 0 ? (
                  skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-300 text-[11px] font-mono"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-500 italic font-mono text-[11px]">None detected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
