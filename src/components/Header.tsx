import React from 'react';
import { 
  Cpu, 
  Sparkles, 
  Layers, 
  Terminal, 
  BarChart2, 
  Database, 
  DollarSign, 
  Rocket, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Settings
} from 'lucide-react';
import { GroqStatus, ProjectContext } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  groqStatus: GroqStatus;
  currentProject: ProjectContext;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  groqStatus,
  currentProject,
  onOpenSettings,
}) => {
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles, badge: 'Groq' },
    { id: 'feasibility', label: 'Feasibility Analyzer', icon: Layers },
    { id: 'dataset_lab', label: 'Dataset Lab', icon: Database },
    { id: 'experiments', label: 'Experiment Playground', icon: Terminal, badge: 'Real ML' },
    { id: 'budget', label: 'Budget & GPU', icon: DollarSign },
    { id: 'deployment', label: 'Deployment Studio', icon: Rocket },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      {/* Top Banner & Groq Status Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Cpu className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">WiSim AI</span>
              <span className="rounded-full bg-cyan-950/80 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/50">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              From Idea to Deployment <span className="text-slate-600">•</span> ML Research & Feasibility
            </p>
          </div>
        </div>

        {/* Center: Active Project Indicator */}
        <div className="hidden lg:flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
          <span className="text-slate-500">Project:</span>
          <span className="font-semibold text-slate-200">{currentProject.name}</span>
          <span className="rounded bg-indigo-950/80 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-800/40">
            {currentProject.taskType}
          </span>
        </div>

        {/* Right: Groq API status & Settings */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSettings}
            className={`flex items-center space-x-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              groqStatus.configured
                ? 'border-emerald-800/60 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40'
                : 'border-amber-800/60 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40'
            }`}
            title="Groq API Integration Status"
          >
            {groqStatus.configured ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
            )}
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-[11px]">
                {groqStatus.configured ? 'Groq Active' : 'Groq Standby'}
              </span>
              <span className="text-slate-500">|</span>
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
                {groqStatus.model}
              </span>
            </div>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="API & System Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6 scrollbar-none border-t border-slate-900">
        <nav className="flex space-x-1 py-1.5">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-300 shadow-sm shadow-cyan-950/50'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 rounded px-1.5 py-0.2 text-[9px] font-semibold ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
