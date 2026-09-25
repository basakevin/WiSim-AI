import React, { useState } from 'react';
import { ArrowRight, Bot, Check, ChevronDown, Database, FlaskConical, Lightbulb, Rocket, Sparkles, Target, Upload } from 'lucide-react';
import { ProjectContext, ExperimentRun, FeasibilityReport } from '../types';

interface DashboardViewProps {
  currentProject: ProjectContext;
  experiments: ExperimentRun[];
  feasibilityReport: FeasibilityReport | null;
  onNavigate: (tab: string) => void;
  onSelectExperiment: (exp: ExperimentRun) => void;
  isFirstRun?: boolean;
  onStartIdea?: (idea: string, useSample?: boolean) => void;
}

const stages = [
  { id: 'idea', label: 'Idea', tab: 'dashboard', icon: Lightbulb },
  { id: 'plan', label: 'Plan', tab: 'feasibility', icon: Target },
  { id: 'data', label: 'Data', tab: 'dataset_lab', icon: Database },
  { id: 'experiment', label: 'Experiment', tab: 'experiments', icon: FlaskConical },
  { id: 'evaluate', label: 'Evaluate', tab: 'feasibility', icon: Sparkles },
  { id: 'deploy', label: 'Deploy', tab: 'deployment', icon: Rocket },
];

const examples = [
  'Detect crop diseases from smartphone photos',
  'Predict which customers may cancel next month',
  'Forecast energy demand for a small community',
];

export const DashboardView: React.FC<DashboardViewProps> = ({ currentProject, experiments, feasibilityReport, onNavigate, onSelectExperiment, isFirstRun = false, onStartIdea }) => {
  const [idea, setIdea] = useState('');
  const bestExp = [...experiments].sort((a, b) => b.metrics.testAccuracy - a.metrics.testAccuracy)[0];
  const started = !isFirstRun;
  const currentStage = started ? (experiments.length ? (feasibilityReport ? 'evaluate' : 'experiment') : 'data') : 'idea';
  const start = (useSample = false) => {
    const text = useSample ? 'Detect crop diseases from smartphone photos' : idea.trim();
    if (text && onStartIdea) onStartIdea(text, useSample);
  };

  if (isFirstRun) {
    return <div className="mx-auto flex min-h-[calc(100vh-150px)] max-w-3xl items-center justify-center py-10">
      <div className="w-full text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 shadow-[0_0_45px_rgba(34,211,238,0.12)]"><Sparkles className="h-6 w-6" /></div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">Your AI project starts here</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">What AI idea would you like to explore?</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400">Describe your idea. We'll help you turn it into a practical AI project.</p>
        <div className="mx-auto mt-9 max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/80 p-3 shadow-2xl shadow-slate-950/40 focus-within:border-cyan-500/60 focus-within:ring-4 focus-within:ring-cyan-500/10">
          <textarea value={idea} onChange={(event) => setIdea(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') start(); }} rows={3} className="w-full resize-none bg-transparent px-3 py-2 text-left text-base text-slate-100 outline-none placeholder:text-slate-600" placeholder="I want to build an AI system that detects crop diseases from smartphone photos..." aria-label="Describe your AI idea" />
          <div className="flex items-center justify-between gap-3 border-t border-slate-800 px-2 pt-3"><span className="hidden text-xs text-slate-600 sm:inline">Press Ctrl + Enter to continue</span><button type="button" disabled={!idea.trim()} onClick={() => start()} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40">Explore my idea <ArrowRight className="h-4 w-4" /></button></div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">{examples.map((example) => <button key={example} type="button" onClick={() => setIdea(example)} className="rounded-full border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-400 transition hover:border-slate-600 hover:text-slate-200">{example}</button>)}</div>
        <button type="button" onClick={() => start(true)} className="mt-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-cyan-300"><Upload className="h-4 w-4" /> Open the sample project: AI Crop Disease Detection</button>
      </div>
    </div>;
  }

  return <div className="space-y-8 pb-12">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Project workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{currentProject.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{currentProject.description}</p></div><button type="button" onClick={() => onNavigate('copilot')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"><Bot className="h-4 w-4" /> Refine with WiSim AI</button></div>
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-3 sm:grid-cols-6">{stages.map((stage) => { const Icon = stage.icon; const active = stage.id === currentStage; const completed = stages.findIndex((item) => item.id === currentStage) > stages.findIndex((item) => item.id === stage.id); return <button type="button" key={stage.id} onClick={() => onNavigate(stage.tab)} className={`rounded-xl px-2 py-3 text-center transition ${active ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/40' : completed ? 'text-emerald-300 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}><span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-slate-950">{completed ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}</span><span className="mt-2 block text-[11px] font-semibold">{stage.label}</span></button>; })}</div>
    <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><div className="flex items-center gap-2 text-sm font-semibold text-white"><Target className="h-4 w-4 text-cyan-400" /> Your project blueprint</div><p className="mt-2 text-sm leading-6 text-slate-400">WiSim keeps the technical detail available, but starts with the decisions that matter.</p><div className="mt-6 space-y-4">{[['Problem', currentProject.description], ['Recommended approach', feasibilityReport?.problemFraming.baselineModel || 'Start with a measured baseline after profiling your data.'], ['What we need next', experiments.length ? 'Compare the measured runs and understand their limitations.' : 'Choose a sample dataset or upload data to begin a real experiment.']].map(([label, value]) => <div key={label} className="border-b border-slate-800 pb-4 last:border-0 last:pb-0"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-sm leading-6 text-slate-200">{value}</p></div>)}</div><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => onNavigate(experiments.length ? 'feasibility' : 'dataset_lab')} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300">{experiments.length ? 'Continue to Evaluate' : 'Continue to Data'} <ArrowRight className="h-4 w-4" /></button><button type="button" onClick={() => onNavigate('feasibility')} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white">View assumptions</button></div></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-white">What happens next</p><p className="mt-1 text-xs text-slate-500">One clear step at a time</p></div><span className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-semibold text-amber-300">{experiments.length ? 'Review results' : 'Needs your input'}</span></div><div className="mt-6 space-y-3">{[['Data', 'Profile or choose a dataset', 'dataset_lab'], ['Experiment', 'Run a supported model with measured results', 'experiments'], ['Deploy', 'Turn the learnings into a practical checklist', 'deployment']].map(([label, text, tab], index) => <button type="button" key={label} onClick={() => onNavigate(tab)} className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-left transition hover:border-slate-600"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 text-xs font-semibold text-slate-400">{index + 1}</span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-200">{label}</span><span className="block text-xs text-slate-500">{text}</span></span><ArrowRight className="h-4 w-4 text-slate-600" /></button>)}</div></div></section>
    {bestExp && <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-white">Here's what we learned from your experiment</p><p className="mt-1 text-xs text-slate-500">Measured on held-out data, not a projection.</p></div><button type="button" onClick={() => { onSelectExperiment(bestExp); onNavigate('experiments'); }} className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200">Open technical details <ChevronDown className="h-3.5 w-3.5 -rotate-90" /></button></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Held-out accuracy', `${(bestExp.metrics.testAccuracy * 100).toFixed(1)}%`], ['F1 score', `${(bestExp.metrics.f1Score * 100).toFixed(1)}%`], ['Inference latency', `${bestExp.metrics.inferenceLatencyMs} ms`], ['Run status', 'Measured']].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-950/60 p-3"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold text-slate-100">{value}</p></div>)}</div></section>}
  </div>;
};
