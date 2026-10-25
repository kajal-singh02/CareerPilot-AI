import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { JobApplication } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Plus,
  Trash2,
  Briefcase
} from 'lucide-react';

const STATUSES: Array<JobApplication['status']> = [
  'interested', 'saved', 'applied', 'assessment', 'interview', 'offer', 'rejected', 'withdrawn'
];

export const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New Application Form
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newStatus, setNewStatus] = useState<JobApplication['status']>('applied');
  const [newNotes, setNewNotes] = useState('');
  const [newSalary, setNewSalary] = useState('');

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.listApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createApplication({
        job_title: newTitle,
        company: newCompany,
        status: newStatus,
        notes: newNotes || undefined,
        salary_offered: newSalary || undefined,
      });
      setApplications([created, ...applications]);
      setShowAddModal(false);
      setNewTitle('');
      setNewCompany('');
      setNewNotes('');
      setNewSalary('');
    } catch (err: any) {
      alert(err.message || 'Failed to create application');
    }
  };

  const handleStatusChange = async (appId: number, status: JobApplication['status']) => {
    try {
      const updated = await api.updateApplication(appId, { status });
      setApplications(applications.map((a) => (a.id === appId ? updated : a)));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (appId: number) => {
    if (!window.confirm('Delete this application record?')) return;
    try {
      await api.deleteApplication(appId);
      setApplications(applications.filter((a) => a.id !== appId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete application');
    }
  };

  const filteredApps = filterStatus === 'all'
    ? applications
    : applications.filter((a) => a.status === filterStatus);

  const countByStatus = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-manrope text-white tracking-tight">
            Job Application Pipeline Tracker
          </h2>
          <p className="text-sm text-zinc-300 font-normal mt-1">
            Track interview dates, compensation offers, and recruiter correspondence in one organized board.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowAddModal(true)} className="font-semibold shadow-md shadow-[#ef233c]/30">
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </Button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Card className="p-4 bg-[#0e0e12]/95 border-white/15 shadow-xl">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">Total Active</span>
          <span className="text-2xl font-extrabold text-white font-manrope">{applications.length}</span>
        </Card>
        <Card className="p-4 bg-[#0e0e12]/95 border-white/15 shadow-xl">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">Interviews</span>
          <span className="text-2xl font-extrabold text-[#ef233c] font-manrope">{countByStatus['interview'] || 0}</span>
        </Card>
        <Card className="p-4 bg-[#0e0e12]/95 border-white/15 shadow-xl">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">Offers</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-manrope">{countByStatus['offer'] || 0}</span>
        </Card>
        <Card className="p-4 bg-[#0e0e12]/95 border-white/15 shadow-xl">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">Assessments</span>
          <span className="text-2xl font-extrabold text-amber-400 font-manrope">{countByStatus['assessment'] || 0}</span>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition ${
            filterStatus === 'all'
              ? 'bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/30'
              : 'bg-black/40 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All ({applications.length})
        </button>
        {STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-mono font-semibold capitalize transition ${
              filterStatus === st
                ? 'bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/30'
                : 'bg-black/40 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {st} ({countByStatus[st] || 0})
          </button>
        ))}
      </div>

      {/* Applications Table / Board */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#ef233c] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-500">
            <Briefcase className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="font-semibold text-white">No applications found</p>
            <p className="text-zinc-500 mt-0.5 font-light">Click "Add Application" above to track your first job.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/10 text-zinc-400 font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-sm text-white font-manrope">{app.job_title}</p>
                      <p className="text-zinc-400 text-[11px] font-mono">{app.company}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                        className="text-xs font-semibold rounded-lg border border-white/10 py-1 px-2 capitalize focus:ring-1 focus:ring-[#ef233c] bg-zinc-900 text-white font-mono"
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 font-mono">
                      {new Date(app.application_date).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 max-w-xs truncate">
                      {app.notes || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-1.5 text-zinc-500 hover:text-[#ef233c] hover:bg-[#ef233c]/10 rounded-lg transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-manrope font-bold text-base text-white">
                Track New Job Application
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Frontend Software Engineer"
                  className="w-full text-sm border border-zinc-800 rounded-lg p-2.5 bg-zinc-900 text-white focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                  Company
                </label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Datadog"
                  className="w-full text-sm border border-zinc-800 rounded-lg p-2.5 bg-zinc-900 text-white focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                  Initial Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full text-sm border border-zinc-800 rounded-lg p-2.5 bg-zinc-900 text-white focus:ring-2 focus:ring-[#ef233c] focus:outline-none capitalize font-mono"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                  Notes / Salary Details
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Recruiter reachout on LinkedIn, interview on Friday..."
                  className="w-full text-sm border border-zinc-800 rounded-lg p-2.5 bg-zinc-900 text-white focus:ring-2 focus:ring-[#ef233c] focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
