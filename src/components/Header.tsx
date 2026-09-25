import React from 'react';
import { BarChart3, BookOpen, Bot, FileText, Settings } from 'lucide-react';
import { ProjectContext } from '../types';
import { WiSimEngineStatus } from '../services/wisimService';
import { WiSimLogo } from './icons/WiSimLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  engineStatus: WiSimEngineStatus | null;
  currentProject: ProjectContext;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  engineStatus,
  currentProject,
  onOpenSettings,
}) => {
  const navTabs = [
    { id: 'dashboard', label: 'Home', icon: BarChart3 },
    { id: 'projects', label: 'My Projects', icon: BookOpen },
    { id: 'copilot', label: 'Playground', icon: Bot },
    { id: 'feasibility', label: 'Reports', icon: FileText },
  ];
  const isConfigured = engineStatus?.inference.isConfigured ?? false;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button type="button" onClick={() => setActiveTab('dashboard')} className="flex min-w-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70" aria-label="Go to WiSim AI home">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 shadow-[0_0_24px_rgba(34,211,238,0.12)]"><WiSimLogo size={24} /></span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-tight text-white sm:text-lg">WiSim AI</span>
            <span className="block truncate text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Simulate. Validate. Build.</span>
          </span>
        </button>

        <div className="hidden min-w-0 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs lg:flex">
          <span className="text-slate-500">Current project</span>
          <span className="max-w-[240px] truncate font-semibold text-slate-200">{currentProject.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenSettings} className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200 sm:flex" aria-label="Open AI connection settings">
            <span className={`h-1.5 w-1.5 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
            {isConfigured ? 'AI connected' : 'Offline-ready'}
          </button>
          <button type="button" onClick={onOpenSettings} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white" title="Connection settings" aria-label="Open connection settings">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto border-t border-slate-900 px-3 py-1.5 sm:px-6" aria-label="Primary navigation">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} aria-current={selected ? 'page' : undefined} className={`relative flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${selected ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}><Icon className={`h-3.5 w-3.5 ${selected ? 'text-cyan-400' : 'text-slate-500'}`} aria-hidden />{tab.label}{selected && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-cyan-400" />}</button>;
        })}
      </nav>
    </header>
  );
};
