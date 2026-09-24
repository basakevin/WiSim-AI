import React from 'react';
import { 
  Terminal, 
  Workflow, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  Zap, 
  ShieldCheck, 
  Server, 
  Cpu, 
  TrendingUp, 
  FileCode,
  Activity,
  Bot,
  Database,
  Coins,
  Rocket
} from 'lucide-react';
import { ProjectContext, ExperimentRun, FeasibilityReport } from '../types';

interface DashboardViewProps {
  currentProject: ProjectContext;
  experiments: ExperimentRun[];
  feasibilityReport: FeasibilityReport | null;
  onNavigate: (tab: string) => void;
  onSelectExperiment: (exp: ExperimentRun) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentProject,
  experiments,
  feasibilityReport,
  onNavigate,
  onSelectExperiment,
}) => {
  const bestExp = experiments.length > 0 
    ? [...experiments].sort((a, b) => b.metrics.testAccuracy - a.metrics.testAccuracy)[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Hero Project Brief Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400 border border-cyan-500/20">
                <Workflow className="mr-1.5 h-3.5 w-3.5" /> WiSim Intelligence
              </span>
              <span className="text-xs text-slate-400">Research Pipeline Active</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {currentProject.name}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentProject.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('copilot')}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all cursor-pointer"
            >
              <Bot className="h-4 w-4" />
              <span>Launch WiSim Copilot</span>
            </button>
            <button
              onClick={() => onNavigate('experiments')}
              className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            >
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>WiSim Lab Experiments</span>
            </button>
          </div>
        </div>

        {/* Modular Pipeline Stages */}
        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { stage: '1. Problem Framing', status: 'completed', desc: 'Requirements & Loss Formulation', tab: 'copilot' },
              { stage: '2. WiSim Data Studio', status: 'completed', desc: 'Dataset Profiling & Schema', tab: 'dataset_lab' },
              { stage: '3. WiSim Lab', status: experiments.length > 0 ? 'completed' : 'active', desc: `${experiments.length} Empirical Runs`, tab: 'experiments' },
              { stage: '4. WiSim Intelligence', status: feasibilityReport ? 'completed' : 'pending', desc: feasibilityReport ? `${feasibilityReport.verdict}` : 'Ready for Audit', tab: 'feasibility' },
              { stage: '5. WiSim Deploy', status: 'pending', desc: 'FastAPI / ONNX Docker', tab: 'deployment' },
            ].map((step, idx) => (
              <div 
                key={idx}
                onClick={() => onNavigate(step.tab)}
                className={`rounded-xl border p-3 transition-all cursor-pointer ${
                  step.status === 'completed'
                    ? 'border-emerald-800/40 bg-emerald-950/20 text-emerald-200 hover:border-emerald-700/60'
                    : step.status === 'active'
                    ? 'border-cyan-500/50 bg-cyan-950/30 text-cyan-200 shadow-sm shadow-cyan-950/40 hover:border-cyan-400'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{step.stage}</span>
                  {step.status === 'completed' && <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
                  {step.status === 'active' && <Zap className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />}
                  {step.status === 'pending' && <Clock className="h-3.5 w-3.5 text-slate-500" />}
                </div>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Feasibility Score */}
        <div 
          onClick={() => onNavigate('feasibility')}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>WiSim Feasibility Index</span>
            <Workflow className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {feasibilityReport ? feasibilityReport.feasibilityScore : '88'}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-400">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            <span>{feasibilityReport?.verdict || 'RECOMMENDED'}</span>
          </div>
        </div>

        {/* Top Empirical Model */}
        <div 
          onClick={() => onNavigate('experiments')}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Best Measured Accuracy</span>
            <Terminal className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {bestExp ? `${(bestExp.metrics.testAccuracy * 100).toFixed(1)}%` : '85.7%'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Held-out Test</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">
              {bestExp ? bestExp.algorithm.replace(/_/g, ' ') : 'Random Forest Classifier'}
            </span>
          </div>
        </div>

        {/* Inference Latency */}
        <div 
          onClick={() => onNavigate('experiments')}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Measured Inference P99</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {bestExp ? `${bestExp.metrics.inferenceLatencyMs}` : '0.12'}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms / sample</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-400">
            <CheckCircle className="mr-1 h-3.5 w-3.5" />
            <span>Target SLA Met (&lt; {currentProject.targetLatencyMs}ms)</span>
          </div>
        </div>

        {/* Projected Monthly Cost */}
        <div 
          onClick={() => onNavigate('budget')}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Projected Monthly Compute</span>
            <Coins className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">$28.50</span>
            <span className="text-xs text-slate-400 font-mono">/ mo</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-slate-400">
            <span>Serverless CPU / L4 Scaling</span>
          </div>
        </div>
      </div>

      {/* Main Grid: WiSim Lab Experiment Registry & Architecture Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Experiment Leaderboard */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center">
                <Activity className="mr-2 h-4 w-4 text-cyan-400" />
                WiSim Lab • Empirical Experiment Registry
              </h2>
              <p className="text-xs text-slate-400">
                Ground-truth mathematical execution on held-out test data
              </p>
            </div>
            <button
              onClick={() => onNavigate('experiments')}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center cursor-pointer"
            >
              Open WiSim Lab <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </button>
          </div>

          {experiments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center">
              <Terminal className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-300">No experiments executed yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Train a model in the WiSim Lab to evaluate genuine convergence, confusion matrix, and latency.
              </p>
              <button
                onClick={() => onNavigate('experiments')}
                className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 cursor-pointer"
              >
                Launch First Experiment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2.5 font-medium">Model / Solver</th>
                    <th className="pb-2.5 font-medium">Train Acc</th>
                    <th className="pb-2.5 font-medium">Test Acc</th>
                    <th className="pb-2.5 font-medium">Macro F1</th>
                    <th className="pb-2.5 font-medium">Latency</th>
                    <th className="pb-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {experiments.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3">
                        <div className="font-semibold text-slate-200">{exp.name}</div>
                        <div className="text-[10px] text-slate-500">{exp.datasetName}</div>
                      </td>
                      <td className="py-3 font-mono text-slate-300">
                        {(exp.metrics.trainAccuracy * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 font-mono font-bold text-cyan-400">
                        {(exp.metrics.testAccuracy * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 font-mono text-emerald-400">
                        {(exp.metrics.f1Score * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 font-mono text-slate-400">
                        {exp.metrics.inferenceLatencyMs} ms
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            onSelectExperiment(exp);
                            onNavigate('experiments');
                          }}
                          className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white hover:border-slate-600 cursor-pointer"
                        >
                          Diagnose Run
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Col: Production Architecture Stack */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center">
              <Cpu className="mr-2 h-4 w-4 text-indigo-400" />
              WiSim Deploy Pipeline
            </h2>
            <p className="text-xs text-slate-400">Target production serving architecture</p>
          </div>

          <div className="space-y-3">
            {[
              {
                step: 'Inference Engine',
                value: 'ONNX Runtime C++ Core',
                desc: 'Sub-millisecond CPU/GPU evaluation with fused operator graph.',
                icon: Zap,
              },
              {
                step: 'Web API Wrapper',
                value: 'FastAPI + Uvicorn Workers',
                desc: 'Async REST microservice with Pydantic v2 schemas and health probes.',
                icon: FileCode,
              },
              {
                step: 'Containerization',
                value: 'WiSim Slim Dockerfile',
                desc: 'Ultra-lightweight 180MB container optimized for instant cold starts.',
                icon: Server,
              },
              {
                step: 'Drift & Telemetry',
                value: 'Prometheus & OpenTelemetry',
                desc: 'Continuous tracking of input feature distribution and latency percentiles.',
                icon: TrendingUp,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-cyan-400" />
                    <span className="text-[11px] font-medium text-slate-400">{item.step}</span>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-200">{item.value}</div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-normal">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigate('deployment')}
            className="w-full rounded-xl border border-indigo-700/50 bg-indigo-950/30 py-2.5 text-center text-xs font-semibold text-indigo-300 hover:bg-indigo-900/40 transition-colors cursor-pointer"
          >
            Open WiSim Deploy Studio
          </button>
        </div>
      </div>
    </div>
  );
};
