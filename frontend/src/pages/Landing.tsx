import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FileCheck,
  Target,
  Milestone,
  Video,
  Bot,
  Zap,
  Check,
  Star
} from 'lucide-react';
import { TubesBackground } from '../components/ui/TubesBackground';

export const Landing: React.FC = () => {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistEmail.trim()) {
      setWaitlistSubmitted(true);
      setTimeout(() => setWaitlistSubmitted(false), 4000);
      setWaitlistEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter relative overflow-x-hidden selection-red">
      {/* =========================================================================
          GLOBAL RED NOIR BACKGROUND WITH STARFIELDS & GRID
          ========================================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] via-[#090202] to-black"></div>
        {/* Parallax Starfields */}
        <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]"></div>
        <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-[animStar_80s_linear_infinite]"></div>
        {/* Ambient Crimson Glow Sphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-red-600/5 rounded-full blur-[140px]"></div>
        {/* Subtle Tech Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_85%)]"></div>
      </div>

      {/* Top Header Blur Effect */}
      <div className="gradient-blur"></div>

      {/* =========================================================================
          FLOATING PILL NAVBAR
          ========================================================================= */}
      <header className="fixed top-0 left-0 w-full z-50 pt-5 px-4">
        <nav className="max-w-6xl mx-auto flex items-center justify-between bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-5 h-5 bg-[#ef233c] rounded-xs rotate-45 shadow-sm shadow-[#ef233c]/50 group-hover:rotate-90 transition-transform duration-300"></div>
            <span className="text-lg font-bold font-manrope tracking-tight text-white">
              CareerPilot <span className="text-[#ef233c]">AI</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#intelligence" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">
              Intelligence
            </a>
            <a href="#features" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">
              Platform
            </a>
            <Link to="/chat" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-[#ef233c] transition-colors flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-[#ef233c]" />
              <span>AI Mentor</span>
            </Link>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white transition px-2"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/5 px-5 py-2 transition-transform active:scale-95"
            >
              <span className="absolute inset-0 border border-white/10 rounded-full"></span>
              <span className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,#ef233c_100%)] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="absolute inset-[1px] rounded-full bg-black"></span>
              <span className="relative z-10 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                Get Access
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          HERO SECTION (RED NOIR PALETTE)
          ========================================================================= */}
      <main className="relative z-10">
        <section className="min-h-screen relative flex flex-col justify-center overflow-hidden border-b border-white/10">
          <TubesBackground
            className="pt-36 pb-24 px-6 bg-transparent"
            initialPalette="redNoir"
            customTubesColors={['#ef233c', '#d90429', '#ffffff']}
            customLightsColors={['#ef233c', '#ff2a4a', '#8d0801', '#ffffff']}
            lightsIntensity={260}
            showShuffleBadge={true}
          >
            <div className="text-center max-w-5xl mx-auto pointer-events-auto">
              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-lg shadow-black/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef233c]"></span>
                </span>
                <span className="text-xs font-medium text-red-100/90 tracking-wide font-manrope">
                  Career Intelligence 2.0 is now live · Powered by Claude 3.5
                </span>
                <ArrowRight className="w-3 h-3 text-red-400" />
              </div>

              {/* Master Headline */}
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter font-manrope leading-[1.08] mb-8 select-none">
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                  Career Intelligence
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                  for your{' '}
                  <span className="text-[#ef233c] inline-block relative">
                    Future
                    <svg
                      className="absolute w-full h-3 -bottom-2 left-0 text-[#ef233c] opacity-80"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                    >
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    </svg>
                  </span>
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                Explainable 100-point ATS resume rubrics, deterministic skill gap roadmaps, and STAR mock interview critique engineered to ship offers 10x faster.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/register" className="shiny-cta group w-full sm:w-auto">
                  <span className="relative z-10 flex items-center justify-center gap-2 text-white font-semibold text-sm tracking-wide">
                    Audit Resume Free
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </div>
            </div>
          </TubesBackground>

          {/* Logo / Tech Stack Integrated Strip */}
          <div className="w-full border-t border-white/5 bg-white/[0.02] backdrop-blur-sm py-8 opacity-75 hover:opacity-100 transition-opacity">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-6 md:gap-12">
              <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase shrink-0 font-mono">
                Engine Matrix:
              </p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-14 items-center w-full text-xs font-manrope font-semibold text-zinc-300">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#ef233c] rounded-full shadow-xs shadow-[#ef233c]"></div>
                  Anthropic Claude 3.5
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-white/40 rounded-full"></div>
                  100-Point ATS Rubric
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-white/40 rounded-full"></div>
                  Deterministic Match
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-white/40 rounded-full"></div>
                  Clerk SSO
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-white/40 rounded-full"></div>
                  STAR Behavioral AI
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BENTO GRID: OPERATING SYSTEM FOR MODERN ENGINEERING CAREERS
            ========================================================================= */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ef233c]/10 border border-[#ef233c]/30 text-[#ef233c] text-xs font-mono font-bold tracking-widest uppercase mb-4">
              // 02 ARCHITECTURE MATRIX
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight font-manrope mb-6">
              The Operating System for <br />
              <span className="text-[#ef233c]">High-Growth Tech Careers</span>
            </h2>
            <p className="text-lg text-zinc-400 font-light">
              Replace fragmented job boards, generic advice, and blind resumes with an integrated AI intelligence hub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-auto lg:h-[700px]">
            {/* Main Feature 1: Explainable 100-Pt ATS Rubric (2x2) */}
            <div className="lg:col-span-2 lg:row-span-2 group relative overflow-hidden p-8 border border-white/10 bg-gradient-to-b from-zinc-900/60 to-black hover:border-white/20 transition-all rounded-2xl shadow-xl flex flex-col">
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-6 inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-[#ef233c] w-fit">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-semibold text-white font-manrope mb-4 tracking-tight">
                  Explainable 100-Point ATS Audit
                </h3>
                <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-6 font-light">
                  No black-box mystery numbers. Get mathematically grounded scoring across 5 distinct dimensions: Quantified Impact (25), Role Relevance (25), Skill Coverage (20), Structure (10), and Format Safety (20) with Google XYZ bullet point rewrites.
                </p>

                {/* Score Rubric Graphic Pill */}
                <div className="mt-auto p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">BENCHMARK PASS SCORE</span>
                    <span className="text-[#ef233c] font-bold">85 / 100</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#ef233c] h-full w-[85%] rounded-full shadow-[0_0_12px_rgba(239,35,60,0.8)]"></div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-xs font-mono text-[#ef233c] tracking-wider uppercase font-semibold">
                    AUDIT YOUR RESUME
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#ef233c]" />
                </div>
              </div>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity pointer-events-none"
                style={{ background: 'radial-gradient(circle at top right, #ef233c, transparent 70%)' }}
              ></div>
            </div>

            {/* Feature 2: Deterministic Semantic Job Matching (2x1) */}
            <div className="lg:col-span-2 group relative overflow-hidden p-8 border border-white/10 bg-black hover:border-white/20 transition-all rounded-2xl flex flex-col justify-between">
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-rose-400">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white font-manrope mb-2 tracking-tight">
                  Deterministic Job Matcher
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-light">
                  Compare your resume directly against verified job listings. Identifies exact keyword alignment, missing tech stack prerequisites, and salary percentiles.
                </p>
              </div>
              <div className="relative z-10 pt-4 flex items-center gap-2 text-xs font-mono text-zinc-500">
                <Check className="w-3.5 h-3.5 text-[#ef233c]" />
                <span>Weighted skill overlap + experience heuristics</span>
              </div>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity pointer-events-none"
                style={{ background: 'radial-gradient(circle at top right, #ef233c, transparent 70%)' }}
              ></div>
            </div>

            {/* Feature 3: 6-Week Sprint Roadmaps */}
            <div className="group relative overflow-hidden p-8 border border-white/10 bg-black hover:border-white/20 transition-all rounded-2xl flex flex-col justify-between">
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-amber-400">
                  <Milestone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white font-manrope mb-2">
                  Sprint Roadmaps
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">
                  Bridge detected skill gaps in 6 structured weeks with curated milestones, GitHub project ideas, and documentation.
                </p>
              </div>
              <div className="text-[11px] font-mono text-amber-400/90 pt-3 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Docker · K8s · System Design</span>
              </div>
            </div>

            {/* Feature 4: STAR Mock Interview Coach */}
            <div className="group relative overflow-hidden p-8 border border-white/10 bg-black hover:border-white/20 transition-all rounded-2xl flex flex-col justify-between">
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-purple-400">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white font-manrope mb-2">
                  STAR Mock Coach
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">
                  Practice behavioral and technical questions graded against hiring manager rubrics for Situation, Task, Action, and Result.
                </p>
              </div>
              <div className="text-[11px] font-mono text-purple-400/90 pt-3 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                <span>Real-Time Claude Feedback</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            STRIKING RED TESTIMONIAL BANNER
            ========================================================================= */}
        <section className="w-full bg-[#ef233c] py-20 px-6 shadow-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 text-black mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current text-black" />
              ))}
            </div>
            <h3 className="text-3xl md:text-5xl font-bold text-black font-manrope leading-tight mb-8 tracking-tight">
              "CareerPilot AI completely transformed my interview hit rate. What used to take months of blind rejections turned into 3 senior engineering offers in 4 weeks."
            </h3>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm">
                MK
              </div>
              <div className="text-left">
                <div className="text-black font-bold text-lg font-manrope">Marcus Kim</div>
                <div className="text-black/80 font-medium text-sm">Staff Frontend Engineer at Scale</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CTA WAITLIST / INSTANT JOIN
            ========================================================================= */}
        <section className="py-32 px-6 text-center bg-zinc-950/60 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold font-manrope mb-8 tracking-tighter">
              Ready to <span className="text-[#ef233c]">Accelerate?</span>
            </h2>
            <p className="text-xl text-zinc-400 mb-12 font-light">
              Audit your resume, target high-paying engineering roles, and prepare for interviews with precision AI intelligence.
            </p>

            <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] transition-all text-sm"
              />
              <button
                type="submit"
                className="bg-[#ef233c] hover:bg-red-700 text-white font-bold rounded-full px-8 py-3.5 transition-all text-sm uppercase tracking-wider shadow-lg shadow-[#ef233c]/25 shrink-0"
              >
                Join Now
              </button>
            </form>

            {waitlistSubmitted && (
              <p className="mt-4 text-xs text-emerald-400 font-mono">
                ✓ Thank you! You've been prioritized for new Claude 3.5 career models.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* =========================================================================
          RED NOIR FOOTER WITH GIANT WATERMARK TEXT
          ========================================================================= */}
      <footer className="bg-black border-t border-zinc-900 pt-20 pb-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 relative z-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-[#ef233c] rounded-xs rotate-45 shadow-sm shadow-[#ef233c]/50"></div>
              <span className="text-2xl font-bold font-manrope tracking-tight text-white">
                CareerPilot <span className="text-[#ef233c]">AI</span>
              </span>
            </div>
            <p className="text-zinc-500 max-w-sm text-sm leading-relaxed font-light">
              Pioneering intelligent career velocity for developers, data scientists, and engineers through explainable ATS algorithms and official Anthropic Claude AI integration.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6 font-mono">
              Platform Matrix
            </h4>
            <ul className="space-y-3.5 text-zinc-400 text-sm">
              <li><Link to="/resumes" className="hover:text-white transition-colors">100-Point ATS Audit</Link></li>
              <li><Link to="/job-matcher" className="hover:text-white transition-colors">Semantic Job Matcher</Link></li>
              <li><Link to="/roadmap" className="hover:text-white transition-colors">Skill Gap Roadmaps</Link></li>
              <li><Link to="/interviews" className="hover:text-white transition-colors">STAR Mock Interviews</Link></li>
              <li><Link to="/chat" className="hover:text-white transition-colors">AI Career Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6 font-mono">
              Resources & Access
            </h4>
            <ul className="space-y-3.5 text-zinc-400 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Candidate Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Free Registration</Link></li>
            </ul>
          </div>
        </div>

        {/* Huge Red Noir Watermark Text */}
        <div className="flex justify-center items-center py-6 opacity-20 pointer-events-none overflow-hidden">
          <h1 className="text-[14vw] leading-none font-bold font-manrope tracking-tighter text-stroke select-none">
            CAREERPILOT
          </h1>
        </div>

        {/* Sub-Footer */}
        <div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-600 text-xs tracking-wider">
          <p>&copy; 2026 CareerPilot AI Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-mono text-[11px]">
            <span className="text-zinc-500">Claude 3.5 Engine</span>
            <span>·</span>
            <span className="text-zinc-500">FastAPI & SQLite</span>
            <span>·</span>
            <span className="text-zinc-500">Clerk SSO</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
