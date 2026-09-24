import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Server,
  Lock,
  Cpu,
  Workflow,
  Terminal,
  Database,
  Coins,
  Rocket
} from 'lucide-react';
import { WiSimEngineStatus, fetchWiSimEngineStatus } from '../services/wisimService';
import { WiSimLogo } from './icons/WiSimLogo';

interface EngineStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: WiSimEngineStatus | null;
  onStatusUpdated: (status: WiSimEngineStatus) => void;
}

export const EngineStatusModal: React.FC<EngineStatusModalProps> = ({
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
      const newStatus = await fetchWiSimEngineStatus();
      onStatusUpdated(newStatus);
    } catch (err) {
      console.error('Failed to test WiSim engine status:', err);
    } finally {
      setTesting(false);
    }
  };

  const isConfigured = status?.inference.isConfigured ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 border border-slate-800">
              <WiSimLogo size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">WiSim AI Architecture & System Diagnostics</h3>
              <p className="text-[11px] text-slate-400">Technical Transparency & Subsystem Status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Subsystem Health Grid */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300">Core Subsystems:</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 flex items-center space-x-2">
              <Workflow className="h-4 w-4 text-cyan-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">WiSim Intelligence</div>
                <div className="text-[10px] text-slate-500">Feasibility & Risk Engine</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">WiSim Lab</div>
                <div className="text-[10px] text-slate-500">Real Empirical Experiment Bench</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 flex items-center space-x-2">
              <Database className="h-4 w-4 text-indigo-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">WiSim Data Studio</div>
                <div className="text-[10px] text-slate-500">Feature Matrix & Profiler</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 flex items-center space-x-2">
              <Rocket className="h-4 w-4 text-purple-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">WiSim Deploy</div>
                <div className="text-[10px] text-slate-500">ONNX & FastAPI Planner</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inference Subsystem Status */}
        <div
          className={`rounded-xl border p-4 ${
            isConfigured
              ? 'border-emerald-800/50 bg-emerald-950/30 text-emerald-200'
              : 'border-cyan-800/50 bg-cyan-950/30 text-cyan-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isConfigured ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <Cpu className="h-4 w-4 text-cyan-400" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider">
                {isConfigured ? 'Inference Acceleration: Active' : 'Native WiSim Engine: Operational'}
              </span>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center space-x-1 rounded bg-slate-800/80 px-2.5 py-1 text-[10px] text-slate-300 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${testing ? 'animate-spin' : ''}`} />
              <span>Verify Core</span>
            </button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            {isConfigured
              ? `Connected to accelerated inference subsystem using ${status?.inference.activeModel}. All conversational requests and feasibility evaluations execute server-side.`
              : `Operating in native WiSim Intelligence offline mode. Dataset profiling, empirical experiment execution in WiSim Lab, and compute simulations are fully active.`}
          </p>
        </div>

        {/* Technical Transparency Note */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400">
            <Server className="h-3.5 w-3.5" />
            <span>Technical Transparency & Infrastructure Attributions</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            WiSim AI uses open-weights foundation models (such as Llama 3 by Meta) accelerated via Groq LPU processing clusters for high-speed conversational synthesis and risk extraction. WiSim AI does not claim ownership or direct training of third-party foundation models.
          </p>
          <div className="pt-1 flex items-center space-x-2 text-[11px] text-slate-500">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>Server-side API key isolation enforced. No credentials exposed to client.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-xs">
          <span className="font-mono text-[10px] text-slate-500">WiSim AI v1.2.0 • Independent AI Platform</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
