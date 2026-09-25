import React, { useState } from 'react';
import { 
  Database, 
  BarChart2, 
  Search, 
  ArrowRight,
  Table,
  SlidersHorizontal,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Dataset } from '../types';
import { calculateFeatureStats } from '../utils/datasets';

interface DatasetLabViewProps {
  datasets: Dataset[];
  selectedDataset: Dataset;
  onSelectDataset: (dataset: Dataset) => void;
  trainRatio: number;
  onTrainRatioChange: (ratio: number) => void;
  normalize: boolean;
  onToggleNormalize: () => void;
  onNavigateToExperiments: () => void;
}

export const DatasetLabView: React.FC<DatasetLabViewProps> = ({
  datasets,
  selectedDataset,
  onSelectDataset,
  trainRatio,
  onTrainRatioChange,
  normalize,
  onToggleNormalize,
  onNavigateToExperiments,
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string>(
    selectedDataset.features[0]?.name || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const currentStats = selectedFeature
    ? calculateFeatureStats(selectedDataset, selectedFeature)
    : null;

  // Filtered rows
  const filteredData = selectedDataset.data.filter((row) => {
    if (!searchQuery) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const targetCol = selectedDataset.targetColumn;
  const posCount = selectedDataset.data.filter((r) => Number(r[targetCol]) === 1).length;
  const negCount = selectedDataset.data.length - posCount;
  const posRatio = ((posCount / selectedDataset.data.length) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Header & Dataset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">WiSim Data Studio</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real benchmark datasets with live statistical profiles, feature distributions, and preprocessing controls.
          </p>
        </div>

        {/* Dataset selector pills */}
        <div className="flex flex-wrap gap-2">
          {datasets.map((ds) => (
            <button
              key={ds.id}
              onClick={() => {
                onSelectDataset(ds);
                setSelectedFeature(ds.features[0]?.name || '');
                setPage(1);
              }}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                selectedDataset.id === ds.id
                  ? 'border border-cyan-500/80 bg-cyan-950/60 text-cyan-300 shadow-md shadow-cyan-950/50'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {ds.name}
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3" aria-label="Dataset starting choices">
        {[
          { title: 'Upload my dataset', detail: 'Bring a CSV and we will check its shape, missing values, and labels.', icon: FileSpreadsheet, action: 'Upload is coming next' },
          { title: 'Use a sample dataset', detail: 'Start immediately with a verified benchmark dataset.', icon: Database, action: 'Use this dataset' },
          { title: "I don't have data yet", detail: 'Learn what data your idea needs and how to collect it responsibly.', icon: CheckCircle, action: 'See data guidance' },
        ].map((choice) => {
          const Icon = choice.icon;
          return (
            <button key={choice.title} type="button" onClick={() => choice.title === 'Use a sample dataset' ? onNavigateToExperiments() : undefined} className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-left transition hover:border-cyan-500/50 hover:bg-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"><Icon className="h-4 w-4" /></span>
              <span className="mt-4 block text-sm font-semibold text-white">{choice.title}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{choice.detail}</span>
              <span className="mt-3 block text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">{choice.action} →</span>
            </button>
          );
        })}
      </section>

      {/* Dataset Summary Cards & Preprocessing Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sample Count */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">Verified Samples</span>
          <div className="mt-1 text-2xl font-extrabold text-white font-mono">
            {selectedDataset.sampleCount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">{selectedDataset.features.length} feature dimensions</span>
        </div>

        {/* Target Balance */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs text-slate-400 font-medium">Class Balance ({targetCol})</span>
          <div className="mt-1 text-2xl font-extrabold text-cyan-400 font-mono">
            {posRatio}% <span className="text-xs font-normal text-slate-400">Positive</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {posCount} Pos / {negCount} Neg
          </span>
        </div>

        {/* Train/Test Split Slider */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Train/Test Partition</span>
            <span className="font-mono text-cyan-400 font-bold">
              {Math.round((1 - trainRatio) * 100)} / {Math.round(trainRatio * 100)}
            </span>
          </div>
          <input
            type="range"
            min="0.15"
            max="0.40"
            step="0.05"
            value={trainRatio}
            onChange={(e) => onTrainRatioChange(Number(e.target.value))}
            className="mt-3 w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>85/15</span>
            <span>80/20</span>
            <span>75/25</span>
            <span>60/40</span>
          </div>
        </div>

        {/* Preprocessing Actions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Z-Score Normalization</span>
            <button
              onClick={onToggleNormalize}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                normalize ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  normalize ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <button
            onClick={onNavigateToExperiments}
            className="mt-2 flex items-center justify-center space-x-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 cursor-pointer"
          >
            <span>Load in WiSim Lab</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Feature Profiler & Histogram Distribution Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Feature Stats Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center">
            <Table className="mr-2 h-4 w-4 text-cyan-400" />
            Feature Matrix Profile & Statistical Summary
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-2.5 font-medium">Feature</th>
                  <th className="pb-2.5 font-medium">Type</th>
                  <th className="pb-2.5 font-medium">Min</th>
                  <th className="pb-2.5 font-medium">Max</th>
                  <th className="pb-2.5 font-medium">Mean (μ)</th>
                  <th className="pb-2.5 font-medium">Std (σ)</th>
                  <th className="pb-2.5 font-medium text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {selectedDataset.features.map((feat) => {
                  const isSelected = selectedFeature === feat.name;
                  return (
                    <tr
                      key={feat.name}
                      onClick={() => setSelectedFeature(feat.name)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-950/40 text-cyan-200'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 font-sans font-semibold">
                        {feat.name}
                        {feat.name === targetCol && (
                          <span className="ml-1.5 rounded bg-indigo-900/80 px-1 py-0.2 text-[9px] text-indigo-300">
                            TARGET
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-400">{feat.type}</td>
                      <td className="py-2.5">{feat.min ?? '0'}</td>
                      <td className="py-2.5">{feat.max ?? '1'}</td>
                      <td className="py-2.5 text-cyan-400">{feat.mean?.toFixed(2) ?? '-'}</td>
                      <td className="py-2.5 text-slate-400">{feat.std?.toFixed(2) ?? '-'}</td>
                      <td className="py-2.5 text-right font-sans">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'text-slate-500'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Inspect'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Interactive Distribution Histogram */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center">
              <BarChart2 className="mr-2 h-4 w-4 text-cyan-400" />
              Distribution Histogram
            </h3>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400">
              {selectedFeature}
            </span>
          </div>

          {currentStats && currentStats.bins ? (
            <div className="space-y-4">
              <div className="space-y-2 pt-2">
                {currentStats.bins.map((bin, idx) => {
                  const maxCount = Math.max(...(currentStats.bins?.map((b) => b.count) || [1]));
                  const pct = Math.round((bin.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>{bin.range}</span>
                        <span>{bin.count} ({Math.round((bin.count / selectedDataset.sampleCount) * 100)}%)</span>
                      </div>
                      <div className="h-3 w-full rounded bg-slate-950/80 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3 text-[11px] font-mono text-slate-300">
                <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
                  <span className="text-slate-500">Min:</span> {currentStats.min.toFixed(2)}
                </div>
                <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
                  <span className="text-slate-500">Max:</span> {currentStats.max.toFixed(2)}
                </div>
                <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
                  <span className="text-slate-500">Mean:</span> {currentStats.mean.toFixed(2)}
                </div>
                <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
                  <span className="text-slate-500">Std Dev:</span> {currentStats.std.toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Select a feature to view distribution</p>
          )}
        </div>
      </div>

      {/* Raw Data Table Explorer with Search */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center">
              <FileSpreadsheet className="mr-2 h-4 w-4 text-cyan-400" />
              Raw Data Explorer
            </h3>
            <p className="text-xs text-slate-400">
              Showing {filteredData.length} records in {selectedDataset.name}
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-800 bg-slate-950/80 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                {selectedDataset.features.map((f) => (
                  <th key={f.name} className="p-2.5 font-medium whitespace-nowrap">
                    {f.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {paginatedData.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                  {selectedDataset.features.map((f) => (
                    <td key={f.name} className="p-2.5 whitespace-nowrap text-slate-300">
                      {String(row[f.name])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 disabled:opacity-40 cursor-pointer hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 disabled:opacity-40 cursor-pointer hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
