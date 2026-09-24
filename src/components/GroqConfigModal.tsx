import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Key, 
  Server,
  Lock
} from 'lucide-react';
import { GroqStatus } from '../types';
import { fetchGroqStatus } from '../services/groqService';

interface GroqConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: GroqStatus;
  onStatusUpdated: (status: GroqStatus) => void;
}

export const GroqConfigModal: React.FC<GroqConfigModalProps> = ({
  isOpen,
  onClose,
  status,
  onStatusUpdated,
}) => {
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const newStatus = await fetchGroqStatus();
      onStatusUpdated(newStatus);
    } catch (err) {
      console.error('Failed to test Groq connection:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/40 text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Groq API Architecture & Security</h3>
              <p className="text-[11px] text-slate-400">Official Groq SDK Backend Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Status Box */}
        <div
          className={`rounded-xl border p-4 ${
            status.configured
              ? 'border-emerald-800/50 bg-emerald-950/30 text-emerald-200'
              : 'border-amber-800/50 bg-amber-950/30 text-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {status.configured ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-400" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider">
                {status.configured ? 'Groq API Key Active' : 'Groq API Key Not Detected'}
              </span>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center space-x-1 rounded bg-slate-800/80 px-2 py-1 text-[10px] text-slate-300 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${testing ? 'animate-spin' : ''}`} />
              <span>Re-check Server</span>
            </button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            {status.configured
              ? `Connected to Groq Cloud using ${status.model}. Requests are processed via server-side streaming.`
              : `The application is currently running in offline simulated ML intelligence mode. All core features (dataset lab, empirical ML engine, and planning) remain functional.`}
          </p>
        </div>

        {/* Security Discipline Notice */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400">
            <Lock className="h-3.5 w-3.5" />
            <span>Server-Side Security Enforcement</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            In strict compliance with WiSim AI security policies, API keys are <strong>never</strong> embedded in frontend code, client storage, or browser requests. The key is read exclusively from the server-side environment variable <code className="text-cyan-300 font-mono">GROQ_API_KEY</code>.
          </p>
        </div>

        {/* Configuration Steps */}
        <div className="space-y-2.5 text-xs text-slate-300">
          <span className="font-semibold text-slate-200">How to configure your Groq key:</span>
          
          <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 font-mono text-[11px] space-y-1">
            <div className="text-slate-500"># In your .env file or Cloud Secrets:</div>
            <div className="text-cyan-400">GROQ_API_KEY=&quot;gsk_your_groq_api_key_here&quot;</div>
            <div className="text-indigo-400">GROQ_MODEL=&quot;llama-3.3-70b-versatile&quot;</div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Get API Key from Groq Console</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-[10px] text-slate-500 font-mono">Provider: {status.provider}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
