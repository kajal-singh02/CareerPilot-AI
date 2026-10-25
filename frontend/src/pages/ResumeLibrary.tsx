import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Resume } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Target,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const ResumeLibrary: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<{ filename: string; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const loadResumes = async () => {
    try {
      setLoading(true);
      const list = await api.listResumes();
      setResumes(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const uploaded = await api.uploadResume(file);
      await loadResumes();
      // Navigate to analysis directly
      navigate(`/resumes/${uploaded.id}/analysis`);
    } catch (err: any) {
      setError(err.message || 'Error processing resume file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.deleteResume(id);
      setResumes(resumes.filter((r) => r.id !== id));
      if (selectedText) setSelectedText(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete resume');
    }
  };

  const handleInspectText = async (id: number, filename: string) => {
    try {
      const data = await api.getResume(id);
      setSelectedText({ filename, text: data.raw_text });
    } catch (err: any) {
      alert(err.message || 'Failed to retrieve resume text');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-manrope text-white tracking-tight">
            Resume Library
          </h2>
          <p className="text-sm text-zinc-300 font-normal mt-1">
            Upload and audit your resumes using Claude 3.5 ATS scoring and XYZ bullet optimization.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
          />
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
            className="shadow-md shadow-[#ef233c]/30 font-semibold"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Resume</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-2 font-mono">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Dropzone Banner */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-white/20 hover:border-[#ef233c]/70 hover:bg-[#ef233c]/5 rounded-2xl cursor-pointer text-center transition bg-black/50 backdrop-blur-md"
      >
        <Upload className="w-10 h-10 text-[#ef233c] mx-auto mb-3" />
        <h3 className="font-manrope font-bold text-base text-white">
          Click to upload your resume (PDF or DOCX)
        </h3>
        <p className="text-xs text-zinc-300 mt-1 font-normal">
          Max file size 10MB. Text is securely extracted and analyzed on the backend.
        </p>
      </div>

      {/* Resumes List */}
      <div>
        <h3 className="font-manrope font-bold text-lg text-white mb-3">
          Your Resumes ({resumes.length})
        </h3>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#ef233c] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : resumes.length === 0 ? (
          <Card className="text-center py-12 bg-[#0e0e12]/95 border-white/15">
            <FileText className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
            <p className="font-bold text-white text-base">No resumes uploaded yet</p>
            <p className="text-xs text-zinc-300 mt-1">Upload your first resume above to get an instant ATS score.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((r) => (
              <Card key={r.id} className="flex flex-col justify-between bg-[#0e0e12]/95 border-white/15 hover:border-white/30 transition shadow-2xl">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 flex items-center justify-center font-bold text-xs shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-white font-manrope truncate" title={r.filename}>
                          {r.filename}
                        </h4>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">
                          {(r.file_size / 1024).toFixed(1)} KB · Uploaded {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 text-zinc-500 hover:text-[#ef233c] hover:bg-[#ef233c]/10 rounded-lg transition"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleInspectText(r.id, r.filename)}
                    className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center space-x-1 font-mono transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Text</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <Link to={`/job-matcher?resumeId=${r.id}`}>
                      <Button variant="outline" size="sm" className="border-white/20 text-zinc-200 hover:text-white hover:bg-white/10">
                        <Target className="w-3.5 h-3.5" />
                        <span>Match JD</span>
                      </Button>
                    </Link>
                    <Link to={`/resumes/${r.id}/analysis`}>
                      <Button variant="primary" size="sm" className="shadow-md shadow-[#ef233c]/30 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Audit Report</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Raw Extracted Text Modal */}
      {selectedText && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold font-manrope text-white text-sm">
                Extracted Text: {selectedText.filename}
              </h3>
              <button
                onClick={() => setSelectedText(null)}
                className="text-zinc-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed bg-black/60">
              {selectedText.text}
            </div>
            <div className="p-3 border-t border-white/10 text-right">
              <Button variant="secondary" size="sm" onClick={() => setSelectedText(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
