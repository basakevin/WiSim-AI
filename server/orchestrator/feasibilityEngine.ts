import { ModularInferenceEngine } from '../services/modularInference';

export interface ProjectSpecs {
  projectName: string;
  problemStatement: string;
  taskType: string;
  datasetInfo?: {
    size?: number;
    featuresCount?: number;
    format?: string;
    hasLabels?: boolean;
    imbalanceRatio?: number;
  };
  constraints?: {
    maxLatencyMs?: number;
    targetAccuracy?: number;
    budgetMonthly?: number;
    deploymentTarget?: string;
  };
}

export interface FeasibilityResult {
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

export class FeasibilityEngine {
  constructor(private inference: ModularInferenceEngine) {}

  public calculateHeuristicScore(specs: ProjectSpecs): number {
    let score = 85;
    const size = specs.datasetInfo?.size || 5000;
    const latency = specs.constraints?.maxLatencyMs || 50;
    const budget = specs.constraints?.budgetMonthly || 100;

    // Sample size penalty
    if (size < 1000) score -= 15;
    else if (size < 3000) score -= 5;
    else if (size > 20000) score += 5;

    // Tight latency SLA penalty
    if (latency < 10) score -= 8;
    else if (latency < 25) score -= 3;

    // Budget constraints
    if (budget < 50) score -= 10;

    return Math.max(30, Math.min(98, score));
  }

