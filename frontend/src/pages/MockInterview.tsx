import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { InterviewSession, InterviewQuestion } from '../types';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Video,
  Send,
  CheckCircle2,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const MockInterview: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);

  // New Interview Form
  const [targetRole, setTargetRole] = useState(user?.profile?.preferred_role || 'Full Stack Engineer');
  const [interviewType, setInterviewType] = useState('mixed');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [starting, setStarting] = useState(false);

  // Active Answering
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [latestEval, setLatestEval] = useState<any>(null);

  const loadSessions = async () => {
    try {
      const list = await api.listInterviews();
      setSessions(list);
      // If there's an in_progress session, open it
      const inProg = list.find((s) => s.status === 'in_progress');
      if (inProg) {
        const full = await api.getInterview(inProg.id);
        setActiveSession(full);
      }
    } catch (err) {
      console.error('Failed to load interview sessions:', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);
    setLatestEval(null);
    try {
      const session = await api.startInterview({
        target_role: targetRole,
        interview_type: interviewType,
        difficulty: difficulty,
        total_questions: 5,
      });
      setActiveSession(session);
      setSessions([session, ...sessions]);
    } catch (err: any) {
      alert(err.message || 'Failed to start interview session');
    } finally {
      setStarting(false);
    }
  };

  const currentQuestion: InterviewQuestion | undefined =
    activeSession?.questions[activeSession.current_index];

  const handleSubmitAnswer = async () => {
    if (!activeSession || !currentQuestion || !currentAnswer.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.submitAnswer(activeSession.id, currentQuestion.id, currentAnswer);
      setLatestEval(res.evaluation);

      // Refresh session state
      const updated = await api.getInterview(activeSession.id);
      setActiveSession(updated);
      setCurrentAnswer('');

      // If finished all questions, complete session
      if (updated.current_index >= updated.total_questions) {
        const completed = await api.completeInterview(activeSession.id);
        setActiveSession(completed);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPastSession = async (sessionId: number) => {
    try {
      const full = await api.getInterview(sessionId);
      setActiveSession(full);
      setLatestEval(null);
    } catch (err) {
      console.error('Failed to fetch session:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-manrope text-white tracking-tight">
            AI Mock Interview Simulator
          </h2>
          <p className="text-sm text-zinc-300 font-normal mt-1">
            Interactive practice across Technical, System Design, and Behavioral tracks with instant STAR framework critique.
          </p>
        </div>

        {activeSession && (
          <Button variant="outline" size="sm" onClick={() => setActiveSession(null)} className="border-white/20 text-white hover:bg-white/10 font-semibold">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Session Setup</span>
          </Button>
        )}
      </div>

      {!activeSession ? (
        /* Setup / Session Launcher */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-[#0e0e12]/95 border-white/15">
            <h3 className="font-manrope font-bold text-lg text-white mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#ef233c]" />
              <span>Configure Practice Session</span>
            </h3>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                  Target Role
                </label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                    Interview Focus Track
                  </label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
                  >
                    <option value="mixed" className="bg-zinc-900 text-white">Mixed (Technical & Behavioral)</option>
                    <option value="technical" className="bg-zinc-900 text-white">Technical & System Architecture</option>
                    <option value="behavioral" className="bg-zinc-900 text-white">Behavioral (STAR Method)</option>
                    <option value="hr" className="bg-zinc-900 text-white">HR & Culture Fit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
                  >
                    <option value="junior" className="bg-zinc-900 text-white">Junior / Associate</option>
                    <option value="intermediate" className="bg-zinc-900 text-white">Mid-Level Engineer</option>
                    <option value="senior" className="bg-zinc-900 text-white">Senior / Lead</option>
                  </select>
                </div>
              </div>

              <Button type="submit" variant="primary" isLoading={starting} className="w-full sm:w-auto font-semibold px-6 shadow-md shadow-[#ef233c]/30">
                <Video className="w-4 h-4" />
                <span>Begin 5-Question Session</span>
              </Button>
            </form>
          </Card>

          {/* Past Sessions List */}
          <Card className="bg-[#0e0e12]/95 border-white/15">
            <h3 className="font-manrope font-bold text-base text-white mb-3">
              Session History ({sessions.length})
            </h3>
            {sessions.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center font-normal">
                No past sessions yet. Start your first practice session on the left!
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectPastSession(s.id)}
                    className="p-3 rounded-xl border border-white/10 bg-black/50 hover:bg-white/5 cursor-pointer transition text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-manrope">{s.target_role}</span>
                      <Badge variant={s.status === 'completed' ? 'success' : 'warning'}>
                        {s.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300 text-xs font-mono">
                      <span>{s.interview_type} · {s.difficulty}</span>
                      {s.overall_score && (
                        <span className="font-bold text-emerald-400">{s.overall_score}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Active Interview In-Progress or Completed View */
        <div className="space-y-6">
          {/* Status & Progress Bar */}
          <Card className="bg-gradient-to-r from-[#1d0608] via-[#0f0304] to-black text-white border-white/15 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-mono font-bold text-[#ff4d6d] tracking-wider">
                  {activeSession.target_role} ({activeSession.interview_type})
                </span>
                <h3 className="font-manrope font-bold text-xl text-white mt-1">
                  {activeSession.status === 'completed'
                    ? 'Session Completed!'
                    : `Question ${activeSession.current_index + 1} of ${activeSession.total_questions}`}
                </h3>
              </div>

              {activeSession.overall_score !== undefined && activeSession.overall_score !== null && (
                <div className="bg-black/60 p-3 rounded-xl border border-white/10 text-center">
                  <span className="text-xs text-zinc-300 font-mono uppercase tracking-wider block font-semibold">Average Score</span>
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                    {activeSession.overall_score}%
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Active Question or Completion Summary */}
          {activeSession.status === 'in_progress' && currentQuestion ? (
            <div className="space-y-6">
              <Card className="border-l-4 border-l-[#ef233c] bg-[#0e0e12]/95 border-white/15">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="brand">{currentQuestion.category}</Badge>
                  {currentQuestion.target_skill && (
                    <span className="text-xs text-zinc-300 font-mono font-medium">
                      Evaluates: {currentQuestion.target_skill}
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-white mt-2 font-manrope leading-snug">
                  "{currentQuestion.question_text}"
                </h4>
              </Card>

              {/* Response Input */}
              <Card className="bg-[#0e0e12]/95 border-white/15">
                <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-2">
                  Your Answer (Use the STAR framework: Situation, Task, Action, Result)
                </label>
                <textarea
                  rows={6}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Outline your approach, technical rationale, specific actions taken, and the quantified outcome..."
                  className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-3 focus:ring-2 focus:ring-[#ef233c] focus:outline-none mb-3"
                ></textarea>

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleSubmitAnswer}
                    isLoading={submitting}
                    disabled={!currentAnswer.trim()}
                    className="font-semibold px-6 shadow-md shadow-[#ef233c]/30"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Answer for Evaluation</span>
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            /* Completed Report */
            <Card className="space-y-6 bg-[#0e0e12]/95 border-white/15">
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold font-manrope text-white">
                  Interview Session Complete
                </h3>
                <p className="text-sm text-zinc-300 max-w-xl mx-auto mt-1 leading-relaxed">
                  {activeSession.feedback_summary}
                </p>
              </div>

              {/* Review All Questions and Answers */}
              <div className="space-y-4">
                <h4 className="font-manrope font-bold text-base text-white border-b border-white/10 pb-2">
                  Full Question & Answer Assessment
                </h4>

                {activeSession.questions.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl border border-white/10 bg-black/60 space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-sm font-manrope">
                        Q{q.question_order}: {q.question_text}
                      </span>
                      {q.answer?.score && (
                        <Badge variant="brand">{q.answer.score}% Score</Badge>
                      )}
                    </div>

                    {q.answer && (
                      <div className="space-y-2">
                        <div className="bg-zinc-900/90 p-3 rounded-xl border border-white/10">
                          <span className="font-mono font-bold text-zinc-400 text-[11px] block mb-1">Your Response:</span>
                          <p className="text-zinc-200 text-xs leading-relaxed">{q.answer.user_response || 'No answer recorded'}</p>
                        </div>

                        {q.answer.improved_answer && (
                          <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30 text-emerald-300">
                            <span className="font-mono font-bold text-[11px] block mb-1 text-emerald-400">Model Exemplar Response:</span>
                            <p className="text-xs leading-relaxed">{q.answer.improved_answer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Real-time Feedback on the question just answered */}
          {latestEval && (
            <Card className="border-l-4 border-l-emerald-500 space-y-3 bg-[#0e0e12]/95 border-white/15">
              <div className="flex justify-between items-center">
                <h4 className="font-manrope font-bold text-base text-white">
                  Instant Answer Feedback
                </h4>
                <Badge variant="success">Score: {latestEval.score}%</Badge>
              </div>

              {latestEval.strengths && (
                <div className="text-xs text-zinc-200">
                  <span className="font-mono font-bold text-emerald-400 block mb-1">Strengths:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    {latestEval.strengths.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {latestEval.improved_answer && (
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs">
                  <span className="font-mono font-bold text-zinc-300 block mb-1">Recommended Model Answer:</span>
                  <p className="text-zinc-200 italic leading-relaxed">"{latestEval.improved_answer}"</p>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
