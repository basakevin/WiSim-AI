import React, { useState } from 'react';
import { 
  Terminal, 
  Sparkles, 
  Play, 
  Activity, 
  CheckCircle2, 
  Zap, 
  Brain, 
  Layers, 
  Sliders,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  GitCompare,
  Copy,
  Check,
  Network,
  Binary,
  Crosshair,
  Info
} from 'lucide-react';
import { Dataset, ExperimentRun } from '../types';
import { executeExperiment, TrainingConfig } from '../utils/mlEngine';
import { interpretExperimentWithWiSim } from '../services/wisimService';

interface ExperimentPlaygroundViewProps {
  dataset: Dataset;
  experiments: ExperimentRun[];
  onAddExperiment: (exp: ExperimentRun) => void;
  activeExperiment: ExperimentRun | null;
  onSelectExperiment: (exp: ExperimentRun) => void;
}

export const ExperimentPlaygroundView: React.FC<ExperimentPlaygroundViewProps> = ({
  dataset,
  experiments,
  onAddExperiment,
  activeExperiment,
  onSelectExperiment,
}) => {
  const [algorithm, setAlgorithm] = useState<TrainingConfig['algorithm']>('mlp_neural_network');
  const [learningRate, setLearningRate] = useState(0.04);
  const [epochs, setEpochs] = useState(60);
  const [l2Reg, setL2Reg] = useState(0.01);
  const [hiddenUnits, setHiddenUnits] = useState(16);
  const [treeDepth, setTreeDepth] = useState(4);
  const [kNeighbors, setKNeighbors] = useState(5);
  const [advancedMode, setAdvancedMode] = useState(false);
  
  const [isTraining, setIsTraining] = useState(false);
  const [interpreting, setInterpreting] = useState(false);
  const [interpretationText, setInterpretationText] = useState<string | null>(
    activeExperiment?.groqInterpretation || null
  );
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (activeExperiment) {
      setInterpretationText(activeExperiment.groqInterpretation || null);
    }
  }, [activeExperiment]);

  const handleRunTraining = async () => {
    setIsTraining(true);
    setInterpretationText(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const newRun = await executeExperiment(dataset, {
        algorithm,
        learningRate,
        epochs,
        l2Regularization: l2Reg,
        hiddenUnits,
        treeDepth,
        kNeighbors,
        testRatio: 0.25,
      });

      onAddExperiment(newRun);
      onSelectExperiment(newRun);
    } catch (err) {
      console.error('Training failed:', err);
    } finally {
      setIsTraining(false);
    }
  };

  const handleInterpretWithWiSim = async () => {
    if (!activeExperiment) return;
    setInterpreting(true);

    try {
      const res = await interpretExperimentWithWiSim(activeExperiment);
      setInterpretationText(res.analysis);
      activeExperiment.groqInterpretation = res.analysis;
    } catch (err: any) {
      setInterpretationText(`Interpretation error: ${err.message || 'Failed to interpret'}`);
    } finally {
      setInterpreting(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeExperiment) return;
    const pyCode = `# =======================================================
# WiSim AI Exported Architecture
# Dataset: ${activeExperiment.datasetName}
# Algorithm: ${activeExperiment.algorithm}
# =======================================================

import torch
import torch.nn as nn
import torch.optim as optim

class WiSimModel(nn.Module):
    def __init__(self, in_features, hidden_dim=${hiddenUnits}, out_features=1):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, hidden_dim),
            nn.ReLU(),
            nn.Dropout(p=0.1),
            nn.Linear(hidden_dim, 8),
            nn.ReLU(),
            nn.Linear(8, out_features),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x)

model = WiSimModel(in_features=8)
optimizer = optim.AdamW(model.parameters(), lr=${learningRate}, weight_decay=${l2Reg})
criterion = nn.BCELoss()
`;
    navigator.clipboard.writeText(pyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentMetrics = activeExperiment?.metrics;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">
              WiSim Lab • Empirical Experiment Bench
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Genuine mathematical model fitting on held-out test partitions. All evaluation metrics are measured directly from execution.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunTraining}
            disabled={isTraining}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isTraining ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Executing Mathematical Fit...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Execute Real Training</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workbench: Config Column (Left) vs Results & WiSim Diagnosis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Algorithm & Hyperparameters */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Brain className="mr-2 h-4 w-4 text-cyan-400" />
              Model Architecture & Solvers
            </h3>

            {/* Architecture picker */}
            <div className="space-y-2">
              {[
                {
                  id: 'mlp_neural_network',
                  name: 'Multilayer Perceptron (MLP)',
                  desc: 'Deep feedforward neural net with ReLU activations & backpropagation gradient descent.',
                  tag: 'Neural Net',
                  icon: Network,
                },
                {
                  id: 'logistic_regression',
                  name: 'Regularized Logistic Classifier',
                  desc: 'Linear model with Sigmoid link function, L2 penalty & Cross-Entropy optimization.',
                  tag: 'Linear',
                  icon: TrendingUp,
                },
                {
                  id: 'random_forest',
                  name: 'Random Forest Ensemble',
                  desc: 'Bagged decision trees with recursive Gini impurity splitting.',
                  tag: 'Ensemble',
                  icon: Binary,
                },
                {
                  id: 'knn',
                  name: 'k-Nearest Neighbors (KNN)',
                  desc: 'Non-parametric lazy learner with pairwise Euclidean distance metric.',
                  tag: 'Instance',
                  icon: Crosshair,
                },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = algorithm === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setAlgorithm(m.id as any)}
                    className={`rounded-xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500/80 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-950/40'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold text-white">{m.name}</span>
                      </div>
                      <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-mono text-cyan-400">
                        {m.tag}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-normal pl-6">{m.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800/80 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-300">How much control do you want?</p>
                  <p className="mt-1 text-[11px] text-slate-500">WiSim recommends the defaults for a first run.</p>
                </div>
                <button type="button" onClick={() => setAdvancedMode((value) => !value)} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300">{advancedMode ? 'Beginner mode' : 'Advanced mode'}</button>
              </div>
            </div>

            {/* Hyperparameter Controls */}
            {advancedMode && <div className="border-t border-slate-800/80 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center">
                  <Sliders className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
                  Hyperparameter Tuning
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Dataset: {dataset.name}</span>
              </div>

              {/* Learning Rate (MLP, Logistic) */}
              {(algorithm === 'mlp_neural_network' || algorithm === 'logistic_regression') && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Learning Rate (η)</span>
                    <span className="font-mono text-cyan-400">{learningRate}</span>
                  </div>
                  <input
                    type="range"
                    min="0.005"
                    max="0.15"
                    step="0.005"
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}

              {/* Epochs */}
              {(algorithm === 'mlp_neural_network' || algorithm === 'logistic_regression') && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Training Epochs</span>
                    <span className="font-mono text-cyan-400">{epochs}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    step="10"
                    value={epochs}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}

              {/* L2 Regularization */}
              {(algorithm === 'mlp_neural_network' || algorithm === 'logistic_regression') && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>L2 Regularization (Weight Decay)</span>
                    <span className="font-mono text-cyan-400">{l2Reg}</span>
                  </div>
                  <input
                    type="range"
                    min="0.001"
                    max="0.05"
                    step="0.005"
                    value={l2Reg}
                    onChange={(e) => setL2Reg(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}

              {/* Hidden Units (MLP) */}
              {algorithm === 'mlp_neural_network' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Hidden Layer Width</span>
                    <span className="font-mono text-cyan-400">{hiddenUnits} units</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    step="4"
                    value={hiddenUnits}
                    onChange={(e) => setHiddenUnits(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}

              {/* Tree Depth */}
              {algorithm === 'random_forest' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Max Tree Depth</span>
                    <span className="font-mono text-cyan-400">{treeDepth}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="1"
                    value={treeDepth}
                    onChange={(e) => setTreeDepth(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}

              {/* k-Neighbors */}
              {algorithm === 'knn' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>k Neighbors</span>
                    <span className="font-mono text-cyan-400">{kNeighbors}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="2"
                    value={kNeighbors}
                    onChange={(e) => setKNeighbors(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}
            </div>}
          </div>
        </div>

        {/* Right 2 Columns: Measured Metrics, Real Charts, & WiSim Diagnosis */}
        <div className="lg:col-span-2 space-y-6">
          {activeExperiment && currentMetrics ? (
            <>
              {/* Empirical Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                  <span className="text-[11px] text-slate-400 font-medium">Test Accuracy</span>
                  <div className="mt-1 text-2xl font-black text-cyan-400 font-mono">
                    {(currentMetrics.testAccuracy * 100).toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Train: {(currentMetrics.trainAccuracy * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                  <span className="text-[11px] text-slate-400 font-medium">Macro F1-Score</span>
                  <div className="mt-1 text-2xl font-black text-emerald-400 font-mono">
                    {(currentMetrics.f1Score * 100).toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-slate-500">
                    P: {(currentMetrics.precision * 100).toFixed(0)}% / R: {(currentMetrics.recall * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                  <span className="text-[11px] text-slate-400 font-medium">Training Duration</span>
                  <div className="mt-1 text-2xl font-black text-white font-mono">
                    {currentMetrics.trainingTimeMs}
                    <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
                  </div>
                  <span className="text-[10px] text-slate-500">empirical run</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                  <span className="text-[11px] text-slate-400 font-medium">Inference Latency</span>
                  <div className="mt-1 text-2xl font-black text-indigo-400 font-mono">
                    {currentMetrics.inferenceLatencyMs}
                    <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
                  </div>
                  <span className="text-[10px] text-slate-500">per test sample</span>
                </div>
              </div>

              {/* Real Epoch Loss Graph & Confusion Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SVG Loss Curve */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center">
                      <TrendingDown className="mr-1.5 h-4 w-4 text-cyan-400" />
                      Empirical Loss Curve
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Loss: {currentMetrics.lossHistory[currentMetrics.lossHistory.length - 1]}
                    </span>
                  </div>

                  <div className="h-36 w-full rounded-lg bg-slate-950/70 p-2 flex flex-col justify-end">
                    <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                      <line x1="0" y1="25" x2="300" y2="25" stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1="0" y1="75" x2="300" y2="75" stroke="#1e293b" strokeDasharray="3 3" />

                      {(() => {
                        const history = currentMetrics.lossHistory;
                        if (!history || history.length < 2) return null;
                        const maxL = Math.max(...history, 0.7);
                        const minL = Math.min(...history, 0.1);
                        const range = maxL - minL || 1;

                        const points = history
                          .map((val, idx) => {
                            const x = (idx / (history.length - 1)) * 300;
                            const y = 90 - ((val - minL) / range) * 80;
                            return `${x},${y}`;
                          })
                          .join(' ');

                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke="#06b6d4"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              points={points}
                            />
                            <circle cx="0" cy={90 - ((history[0] - minL) / range) * 80} r="3" fill="#06b6d4" />
                            <circle cx="300" cy={90 - ((history[history.length - 1] - minL) / range) * 80} r="3" fill="#22d3ee" />
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Epoch 1 (Loss: {currentMetrics.lossHistory[0]?.toFixed(3)})</span>
                    <span className="text-cyan-400">Measured Trajectory</span>
                    <span>Final Epoch</span>
                  </div>
                </div>

                {/* Confusion Matrix Visual */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center">
                      <Layers className="mr-1.5 h-4 w-4 text-indigo-400" />
                      Empirical Confusion Matrix
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Held-out Partition</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center pt-1 font-mono">
                    <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/40 p-3">
                      <span className="text-[10px] text-emerald-400 uppercase font-sans">True Negatives (TN)</span>
                      <div className="text-lg font-bold text-white mt-0.5">
                        {currentMetrics.confusionMatrix[0]?.[0] ?? 0}
                      </div>
                    </div>
                    <div className="rounded-lg bg-amber-950/40 border border-amber-800/40 p-3">
                      <span className="text-[10px] text-amber-400 uppercase font-sans">False Positives (FP)</span>
                      <div className="text-lg font-bold text-white mt-0.5">
                        {currentMetrics.confusionMatrix[0]?.[1] ?? 0}
                      </div>
                    </div>
                    <div className="rounded-lg bg-amber-950/40 border border-amber-800/40 p-3">
                      <span className="text-[10px] text-amber-400 uppercase font-sans">False Negatives (FN)</span>
                      <div className="text-lg font-bold text-white mt-0.5">
                        {currentMetrics.confusionMatrix[1]?.[0] ?? 0}
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/40 p-3">
                      <span className="text-[10px] text-emerald-400 uppercase font-sans">True Positives (TP)</span>
                      <div className="text-lg font-bold text-white mt-0.5">
                        {currentMetrics.confusionMatrix[1]?.[1] ?? 0}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">
                    Ground-truth partition evaluation
                  </p>
                </div>
              </div>

              {/* WiSim Intelligence Empirical Interpreter Section */}
              <div className="rounded-2xl border border-indigo-900/60 bg-gradient-to-b from-indigo-950/30 to-slate-900/40 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      <h3 className="text-sm font-bold text-white">
                        WiSim Intelligence • Empirical Experiment Diagnosis
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Grounds technical ML analysis strictly in your real measured results.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center space-x-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied Code</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Export Architecture</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleInterpretWithWiSim}
                      disabled={interpreting}
                      className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 cursor-pointer disabled:opacity-50"
                    >
                      {interpreting ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Synthesizing Diagnosis...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Interpret with WiSim Intelligence</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Interpretation display */}
                {interpretationText ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {interpretationText}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                    Click &ldquo;Interpret with WiSim Intelligence&rdquo; to analyze the train/test gap, diagnose bias/variance trade-offs, and receive concrete scientific optimization next steps.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
              <Terminal className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-white">Ready for Empirical Run</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Configure hyperparameters on the left and click &ldquo;Execute Real Training&rdquo; to fit parameters and measure empirical convergence.
              </p>
              <button
                onClick={handleRunTraining}
                disabled={isTraining}
                className="mt-5 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 cursor-pointer"
              >
                Execute Training Now
              </button>
            </div>
          )}

          {/* Historical Runs Registry Comparison */}
          {experiments.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                  <GitCompare className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
                  WiSim Lab Leaderboard & Comparison Board
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  {experiments.length} Runs Recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2 font-medium">Run Name</th>
                      <th className="pb-2 font-medium">Algorithm</th>
                      <th className="pb-2 font-medium">Train Acc</th>
                      <th className="pb-2 font-medium">Test Acc</th>
                      <th className="pb-2 font-medium">F1</th>
                      <th className="pb-2 font-medium">Latency</th>
                      <th className="pb-2 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {experiments.map((exp) => (
                      <tr
                        key={exp.id}
                        className={`hover:bg-slate-800/30 transition-colors ${
                          activeExperiment?.id === exp.id ? 'bg-cyan-950/20' : ''
                        }`}
                      >
                        <td className="py-2 text-slate-200 font-sans font-medium">{exp.name}</td>
                        <td className="py-2 text-slate-400">{exp.algorithm}</td>
                        <td className="py-2 text-slate-400">
                          {(exp.metrics.trainAccuracy * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 font-bold text-cyan-400">
                          {(exp.metrics.testAccuracy * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 text-emerald-400">
                          {(exp.metrics.f1Score * 100).toFixed(1)}%
                        </td>
                        <td className="py-2 text-slate-400">{exp.metrics.inferenceLatencyMs}ms</td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => onSelectExperiment(exp)}
                            className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:text-white cursor-pointer"
                          >
                            Load Run
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