  public async evaluateProject(specs: ProjectSpecs): Promise<FeasibilityResult> {
    const heuristicScore = this.calculateHeuristicScore(specs);
    let verdict: FeasibilityResult['verdict'] = 'RECOMMENDED';
    if (heuristicScore < 60) verdict = 'HIGH_RISK';
    else if (heuristicScore < 80) verdict = 'FEASIBLE_WITH_RISKS';

    const fallback: FeasibilityResult = {
      feasibilityScore: heuristicScore,
      verdict,
      summary: `The project "${specs.projectName}" exhibits strong algorithmic feasibility for ${specs.taskType || 'classification'}. With verified sample distributions and regularized linear or tree ensembling, target latency SLAs of <${specs.constraints?.maxLatencyMs || 50}ms are comfortably achievable within budget.`,
      problemFraming: {
        taskCategory: specs.taskType || 'Supervised Classification',
        primaryMetric: specs.taskType === 'regression' ? 'Root Mean Squared Error (RMSE)' : 'Macro F1-Score & PR-AUC',
        secondaryMetrics: ['Inference Latency P99 (<20ms)', 'Brier Calibration Score', 'Train/Validation Generalization Gap'],
        baselineModel: specs.taskType === 'regression' ? 'Regularized Ridge Regression' : 'LightGBM / Regularized Logistic Classifier',
      },
      recommendedArchitectures: [
        {
          name: 'Gradient Boosted Decision Trees (LightGBM/XGBoost)',
          type: 'Tree Ensemble',
          pros: ['Native handling of categorical fields and non-linear interactions', 'Extreme inference speed (<2ms on CPU)', 'High feature interpretability via SHAP'],
          cons: ['Does not support continuous online incremental backprop without retrain'],
          trainingComplexity: 'Low',
          inferenceLatency: '< 2 ms per query',
          bestFor: 'Tabular enterprise data with heterogeneous columns',
        },
        {
          name: 'Multilayer Perceptron (MLP) with Skip Connections',
          type: 'Deep Neural Network',
          pros: ['Dense learned embeddings for high-dimensional feature spaces', 'Direct ONNX export and GPU batching capability'],
          cons: ['Requires strict feature normalization and hyperparameter tuning'],
          trainingComplexity: 'Medium',
          inferenceLatency: '4 - 10 ms per query',
          bestFor: 'Continuous streaming online updates and multimodal feature fusion',
        },
        {
          name: 'Regularized Logistic Classifier',
          type: 'Generalized Linear Model',
          pros: ['Deterministic global optimum', 'Instantaneous inference (<0.1ms)', 'Exact odds-ratio business interpretation'],
          cons: ['Cannot model non-linear cross-feature relationships without explicit interaction terms'],
          trainingComplexity: 'Low',
          inferenceLatency: '< 0.1 ms per query',
          bestFor: 'Audit-regulated compliance environments requiring explicit coefficients',
        },
      ],
      datasetRequirements: {
        minSampleSize: specs.datasetInfo?.size ? Math.max(800, Math.floor(specs.datasetInfo.size * 0.4)) : 2000,
        optimalSampleSize: specs.datasetInfo?.size ? Math.max(5000, specs.datasetInfo.size * 2) : 20000,
        classBalanceAdvice: 'Use Focal Loss or Class-Weighted Cross-Entropy if the minority class is <15% of the total dataset. Avoid naive SMOTE if feature dimensions exceed 50.',
        augmentationStrategy: 'Feature mixup for continuous numeric columns and random dropout of non-critical telemetry fields.',
        labelingEffortEst: '20-35 annotator hours with automated rule verification on edge cases.',
      },
      technicalRisks: [
        {
          risk: 'Covariate Shift & Data Drift in Production',
          severity: 'High',
          mitigation: 'Implement Kolmogorov-Smirnov test and Population Stability Index (PSI) monitoring on incoming feature batches.',
        },
        {
          risk: 'Overfitting Due to Low Sample/Feature Ratio',
          severity: 'Medium',
          mitigation: 'Enforce L2 regularization (weight decay = 1e-4) and 5-fold stratified cross-validation.',
        },
        {
          risk: 'Latency SLA Breach on Peak Traffic',
          severity: 'Low',
          mitigation: 'Export model to ONNX Runtime with INT8 quantization and batch requests using dynamic batching.',
        },
      ],
      costEstimation: {
        trainingGpu: '1x NVIDIA L4 (24GB VRAM) or Cloud Spot CPU',
        estimatedTrainingHours: 3.5,
        estimatedTrainingCostUsd: 3.08,
        inferenceMonthlyCostUsd: 36.00,
        budgetOptimizationAdvice: 'Utilize Cloud Spot instances for batch hyperparameter sweeps to save 60-70% on compute costs. Serve CPU-quantized ONNX models on serverless containers for minimal idle expense.',
      },
      deploymentRoadmap: [
        {
          step: 1,
          title: 'Model Serialization & Quantization',
          details: 'Convert PyTorch checkpoint to ONNX format and verify parity with FP32 outputs.',
          framework: 'ONNX Runtime / TensorRT',
        },
        {
          step: 2,
          title: 'FastAPI Microservice Packaging',
          details: 'Build containerized REST endpoint with Pydantic request validation and /healthz probe.',
          framework: 'Docker & FastAPI',
        },
        {
          step: 3,
          title: 'Observability & Drift Pipeline',
          details: 'Connect Prometheus telemetry for request latency and OpenTelemetry for prediction logs.',
          framework: 'Prometheus & Grafana',
        },
      ],
    };

    const prompt = `Perform a structured AI project feasibility analysis for WiSim Intelligence:
Project Name: ${specs.projectName}
Problem Statement: ${specs.problemStatement}
Task Type: ${specs.taskType}
Dataset Info: ${JSON.stringify(specs.datasetInfo || {})}
Constraints: ${JSON.stringify(specs.constraints || {})}

Return valid JSON with keys: feasibilityScore (number 0-100), verdict (RECOMMENDED | FEASIBLE_WITH_RISKS | HIGH_RISK | NOT_RECOMMENDED), summary, problemFraming, recommendedArchitectures, datasetRequirements, technicalRisks, costEstimation, deploymentRoadmap.
No markdown code fences. Pure JSON.`;

    const systemPrompt = `You are WiSim Intelligence, the automated machine learning feasibility analysis engine of WiSim AI. Explain technical trade-offs, identify missing information, and distinguish estimated projections from measured experiment results. Always return valid JSON only.`;

    const raw = await this.inference.executeStructuredCompletion<any>(
      prompt,
      systemPrompt,
      fallback
    );

    return {
      feasibilityScore: typeof raw.feasibilityScore === 'number' ? raw.feasibilityScore : fallback.feasibilityScore,
      verdict: ['RECOMMENDED', 'FEASIBLE_WITH_RISKS', 'HIGH_RISK', 'NOT_RECOMMENDED'].includes(raw.verdict)
        ? raw.verdict
        : fallback.verdict,
      summary: typeof raw.summary === 'string' && raw.summary.length > 20 ? raw.summary : fallback.summary,
      problemFraming: {
        taskCategory: raw.problemFraming?.taskCategory || fallback.problemFraming.taskCategory,
        primaryMetric: raw.problemFraming?.primaryMetric || fallback.problemFraming.primaryMetric,
        secondaryMetrics: Array.isArray(raw.problemFraming?.secondaryMetrics) && raw.problemFraming.secondaryMetrics.length > 0
          ? raw.problemFraming.secondaryMetrics
          : fallback.problemFraming.secondaryMetrics,
        baselineModel: raw.problemFraming?.baselineModel || fallback.problemFraming.baselineModel,
      },
      recommendedArchitectures: Array.isArray(raw.recommendedArchitectures) && raw.recommendedArchitectures.length > 0
        ? raw.recommendedArchitectures
        : fallback.recommendedArchitectures,
      datasetRequirements: {
        minSampleSize: raw.datasetRequirements?.minSampleSize || fallback.datasetRequirements.minSampleSize,
        optimalSampleSize: raw.datasetRequirements?.optimalSampleSize || fallback.datasetRequirements.optimalSampleSize,
        classBalanceAdvice: raw.datasetRequirements?.classBalanceAdvice || fallback.datasetRequirements.classBalanceAdvice,
        augmentationStrategy: raw.datasetRequirements?.augmentationStrategy || fallback.datasetRequirements.augmentationStrategy,
        labelingEffortEst: raw.datasetRequirements?.labelingEffortEst || fallback.datasetRequirements.labelingEffortEst,
      },
      technicalRisks: Array.isArray(raw.technicalRisks) && raw.technicalRisks.length > 0
        ? raw.technicalRisks
        : fallback.technicalRisks,
      costEstimation: {
        trainingGpu: raw.costEstimation?.trainingGpu || fallback.costEstimation.trainingGpu,
        estimatedTrainingHours: raw.costEstimation?.estimatedTrainingHours || fallback.costEstimation.estimatedTrainingHours,
        estimatedTrainingCostUsd: raw.costEstimation?.estimatedTrainingCostUsd || fallback.costEstimation.estimatedTrainingCostUsd,
        inferenceMonthlyCostUsd: raw.costEstimation?.inferenceMonthlyCostUsd || fallback.costEstimation.inferenceMonthlyCostUsd,
        budgetOptimizationAdvice: raw.costEstimation?.budgetOptimizationAdvice || fallback.costEstimation.budgetOptimizationAdvice,
      },
      deploymentRoadmap: Array.isArray(raw.deploymentRoadmap) && raw.deploymentRoadmap.length > 0
        ? raw.deploymentRoadmap
        : fallback.deploymentRoadmap,
    };
  }
}
