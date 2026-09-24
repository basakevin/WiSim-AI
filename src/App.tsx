import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CopilotView } from './components/CopilotView';
import { FeasibilityView } from './components/FeasibilityView';
import { DatasetLabView } from './components/DatasetLabView';
import { ExperimentPlaygroundView } from './components/ExperimentPlaygroundView';
import { BudgetOptimizerView } from './components/BudgetOptimizerView';
import { DeploymentStudioView } from './components/DeploymentStudioView';
import { EngineStatusModal } from './components/EngineStatusModal';
import { BENCHMARK_DATASETS } from './utils/datasets';
import { ProjectContext, ExperimentRun, FeasibilityReport } from './types';
import { WiSimEngineStatus, fetchWiSimEngineStatus } from './services/wisimService';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);

  // Active Project Memory Context
  const [currentProject, setCurrentProject] = useState<ProjectContext>({
    id: 'proj-churn-sentinel',
    name: 'Enterprise Customer Churn Sentinel',
    description: 'Predictive subscription attrition and default risk modeling using 8 heterogeneous features to trigger automated retention intervention workflows.',
    taskType: 'binary-classification',
    primaryMetric: 'Macro F1-Score & PR-AUC',
    targetLatencyMs: 15,
    budgetMonthlyUsd: 150,
    datasetId: 'customer-churn-v1',
    status: 'exploring',
  });

  // Datasets
  const [datasets] = useState(BENCHMARK_DATASETS);
  const [selectedDataset, setSelectedDataset] = useState(BENCHMARK_DATASETS[0]);
  const [trainRatio, setTrainRatio] = useState(0.25);
  const [normalize, setNormalize] = useState(true);

  // WiSim Engine Status
  const [engineStatus, setEngineStatus] = useState<WiSimEngineStatus | null>(null);
  const [activeModel, setActiveModel] = useState('llama-3.1-8b-instant');

  // Baseline Empirical Runs in WiSim Lab
  const [experiments, setExperiments] = useState<ExperimentRun[]>([
    {
      id: 'exp-baseline-rf',
      projectId: 'proj-churn-sentinel',
      name: 'RANDOM FOREST - Run #8821',
      algorithm: 'random_forest',
      hyperparameters: { numTrees: 7, maxDepth: 4 },
      datasetId: 'customer-churn-v1',
      datasetName: 'Enterprise Customer Churn & Risk',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      metrics: {
        trainAccuracy: 0.884,
        testAccuracy: 0.857,
        f1Score: 0.842,
        precision: 0.831,
        recall: 0.854,
        confusionMatrix: [
          [71, 10],
          [6, 26],
        ],
        lossHistory: [0.62, 0.48, 0.39, 0.32, 0.28, 0.24],
        valLossHistory: [0.65, 0.52, 0.44, 0.38, 0.35, 0.33],
        trainingTimeMs: 42,
        inferenceLatencyMs: 0.12,
      },
      groqInterpretation: `### WiSim Lab Empirical Assessment
*Diagnostic evaluation for Random Forest on Enterprise Customer Churn*

#### 1. Generalization & Convergence Profile
- **Status:** **Balanced Generalization (Low Variance)**
- **Empirical Validation:** Training accuracy achieved **88.4%** while held-out test accuracy stabilized at **85.7%** (a tight 2.7% generalization gap).
- **Loss Optimization:** Ensembling over bootstrap trees effectively suppressed individual tree variance without memorizing spurious noise.

#### 2. Confusion Matrix & Error Profile
- **F1 Score:** **84.2%** (Precision: 83.1%, Recall: 85.4%).
- The model correctly captured 26 out of 32 true churners with only 10 false alarms out of 81 retained customers.

#### 3. Serving & Latency Assessment
- **Training Duration:** **42 ms** (instant empirical convergence).
- **Per-Sample Latency:** **0.12 ms**, which is 125x faster than your 15ms SLA target. Ideal for synchronous inline API scoring.`,
      status: 'completed',
    },
    {
      id: 'exp-baseline-logistic',
      projectId: 'proj-churn-sentinel',
      name: 'LOGISTIC REGRESSION - Run #8410',
      algorithm: 'logistic_regression',
      hyperparameters: { learningRate: 0.05, epochs: 80, l2Regularization: 0.01 },
      datasetId: 'customer-churn-v1',
      datasetName: 'Enterprise Customer Churn & Risk',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      metrics: {
        trainAccuracy: 0.812,
        testAccuracy: 0.795,
        f1Score: 0.768,
        precision: 0.755,
        recall: 0.782,
        confusionMatrix: [
          [66, 15],
          [8, 24],
        ],
        lossHistory: [0.69, 0.58, 0.51, 0.46, 0.42, 0.39],
        valLossHistory: [0.70, 0.61, 0.53, 0.48, 0.44, 0.41],
        trainingTimeMs: 18,
        inferenceLatencyMs: 0.04,
      },
      status: 'completed',
    },
  ]);

  const [activeExperiment, setActiveExperiment] = useState<ExperimentRun | null>(experiments[0]);

  // Pre-seed WiSim Intelligence Structured Feasibility Report
  const [feasibilityReport, setFeasibilityReport] = useState<FeasibilityReport | null>({
    feasibilityScore: 88,
    verdict: 'RECOMMENDED',
    summary: 'The Enterprise Customer Churn Sentinel exhibits strong algorithmic feasibility. Feature distributions offer high separability via decision trees and regularized multi-layer perceptrons while comfortably meeting sub-15ms latency requirements.',
    problemFraming: {
      taskCategory: 'Supervised Binary Classification',
      primaryMetric: 'Macro F1-Score & PR-AUC',
      secondaryMetrics: ['Inference Latency P99 (<15ms)', 'Brier Calibration Score', 'Expected Maximum Cost Benefit'],
      baselineModel: 'Regularized Logistic Regression + LightGBM',
    },
    recommendedArchitectures: [
      {
        name: 'Gradient Boosted Decision Trees (LightGBM/XGBoost)',
        type: 'Tree Ensemble',
        pros: ['Native handling of categorical features and non-linear interactions', 'Extreme inference speed (<2ms on CPU)', 'High feature interpretability via SHAP'],
        cons: ['Does not support continuous online incremental backprop without retrain'],
        trainingComplexity: 'Low',
        inferenceLatency: '< 0.5 ms per sample',
        bestFor: 'Structured tabular data with mixed feature types and class imbalance',
      },
      {
        name: 'Multilayer Perceptron (MLP) with Skip Connections',
        type: 'Neural Network',
        pros: ['Dense learned embeddings for high-dimensional feature spaces', 'Direct ONNX export and GPU batching capability'],
        cons: ['Requires strict feature normalization and hyperparameter tuning'],
        trainingComplexity: 'Medium',
        inferenceLatency: '1.2 - 2.5 ms per sample',
        bestFor: 'Continuous streaming online updates and multimodal feature fusion',
      },
      {
        name: 'Regularized Logistic Classifier',
        type: 'Generalized Linear Model',
        pros: ['Deterministic global optimum', 'Instantaneous inference (<0.1ms)', 'Exact odds-ratio business interpretation'],
        cons: ['Cannot model non-linear cross-feature relationships without explicit interaction terms'],
        trainingComplexity: 'Low',
        inferenceLatency: '< 0.1 ms per sample',
        bestFor: 'Audit-regulated compliance environments requiring explicit coefficients',
      },
    ],
    datasetRequirements: {
      minSampleSize: 1500,
      optimalSampleSize: 15000,
      classBalanceAdvice: 'With an 82/18 negative/positive split, employ Class-Weighted Cross-Entropy or Focal Loss rather than aggressive synthetic resampling.',
      augmentationStrategy: 'Feature mixup for continuous numeric columns and random dropout of non-critical telemetry fields.',
      labelingEffortEst: '25 annotator hours with automated rule verification on payment delay records.',
    },
    technicalRisks: [
      {
        risk: 'Concept Drift in Economic Downturns',
        severity: 'Medium',
        mitigation: 'Implement monthly Population Stability Index (PSI) drift monitoring on incoming balance distributions.',
      },
      {
        risk: 'High Latency Spikes during Batch Ingestion',
        severity: 'Low',
        mitigation: 'Serve INT8 quantized ONNX Runtime model behind FastAPI with worker threadpools.',
      },
      {
        risk: 'Disparate Impact / Bias across Demographic Segments',
        severity: 'High',
        mitigation: 'Verify Equalized Odds and Disparate Impact Ratio across age and geography strata prior to deployment.',
      },
    ],
    costEstimation: {
      trainingGpu: '1x NVIDIA L4 (24GB VRAM) or Cloud Spot CPU',
      estimatedTrainingHours: 2.0,
      estimatedTrainingCostUsd: 1.76,
      inferenceMonthlyCostUsd: 28.50,
      budgetOptimizationAdvice: 'Serve on CPU-optimized Google Cloud Run or AWS Fargate with scale-to-zero. The model footprint is small enough to avoid dedicated GPU idle costs.',
    },
    deploymentRoadmap: [
      {
        step: 1,
        title: 'ONNX Graph Serialization & Calibration',
        details: 'Export trained model weights to ONNX format and calibrate with test set inputs.',
        framework: 'ONNX Runtime',
      },
      {
        step: 2,
        title: 'FastAPI Microservice Packaging',
        details: 'Encapsulate inference runtime in Docker slim container with Pydantic request validation.',
        framework: 'FastAPI + Docker',
      },
      {
        step: 3,
        title: 'Canary Deployment & Telemetry',
        details: 'Route 5% of production traffic through new model and track prediction calibration against legacy baseline.',
        framework: 'Kubernetes HPA + Prometheus',
      },
    ],
  });

  useEffect(() => {
    fetchWiSimEngineStatus().then((status) => {
      setEngineStatus(status);
      if (status.inference.activeModel) {
        setActiveModel(status.inference.activeModel);
      }
    });
  }, []);

  const handleAddExperiment = (newExp: ExperimentRun) => {
    setExperiments((prev) => [newExp, ...prev]);
    setActiveExperiment(newExp);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header & Subsystem Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        engineStatus={engineStatus}
        currentProject={currentProject}
        onOpenSettings={() => setIsStatusModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentProject={currentProject}
            experiments={experiments}
            feasibilityReport={feasibilityReport}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectExperiment={(exp) => setActiveExperiment(exp)}
          />
        )}

        {activeTab === 'copilot' && (
          <CopilotView
            currentProject={currentProject}
            experiments={experiments}
            activeModel={activeModel}
            onModelChange={(model) => setActiveModel(model)}
            availableModels={engineStatus?.inference.availableModels || ['llama-3.1-8b-instant', 'llama3-8b-8192', 'llama3-70b-8192', 'gemma2-9b-it']}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'feasibility' && (
          <FeasibilityView
            currentProject={currentProject}
            report={feasibilityReport}
            onUpdateReport={(rep) => setFeasibilityReport(rep)}
          />
        )}

        {activeTab === 'dataset_lab' && (
          <DatasetLabView
            datasets={datasets}
            selectedDataset={selectedDataset}
            onSelectDataset={(ds) => setSelectedDataset(ds)}
            trainRatio={trainRatio}
            onTrainRatioChange={(r) => setTrainRatio(r)}
            normalize={normalize}
            onToggleNormalize={() => setNormalize(!normalize)}
            onNavigateToExperiments={() => setActiveTab('experiments')}
          />
        )}

        {activeTab === 'experiments' && (
          <ExperimentPlaygroundView
            dataset={selectedDataset}
            experiments={experiments}
            onAddExperiment={handleAddExperiment}
            activeExperiment={activeExperiment}
            onSelectExperiment={(exp) => setActiveExperiment(exp)}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetOptimizerView currentProject={currentProject} />
        )}

        {activeTab === 'deployment' && (
          <DeploymentStudioView
            currentProject={currentProject}
            bestExperiment={experiments[0] || null}
          />
        )}
      </main>

      {/* WiSim AI Architecture & System Configuration Diagnostics */}
      <EngineStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        status={engineStatus}
        onStatusUpdated={(newStatus) => setEngineStatus(newStatus)}
      />
    </div>
  );
}
