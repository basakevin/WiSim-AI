export type TaskType = 
  | 'binary-classification' 
  | 'multiclass-classification' 
  | 'regression' 
  | 'time-series' 
  | 'nlp' 
  | 'computer-vision';

export interface ProjectContext {
  id: string;
  name: string;
  description: string;
  taskType: TaskType;
  primaryMetric: string;
  targetLatencyMs: number;
  budgetMonthlyUsd: number;
  datasetId: string;
  status: 'idea' | 'exploring' | 'training' | 'ready_for_deploy';
}

export interface DatasetFeature {
  name: string;
  type: 'numeric' | 'categorical' | 'boolean';
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  distinct?: number;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  taskType: TaskType;
  targetColumn: string;
  sampleCount: number;
  features: DatasetFeature[];
  data: Record<string, number | string>[];
}

export interface MLMetrics {
  trainAccuracy: number;
  testAccuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  lossHistory: number[];
  valLossHistory: number[];
  trainingTimeMs: number;
  inferenceLatencyMs: number;
  confusionMatrix: number[][]; // [[TN, FP], [FN, TP]]
  mae?: number;
  rmse?: number;
  r2?: number;
}

export interface ExperimentRun {
  id: string;
  projectId: string;
  name: string;
  algorithm: 'logistic_regression' | 'mlp_neural_network' | 'random_forest' | 'knn';
  hyperparameters: Record<string, any>;
  datasetId: string;
  datasetName: string;
  createdAt: string;
  metrics: MLMetrics;
  groqInterpretation?: string;
  status: 'completed' | 'training' | 'failed';
}

export interface FeasibilityReport {
  feasibilityScore: number;
  verdict: 'RECOMMENDED' | 'FEASIBLE_WITH_RISKS' | 'HIGH_RISK' | 'NOT_RECOMMENDED';
  summary: string;
  problemFraming: {
    taskCategory: string;
    primaryMetric: string;
    secondaryMetrics: string[];
    baselineModel: string;
  };
  recommendedArchitectures: Array<{
    name: string;
    type: string;
    pros: string[];
    cons: string[];
    trainingComplexity: 'Low' | 'Medium' | 'High';
    inferenceLatency: string;
    bestFor: string;
  }>;
  datasetRequirements: {
    minSampleSize: number;
    optimalSampleSize: number;
    classBalanceAdvice: string;
    augmentationStrategy: string;
    labelingEffortEst: string;
  };
  technicalRisks: Array<{
    risk: string;
    severity: 'Low' | 'Medium' | 'High';
    mitigation: string;
  }>;
  costEstimation: {
    trainingGpu: string;
    estimatedTrainingHours: number;
    estimatedTrainingCostUsd: number;
    inferenceMonthlyCostUsd: number;
    budgetOptimizationAdvice: string;
  };
  deploymentRoadmap: Array<{
    step: number;
    title: string;
    details: string;
    framework: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  isStreaming?: boolean;
}

export interface GroqStatus {
  configured: boolean;
  model: string;
  availableModels: string[];
  provider: string;
}
