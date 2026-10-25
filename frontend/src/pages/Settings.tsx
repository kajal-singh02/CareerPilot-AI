import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [preferredRole, setPreferredRole] = useState(user?.profile?.preferred_role || '');
  const [degree, setDegree] = useState(user?.profile?.degree || '');
  const [graduationYear, setGraduationYear] = useState<number | ''>(user?.profile?.graduation_year || '');
  const [yearsExperience, setYearsExperience] = useState<number>(user?.profile?.years_of_experience || 0);
  const [preferredLocation, setPreferredLocation] = useState(user?.profile?.preferred_location || 'Remote');
  const [workMode, setWorkMode] = useState(user?.profile?.work_mode || 'remote');
  const [targetIndustry, setTargetIndustry] = useState(user?.profile?.target_industry || '');
  const [skillsStr, setSkillsStr] = useState(user?.profile?.existing_skills?.join(', ') || '');
  const [careerGoals, setCareerGoals] = useState(user?.profile?.career_goals || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setPreferredRole(user.profile.preferred_role || '');
      setDegree(user.profile.degree || '');
      setGraduationYear(user.profile.graduation_year || '');
      setYearsExperience(user.profile.years_of_experience || 0);
      setPreferredLocation(user.profile.preferred_location || 'Remote');
      setWorkMode(user.profile.work_mode || 'remote');
      setTargetIndustry(user.profile.target_industry || '');
      setSkillsStr(user.profile.existing_skills?.join(', ') || '');
      setCareerGoals(user.profile.career_goals || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const skillsArray = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.updateProfile({
        preferred_role: preferredRole,
        degree: degree || undefined,
        graduation_year: graduationYear ? Number(graduationYear) : undefined,
        years_of_experience: Number(yearsExperience),
        preferred_location: preferredLocation,
        work_mode: workMode,
        target_industry: targetIndustry || undefined,
        existing_skills: skillsArray,
        career_goals: careerGoals || undefined,
      });

      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-extrabold font-manrope text-white tracking-tight">
          Profile & Career Settings
        </h2>
        <p className="text-sm text-zinc-300 font-normal mt-1">
          Customize your career targets, verified skills, and job preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      {/* Account Info Pill */}
      <Card className="flex items-center justify-between p-4 bg-[#0e0e12]/95 border-white/15 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#ef233c] text-white font-bold flex items-center justify-center font-manrope shadow-md shadow-[#ef233c]/30">
            {user?.full_name?.substring(0, 2).toUpperCase() || 'CP'}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white font-manrope">{user?.full_name}</h4>
            <p className="text-xs text-zinc-400 font-mono">{user?.email}</p>
          </div>
        </div>
        <Badge variant="brand">Active Account</Badge>
      </Card>

      {/* Profile Form */}
      <Card className="bg-[#0e0e12]/95 border-white/15 shadow-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                required
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                Work Mode Preference
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none capitalize"
              >
                <option value="remote" className="bg-zinc-900 text-white">Remote</option>
                <option value="hybrid" className="bg-zinc-900 text-white">Hybrid</option>
                <option value="onsite" className="bg-zinc-900 text-white">Onsite</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                Degree & Major
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                Graduation Year
              </label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder="e.g. 2024"
                className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                step="0.5"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 2.0"
                className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
              Verified Skills (Comma Separated)
            </label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="e.g. React, Python, TypeScript, Docker, PostgreSQL, AWS"
              className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
              Career Aspirations / Goals
            </label>
            <textarea
              rows={3}
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              placeholder="Outline what kind of problems you want to solve, desired company culture, and seniority targets..."
              className="w-full text-sm bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl p-2.5 focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
            ></textarea>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" isLoading={saving} className="font-semibold shadow-md shadow-[#ef233c]/30">
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
