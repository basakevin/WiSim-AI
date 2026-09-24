import React, { useState } from 'react';
import { 
  Coins, 
  Cpu, 
  Server, 
  Zap, 
  TrendingDown, 
  Layers, 
  ShieldCheck, 
  Check, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { ProjectContext } from '../types';

interface BudgetOptimizerViewProps {
  currentProject: ProjectContext;
}

interface GpuSpec {
  id: string;
  name: string;
  vram: string;
  fp16Tflops: number;
  awsHourly: number;
  gcpHourly: number;
  spotHourly: number;
  bestFor: string;
}

const GPU_CATALOG: GpuSpec[] = [
  {
    id: 'l4',
    name: 'NVIDIA L4 (Ada Lovelace)',
    vram: '24 GB GDDR6',
    fp16Tflops: 242,
    awsHourly: 0.95,
    gcpHourly: 0.88,
    spotHourly: 0.35,
    bestFor: 'Optimal cost-performance for tabular ML, vision inference, and lightweight fine-tuning.',
  },
  {
    id: 't4',
    name: 'NVIDIA T4 (Turing)',
    vram: '16 GB GDDR6',
    fp16Tflops: 65,
    awsHourly: 0.52,
    gcpHourly: 0.45,
    spotHourly: 0.18,
    bestFor: 'Budget baseline for classical models and small batch inference.',
  },
  {
    id: 'a100',
    name: 'NVIDIA A100 (Ampere)',
    vram: '80 GB HBM2e',
    fp16Tflops: 624,
    awsHourly: 4.10,
    gcpHourly: 3.85,
    spotHourly: 1.45,
    bestFor: 'Large language model pre-training and high-concurrency transformer fine-tuning.',
  },
  {
    id: 'h100',
    name: 'NVIDIA H100 (Hopper)',
    vram: '80 GB HBM3',
    fp16Tflops: 1979,
    awsHourly: 7.90,
    gcpHourly: 7.50,
    spotHourly: 3.20,
    bestFor: 'Extreme scale distributed training and FP8 mixed-precision clusters.',
  },
];

export const BudgetOptimizerView: React.FC<BudgetOptimizerViewProps> = ({ currentProject }) => {
  const [selectedGpu, setSelectedGpu] = useState<GpuSpec>(GPU_CATALOG[0]);
  const [useSpot, setUseSpot] = useState(true);
  const [trainingHours, setTrainingHours] = useState(6);
  const [monthlyQps, setMonthlyQps] = useState(20);
  const [instanceCount, setInstanceCount] = useState(1);

  const effectiveHourly = useSpot ? selectedGpu.spotHourly : selectedGpu.gcpHourly;
  const trainingCost = effectiveHourly * trainingHours * instanceCount;

  const servingInstancesNeeded = Math.max(1, Math.ceil(monthlyQps / 120));
  const monthlyServingHours = 730;
  const inferenceCost = selectedGpu.gcpHourly * servingInstancesNeeded * monthlyServingHours * 0.4;
  const totalCost = trainingCost + inferenceCost;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">WiSim Training Studio • Compute Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate training resource requirements, compare Spot vs On-Demand compute, and project monthly serving costs.
          </p>
        </div>

        <div className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-xs">
          <span className="text-slate-400">Monthly Project Target:</span>
          <span className="font-mono font-bold text-emerald-400">
            ${currentProject.budgetMonthlyUsd}.00
          </span>
        </div>
      </div>

      {/* Main Budget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: GPU Selector & Interactive Sizing */}
        <div className="lg:col-span-2 space-y-6">
          {/* GPU Hardware Cards */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Cpu className="mr-2 h-4 w-4 text-cyan-400" />
              Target Compute Architecture & Accelerators
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GPU_CATALOG.map((gpu) => {
                const isSelected = selectedGpu.id === gpu.id;
                return (
                  <div
                    key={gpu.id}
                    onClick={() => setSelectedGpu(gpu)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500/80 bg-cyan-950/40 shadow-md shadow-cyan-950/50'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{gpu.name}</span>
                      <span className="font-mono text-[11px] font-bold text-cyan-400">
                        ${gpu.spotHourly.toFixed(2)}/hr <span className="text-[9px] text-slate-500">spot</span>
                      </span>
                    </div>

                    <div className="mt-2 flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                      <span>VRAM: {gpu.vram}</span>
                      <span>•</span>
                      <span>{gpu.fp16Tflops} TFLOPS</span>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-400 leading-normal">{gpu.bestFor}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sizing Parameters */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Layers className="mr-2 h-4 w-4 text-indigo-400" />
              Workload & Traffic Simulation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Training Hours */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Training Duration</span>
                  <span className="font-mono text-cyan-400 font-bold">{trainingHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="48"
                  value={trainingHours}
                  onChange={(e) => setTrainingHours(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Convergence sweep time estimate</span>
              </div>

              {/* Traffic QPS */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Serving Load</span>
                  <span className="font-mono text-cyan-400 font-bold">{monthlyQps} Queries/Sec</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={monthlyQps}
                  onChange={(e) => setMonthlyQps(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Peak expected traffic rate</span>
              </div>
            </div>

            {/* Spot Instances Toggle */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Enable Cloud Spot / Preemptible Schedulers</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Save 60-70% on compute by using interruptible instances with checkpoint resumption.
                </p>
              </div>
              <button
                onClick={() => setUseSpot(!useSpot)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  useSpot ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    useSpot ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Cost Summary & WiSim Optimization Advice */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-cyan-800/40 bg-gradient-to-b from-cyan-950/40 to-slate-900 p-5 space-y-4">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Projected Monthly Compute
            </span>

            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-white font-mono">
                ${totalCost.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-mono">USD / month</span>
            </div>

            <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Training Run ({trainingHours}h on {selectedGpu.name}):</span>
                <span className="font-mono font-semibold">${trainingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Inference Serving ({servingInstancesNeeded}x instance):</span>
                <span className="font-mono font-semibold">${inferenceCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Cloud Storage & Artifact Registry:</span>
                <span className="font-mono">$3.50</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/60 p-3 text-[11px] border border-slate-800/80">
              <div className="flex items-center text-emerald-400 font-semibold mb-1">
                <Check className="h-3.5 w-3.5 mr-1" />
                <span>
                  {totalCost <= currentProject.budgetMonthlyUsd ? 'Within Monthly Budget' : 'Exceeds Budget Constraint'}
                </span>
              </div>
              <p className="text-slate-400">
                Simulation based on {useSpot ? 'Cloud Spot pricing' : 'On-demand pricing'} in US/EU cloud regions.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
              WiSim Training Studio Recommendations
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                <strong className="text-cyan-300">INT8 Quantization:</strong>
                <p className="mt-0.5 text-slate-400 text-[11px]">
                  Quantizing model weights reduces VRAM footprint by 4x, enabling deployment on a CPU or T4 instance for 75% cost savings.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                <strong className="text-cyan-300">Dynamic Batching:</strong>
                <p className="mt-0.5 text-slate-400 text-[11px]">
                  Grouping incoming requests into micro-batches of 8-16 amortizes kernel overhead and doubles peak throughput.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                <strong className="text-cyan-300">Scale-to-Zero Serverless:</strong>
                <p className="mt-0.5 text-slate-400 text-[11px]">
                  Deploy to Google Cloud Run or AWS ECS with scale-to-zero when no queries are active to eliminate idle costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
