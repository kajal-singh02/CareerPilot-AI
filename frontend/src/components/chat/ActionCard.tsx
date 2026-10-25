import React, { useState } from 'react';
import { api } from '../../services/api';
import { ChatActionPayload } from '../../types';
import { CheckCircle, XCircle, ArrowRight, Loader2, Bookmark, MapPin, Briefcase } from 'lucide-react';

interface ActionCardProps {
  action: ChatActionPayload;
  onActionComplete: (resultMsg: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, onActionComplete }) => {
  const [status, setStatus] = useState<'pending' | 'executing' | 'executed' | 'cancelled'>('pending');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (confirmed: boolean) => {
    setStatus('executing');
    setError(null);
    try {
      const res = await api.confirmToolAction(action.action_id, confirmed);
      if (confirmed && res.success) {
        setStatus('executed');
        onActionComplete(res.message);
      } else {
        setStatus('cancelled');
        onActionComplete('Action was cancelled by user.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute action.');
      setStatus('pending');
    }
  };

  const getIcon = () => {
    if (action.action_type === 'save_job') return <Bookmark className="w-4 h-4 text-[#ef233c]" />;
    if (action.action_type === 'create_learning_roadmap') return <MapPin className="w-4 h-4 text-[#ef233c]" />;
    return <Briefcase className="w-4 h-4 text-[#ef233c]" />;
  };

  return (
    <div className="mt-3 p-4 rounded-xl border border-white/10 bg-black/60 shadow-lg">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-lg bg-[#ef233c]/15 border border-[#ef233c]/30 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ef233c]/20 text-[#ef233c] border border-[#ef233c]/30">
              Proposal · Approval Required
            </span>
          </div>

          <p className="text-xs font-semibold text-white leading-snug font-manrope">
            {action.description}
          </p>

          <p className="text-[11px] text-zinc-400 font-light">
            Claude requested permission to modify your candidate records. This will not execute without your approval.
          </p>

          {error && (
            <p className="text-[11px] text-rose-400 font-medium pt-1 font-mono">
              {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-2">
            {status === 'pending' && (
              <>
                <button
                  type="button"
                  onClick={() => handleConfirm(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#ef233c] hover:bg-[#d90429] text-white font-semibold text-xs transition shadow-md shadow-[#ef233c]/20 flex items-center space-x-1.5 font-mono"
                >
                  <span>Confirm & Execute</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition font-mono border border-white/10"
                >
                  Cancel
                </button>
              </>
            )}

            {status === 'executing' && (
              <div className="flex items-center space-x-2 text-xs text-[#ef233c] font-medium font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing server operation...</span>
              </div>
            )}

            {status === 'executed' && (
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-md font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Action Executed Successfully</span>
              </div>
            )}

            {status === 'cancelled' && (
              <div className="flex items-center space-x-1.5 text-xs text-zinc-400 font-medium bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-md font-mono">
                <XCircle className="w-3.5 h-3.5" />
                <span>Proposal Cancelled</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
