export default function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  const body = typeof req.body === 'object' ? req.body : (() => { try { return JSON.parse(req.body || '{}'); } catch { return {}; } })();
  const size = Number(body.datasetInfo?.size || 0);
  const apiKey = process.env.GROQ_API_KEY;
  const fallback = {
    feasibilityScore: 84,
    verdict: 'FEASIBLE_WITH_RISKS',
    summary: `The project "${String(body.projectName || 'ML System').slice(0, 120)}" has a viable machine learning formulation for ${String(body.taskType || 'classification')}. Data quality, class distribution, and evaluation design are the critical gating factors.`,
    problemFraming: { taskCategory: body.taskType || 'classification', primaryMetric: body.taskType === 'regression' ? 'Root Mean Squared Error (RMSE)' : 'Macro F1-Score & PR-AUC', secondaryMetrics: ['Inference P99 latency', 'Calibration', 'Train/validation generalization gap'], baselineModel: body.taskType === 'regression' ? 'Ridge Regression with StandardScaler' : 'Regularized Logistic Regression' },
    recommendedArchitectures: [{ name: 'Gradient Boosted Decision Trees', type: 'Ensemble Learning', pros: ['Strong tabular baseline', 'Fast CPU inference'], cons: ['Limited transfer to unstructured data'], trainingComplexity: 'Low', inferenceLatency: '< 5 ms per query', bestFor: 'Structured tabular data' }],
    datasetRequirements: { minSampleSize: size ? Math.max(500, Math.floor(size * 0.5)) : 2500, optimalSampleSize: size ? Math.max(5000, size * 2) : 25000, classBalanceAdvice: 'Use stratified validation and class-weighted loss when the minority class is below 15%.', augmentationStrategy: 'Use task-appropriate augmentation only after leakage and label quality checks.', labelingEffortEst: '20-40 annotator hours with double-verification on edge cases.' },
    technicalRisks: [{ risk: 'Covariate shift and production drift', severity: 'High', mitigation: 'Monitor feature distributions with PSI or KS tests.' }],
    costEstimation: { trainingGpu: 'CPU baseline or 1x NVIDIA L4 for larger sweeps', estimatedTrainingHours: 4.5, estimatedTrainingCostUsd: 6.75, inferenceMonthlyCostUsd: 48, budgetOptimizationAdvice: 'Use spot capacity for batch sweeps and scale-to-zero CPU serving where model size allows.' },
    deploymentRoadmap: [{ step: 1, title: 'Model serialization and validation', details: 'Export the selected model and verify parity against measured data.', framework: 'ONNX Runtime' }, { step: 2, title: 'API packaging', details: 'Add request validation and health checks.', framework: 'FastAPI + Docker' }],
    source: 'offline-estimate',
  };
  if (!apiKey || apiKey.length < 10 || apiKey === 'gsk_your_groq_api_key_here') return res.status(200).json(fallback);
  return fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: 'You are WiSim AI. Return valid JSON only.' }, { role: 'user', content: `Analyze this ML project and return a structured feasibility report. ${JSON.stringify(body)}` }], temperature: 0.2, response_format: { type: 'json_object' } }) }).then(async (upstream) => { if (!upstream.ok) return res.status(200).json(fallback); const data = await upstream.json(); return res.status(200).json({ ...JSON.parse(data.choices?.[0]?.message?.content || '{}'), source: 'ai-analysis' }); }).catch(() => res.status(200).json(fallback));
}
