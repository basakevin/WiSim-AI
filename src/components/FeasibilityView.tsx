import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Database, 
  DollarSign, 
  Rocket, 
  CheckCircle2, 
  Download, 
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { FeasibilityReport, ProjectContext } from '../types';
import { generateStructuredFeasibility } from '../services/groqService';

interface FeasibilityViewProps {
  currentProject: ProjectContext;
  report: FeasibilityReport | null;
  onUpdateReport: (report: FeasibilityReport) => void;
}

export const FeasibilityView: React.FC<FeasibilityViewProps> = ({
  currentProject,
  report,
  onUpdateReport,
}) => {
  const [loading, setLoading] = useState(false);
  const [problemInput, setProblemInput] = useState(currentProject.description);
  const [taskType, setTaskType] = useState(currentProject.taskType);
  const [targetLatency, setTargetLatency] = useState(currentProject.targetLatencyMs);
  const [targetBudget, setTargetBudget] = useState(currentProject.budgetMonthlyUsd);

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
      const result = await generateStructuredFeasibility({
        projectName: currentProject.name,
        problemStatement: problemInput,
        taskType: taskType,
        datasetInfo: {
          size: 5000,
          format: 'tabular',
          hasLabels: true,
        },
        constraints: {
          maxLatencyMs: targetLatency,
          budgetMonthly: targetBudget,
        },
      });
      onUpdateReport(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wisim-feasibility-${currentProject.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls & Formulation Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">
                Structured ML Feasibility Analyzer
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluates algorithmic viability, sample size requirements, compute costs, and deployment feasibility with Groq Llama 3.3.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {report && (
              <button
                onClick={handleExportJSON}
                className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Report JSON</span>
              </button>
            )}
            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing via Groq...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Execute Feasibility Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Problem Formulation & Business Objective
            </label>
            <textarea
              rows={2}
              value={problemInput}
              onChange={(e) => setProblemInput(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              placeholder="Describe what the model should predict, business metrics, and constraints..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Latency (P99)</label>
              <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
                <input
                  type="number"
                  value={targetLatency}
                  onChange={(e) => setTargetLatency(Number(e.target.value))}
                  className="w-full bg-transparent text-xs text-slate-200 focus:outline-none font-mono"
                />
                <span className="text-[11px] text-slate-500 ml-1">ms</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Monthly Budget</label>
              <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
                <span className="text-[11px] text-slate-500 mr-1">$</span>
                <input
                  type="number"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(Number(e.target.value))}
                  className="w-full bg-transparent text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Feasibility Report Output */}
      {report ? (
        <div className="space-y-6">
          {/* Executive Feasibility Gauge & Verdict Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-cyan-800/40 bg-gradient-to-br from-cyan-950/40 to-slate-900 p-5 flex flex-col justify-between">
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Feasibility Index
              </div>
              <div className="my-3 flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-white">
                  {report.feasibilityScore}
                </span>
                <span className="text-sm text-slate-400 font-mono">/ 100</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Composite technical confidence rating across dataset, compute, and serving SLA.
              </div>
            </div>

            <div className="md:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Go / No-Go Verdict
                </span>
                <span className="rounded-full bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-800/60">
                  {report.verdict.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="my-2 text-sm text-slate-200 leading-relaxed font-normal">
                {report.summary}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
                <span className="flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                  Primary Metric: <strong className="ml-1 text-slate-200 font-mono">{report.problemFraming.primaryMetric}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  Baseline: <strong className="text-slate-200 font-mono">{report.problemFraming.baselineModel}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Architectures Grid */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Cpu className="mr-2 h-4 w-4 text-cyan-400" />
                Algorithmic Candidates & Technical Trade-offs
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {report.recommendedArchitectures.length} Models Evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.recommendedArchitectures.map((arch, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{arch.name}</span>
                      <span className="rounded bg-indigo-950/80 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-800/40">
                        {arch.type}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400">
                      <strong>Best For:</strong> {arch.bestFor}
                    </div>

                    {/* Pros */}
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase">Advantages:</span>
                      {arch.pros.slice(0, 2).map((pro, pIdx) => (
                        <div key={pIdx} className="flex items-start text-[11px] text-slate-300">
                          <span className="text-emerald-400 mr-1.5 font-bold">+</span>
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>

                    {/* Cons */}
                    <div className="mt-2 space-y-1">
                      <span className="text-[10px] font-semibold text-amber-400 uppercase">Drawbacks:</span>
                      {arch.cons.slice(0, 2).map((con, cIdx) => (
                        <div key={cIdx} className="flex items-start text-[11px] text-slate-400">
                          <span className="text-amber-400 mr-1.5 font-bold">-</span>
                          <span>{con}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Inference: <strong className="text-cyan-400">{arch.inferenceLatency}</strong></span>
                    <span>Training: <strong className="text-slate-300">{arch.trainingComplexity}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dataset Requirements & Cost Projections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dataset requirements */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Database className="mr-2 h-4 w-4 text-emerald-400" />
                Data Profiling & Sample Size Requirements
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <span className="text-slate-400">Minimum Viable Sample:</span>
                  <div className="mt-1 text-lg font-bold text-white font-mono">
                    {report.datasetRequirements.minSampleSize.toLocaleString()} rows
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <span className="text-slate-400">Optimal Sample Target:</span>
                  <div className="mt-1 text-lg font-bold text-cyan-400 font-mono">
                    {report.datasetRequirements.optimalSampleSize.toLocaleString()} rows
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
                  <strong className="text-slate-200">Class Balance Strategy:</strong>
                  <p className="mt-1 text-slate-400">{report.datasetRequirements.classBalanceAdvice}</p>
                </div>
                <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
                  <strong className="text-slate-200">Augmentation & Synthetic Strategy:</strong>
                  <p className="mt-1 text-slate-400">{report.datasetRequirements.augmentationStrategy}</p>
                </div>
              </div>
            </div>

            {/* Compute Cost Projections */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-purple-400" />
                Hardware Sizing & Cloud Cost Projections
              </h3>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <span className="text-slate-400">Training GPU:</span>
                  <div className="mt-1 font-semibold text-white truncate font-mono">
                    {report.costEstimation.trainingGpu}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <span className="text-slate-400">Est. Training:</span>
                  <div className="mt-1 text-lg font-bold text-cyan-400 font-mono">
                    ${report.costEstimation.estimatedTrainingCostUsd.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500">~{report.costEstimation.estimatedTrainingHours} hrs</span>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <span className="text-slate-400">Monthly Serving:</span>
                  <div className="mt-1 text-lg font-bold text-purple-400 font-mono">
                    ${report.costEstimation.inferenceMonthlyCostUsd.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500">serverless</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3 text-xs text-slate-300">
                <strong className="text-slate-200">Budget Optimization Strategy:</strong>
                <p className="mt-1 text-slate-400 leading-relaxed">
                  {report.costEstimation.budgetOptimizationAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Risk Matrix */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-400" />
              Technical Risk Analysis & Engineering Mitigations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.technicalRisks.map((risk, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{risk.risk}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        risk.severity === 'High'
                          ? 'bg-red-950/80 text-red-400 border border-red-800/40'
                          : risk.severity === 'Medium'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {risk.severity} Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Mitigation: </strong>
                    {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment Roadmap */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Rocket className="mr-2 h-4 w-4 text-cyan-400" />
              Recommended Production Deployment Roadmap
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.deploymentRoadmap.map((step) => (
                <div key={step.step} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      Phase 0{step.step}
                    </span>
                    <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                      {step.framework}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-white">No Feasibility Report Generated Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Click &ldquo;Execute Feasibility Audit&rdquo; to prompt the Groq Llama 3.3 model for structured algorithmic recommendations, data thresholds, and cost projections.
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={loading}
            className="mt-5 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 cursor-pointer"
          >
            Run Feasibility Audit Now
          </button>
        </div>
      )}
    </div>
  );
};
