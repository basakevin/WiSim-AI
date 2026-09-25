import Groq from 'groq-sdk';

export const AVAILABLE_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

export function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim().length <= 10 || apiKey === 'gsk_your_groq_api_key_here') return null;
  return new Groq({ apiKey });
}

export function selectedModel(value?: string) {
  return value && AVAILABLE_MODELS.includes(value)
    ? value
    : process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
}

export function jsonBody(req: any) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

export function methodNotAllowed(res: any, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '));
  return res.status(405).json({ error: 'Method not allowed' });
}

export function sseHeaders(res: any) {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
}

export function writeSse(res: any, payload: unknown) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export function endSse(res: any) {
  res.write('data: [DONE]\n\n');
  res.end();
}

export function fallbackAnalysis(input: any) {
  const projectName = String(input.projectName || 'ML System').slice(0, 120);
  const taskType = String(input.taskType || 'classification').slice(0, 80);
  const size = Number(input.datasetInfo?.size || 0);
  return {
    feasibilityScore: 84,
    verdict: 'FEASIBLE_WITH_RISKS',
    summary: `The project "${projectName}" has a viable machine learning formulation for ${taskType}. Data quality, class distribution, and evaluation design are the critical gating factors.`,
    problemFraming: {
      taskCategory: taskType,
      primaryMetric: taskType === 'regression' ? 'Root Mean Squared Error (RMSE)' : 'Macro F1-Score & PR-AUC',
      secondaryMetrics: ['Inference P99 latency', 'Calibration', 'Train/validation generalization gap'],
      baselineModel: taskType === 'regression' ? 'Ridge Regression with StandardScaler' : 'Regularized Logistic Regression',
    },
    recommendedArchitectures: [
      { name: 'Gradient Boosted Decision Trees', type: 'Ensemble Learning', pros: ['Strong tabular baseline', 'Fast CPU inference'], cons: ['Limited transfer to unstructured data'], trainingComplexity: 'Low', inferenceLatency: '< 5 ms per query', bestFor: 'Structured tabular data' },
      { name: 'Regularized Multilayer Perceptron', type: 'Deep Neural Network', pros: ['Learns dense feature interactions'], cons: ['Needs careful normalization and tuning'], trainingComplexity: 'Medium', inferenceLatency: '8 - 15 ms per query', bestFor: 'High-dimensional feature spaces' },
    ],
    datasetRequirements: {
      minSampleSize: size ? Math.max(500, Math.floor(size * 0.5)) : 2500,
      optimalSampleSize: size ? Math.max(5000, size * 2) : 25000,
      classBalanceAdvice: 'Use stratified validation and class-weighted loss when the minority class is below 15%.',
      augmentationStrategy: 'Use task-appropriate augmentation only after leakage and label quality checks.',
      labelingEffortEst: '20-40 annotator hours with double-verification on edge cases.',
    },
    technicalRisks: [
      { risk: 'Covariate shift and production drift', severity: 'High', mitigation: 'Monitor feature distributions with PSI or KS tests.' },
      { risk: 'Overfitting from low sample/feature ratio', severity: 'Medium', mitigation: 'Use regularization and stratified cross-validation.' },
      { risk: 'Latency SLA breach at peak traffic', severity: 'Low', mitigation: 'Export to ONNX and benchmark p95/p99 latency.' },
    ],
    costEstimation: {
      trainingGpu: 'CPU baseline or 1x NVIDIA L4 for larger sweeps',
      estimatedTrainingHours: 4.5,
      estimatedTrainingCostUsd: 6.75,
      inferenceMonthlyCostUsd: 48,
      budgetOptimizationAdvice: 'Use spot capacity for batch sweeps and scale-to-zero CPU serving where model size allows.',
    },
    deploymentRoadmap: [
      { step: 1, title: 'Model serialization and validation', details: 'Export the selected model and verify parity against the measured test set.', framework: 'ONNX Runtime' },
      { step: 2, title: 'API packaging', details: 'Add request validation, health checks, and a containerized inference service.', framework: 'FastAPI + Docker' },
      { step: 3, title: 'Observability and drift monitoring', details: 'Track latency, prediction distributions, and data quality in production.', framework: 'Prometheus + OpenTelemetry' },
    ],
    source: 'offline-estimate',
  };
}

export function fallbackInterpretation(metrics: any, algorithm = 'ML model', datasetName = 'dataset') {
  const train = Number(metrics.trainAccuracy || 0);
  const test = Number(metrics.testAccuracy || 0);
  const gap = (train - test) * 100;
  const diagnosis = gap > 8 ? `Overfitting detected (${gap.toFixed(1)}% generalization gap)` : train < 0.65 ? 'Underfitting detected' : 'Balanced generalization';
  return {
    analysis: `### WiSim AI Empirical Experiment Assessment\n*Grounded strictly in measured run data for ${algorithm} on ${datasetName}.*\n\n#### Generalization\n- **Status:** ${diagnosis}\n- Training accuracy: **${(train * 100).toFixed(1)}%**\n- Held-out test accuracy: **${(test * 100).toFixed(1)}%**\n\n#### Measured metrics\n- F1: **${(Number(metrics.f1Score || 0) * 100).toFixed(1)}%**\n- Precision: **${(Number(metrics.precision || 0) * 100).toFixed(1)}%**\n- Recall: **${(Number(metrics.recall || 0) * 100).toFixed(1)}%**\n- Inference latency: **${Number(metrics.inferenceLatencyMs || 0)} ms/sample**\n\n#### Next steps\n1. Compare this immutable run against another baseline.\n2. Inspect false-positive and false-negative costs.\n3. Validate latency and drift on representative production traffic.`,
    source: 'offline-grounded-evaluator',
  };
}
