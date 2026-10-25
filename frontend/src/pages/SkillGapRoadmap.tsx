import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Roadmap, Milestone } from '../types';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Milestone as MilestoneIcon,
  CheckCircle2,
  Circle,
  ExternalLink,
  Code,
  Sparkles,
  RefreshCw,
  BookOpen
} from 'lucide-react';

export const SkillGapRoadmap: React.FC = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const list = await api.listRoadmaps();
      setRoadmaps(list);
      if (list.length > 0) {
        setActiveRoadmap(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch roadmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleGenerateNew = async () => {
    setGenerating(true);
    try {
      const targetRole = user?.profile?.preferred_role || 'Full Stack Engineer';
      const created = await api.generateRoadmap(targetRole);
      setRoadmaps([created, ...roadmaps]);
      setActiveRoadmap(created);
    } catch (err: any) {
      alert(err.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const toggleMilestone = async (milestone: Milestone) => {
    if (!activeRoadmap) return;
    try {
      const newStatus = !milestone.is_completed;
      await api.updateMilestone(activeRoadmap.id, milestone.id, newStatus);
      
      const updatedMilestones = activeRoadmap.milestones.map((m) =>
        m.id === milestone.id ? { ...m, is_completed: newStatus } : m
      );
      setActiveRoadmap({ ...activeRoadmap, milestones: updatedMilestones });
    } catch (err: any) {
      alert(err.message || 'Failed to update milestone progress');
    }
  };

  const completedCount = activeRoadmap?.milestones.filter((m) => m.is_completed).length || 0;
  const totalCount = activeRoadmap?.milestones.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-manrope text-white tracking-tight">
            Skill Gap & Learning Sprint Roadmap
          </h2>
          <p className="text-sm text-zinc-300 font-normal mt-1">
            A structured 6-week curriculum systematically bridging your missing technical competencies.
          </p>
        </div>

        <Button variant="primary" onClick={handleGenerateNew} isLoading={generating} className="font-semibold shadow-md shadow-[#ef233c]/30">
          <RefreshCw className="w-4 h-4" />
          <span>Generate Fresh Sprint</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#ef233c] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !activeRoadmap ? (
        <Card className="text-center py-16 bg-[#0e0e12]/95 border-white/15">
          <MilestoneIcon className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
          <h3 className="font-manrope font-bold text-lg text-white mb-1">
            No Active Learning Roadmap
          </h3>
          <p className="text-sm text-zinc-300 max-w-md mx-auto mb-6">
            Generate an AI roadmap personalized to your target role ({user?.profile?.preferred_role || 'Developer'}) and identified gap skills.
          </p>
          <Button variant="primary" onClick={handleGenerateNew} isLoading={generating} className="font-semibold shadow-md shadow-[#ef233c]/30">
            <Sparkles className="w-4 h-4" />
            <span>Generate 6-Week Sprint</span>
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Sprint Executive Header */}
          <Card className="bg-gradient-to-r from-[#1d0608] via-[#0f0304] to-black text-white border-white/15 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ef233c]/20 text-[#ff4d6d] text-xs font-mono font-bold mb-2 border border-[#ef233c]/40">
                  <Sparkles className="w-3.5 h-3.5 text-[#ef233c]" />
                  <span>Target: {activeRoadmap.target_role}</span>
                </div>
                <h3 className="font-manrope font-bold text-lg md:text-xl text-white">
                  {activeRoadmap.objective}
                </h3>
                <p className="text-xs text-zinc-300 mt-1 font-light">
                  6 Weekly Milestones · Interactive completion tracking saved to your profile
                </p>
              </div>

              {/* Progress Dial */}
              <div className="bg-black/60 p-4 rounded-xl border border-white/10 text-center shrink-0 min-w-[140px]">
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {progressPercent}%
                </div>
                <p className="text-[11px] text-zinc-300 uppercase tracking-wider font-semibold font-mono mt-0.5">
                  {completedCount} of {totalCount} Done
                </p>
              </div>
            </div>
          </Card>

          {/* Timeline Milestones */}
          <div className="space-y-4">
            {activeRoadmap.milestones.map((milestone) => (
              <Card
                key={milestone.id}
                className={`transition border bg-[#0e0e12]/95 ${
                  milestone.is_completed ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5 flex-1">
                    <button
                      onClick={() => toggleMilestone(milestone)}
                      className={`mt-0.5 p-1 rounded-full transition ${
                        milestone.is_completed
                          ? 'text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30'
                          : 'text-zinc-500 hover:text-[#ef233c] hover:bg-white/5'
                      }`}
                      title={milestone.is_completed ? 'Mark Incomplete' : 'Mark Completed'}
                    >
                      {milestone.is_completed ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    <div className="space-y-3 flex-1">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ef233c]">
                            Week {milestone.week_number}
                          </span>
                          <span className="text-zinc-600">·</span>
                          <h4 className={`font-manrope font-bold text-base text-white ${
                            milestone.is_completed ? 'line-through text-zinc-500' : ''
                          }`}>
                            {milestone.title}
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed font-light">
                          {milestone.description}
                        </p>
                      </div>

                      {/* Technical Skills Covered */}
                      <div className="flex flex-wrap gap-1.5">
                        {milestone.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-zinc-900 text-zinc-200 border border-white/15"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Practical Tasks Checklist */}
                      <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs space-y-1.5">
                        <span className="font-mono font-bold text-zinc-300 uppercase tracking-wider text-[10px] block mb-1">
                          Weekly Execution Tasks:
                        </span>
                        {milestone.tasks.map((task, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-zinc-200">
                            <span className="text-[#ef233c] font-bold">•</span>
                            <span className="leading-relaxed">{task}</span>
                          </div>
                        ))}
                      </div>

                      {/* Capstone Project Idea */}
                      {milestone.project_idea && (
                        <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 text-xs flex items-start space-x-2 text-violet-900">
                          <Code className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold">Portfolio Deliverable:</span>{' '}
                            <span>{milestone.project_idea}</span>
                          </div>
                        </div>
                      )}

                      {/* Curated Resources */}
                      {milestone.resources && milestone.resources.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1 text-xs">
                          {milestone.resources.map((res, idx) => (
                            <a
                              key={idx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 text-brand-600 hover:text-brand-700 font-semibold underline text-[11px]"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>{res.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
