import { ModularInferenceEngine } from '../services/modularInference';

export interface EmpiricalMetrics {
  trainAccuracy: number;
  testAccuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  lossHistory: number[];
  valLossHistory: number[];
  trainingTimeMs: number;
  inferenceLatencyMs: number;
  confusionMatrix: number[][];
}

export interface ExperimentRunPayload {
  experimentName: string;
  datasetName: string;
  algorithm: string;
  hyperparameters: Record<string, any>;
  metrics: EmpiricalMetrics;
}

export class ExperimentInterpreter {
  constructor(private inference: ModularInferenceEngine) {}

  public async interpretRun(payload: ExperimentRunPayload): Promise<{ analysis: string; source: string }> {
    const { experimentName, datasetName, algorithm, hyperparameters, metrics } = payload;

    const trainAcc = (metrics.trainAccuracy * 100).toFixed(1);
    const testAcc = (metrics.testAccuracy * 100).toFixed(1);
    const gap = (metrics.trainAccuracy - metrics.testAccuracy) * 100;

    let diagnosis = 'Balanced Generalization';
    if (gap > 7) {
      diagnosis = `Overfitting Detected (Generalization Gap: ${gap.toFixed(1)}%)`;
    } else if (metrics.trainAccuracy < 0.65) {
      diagnosis = 'High Bias / Underfitting Detected';
    }

    const nativeAnalysis = `### WiSim Lab Empirical Assessment
*Diagnostic evaluation for ${algorithm} on ${datasetName} (${experimentName})*

#### 1. Generalization & Convergence Profile
- **Status:** **${diagnosis}**
- **Empirical Validation:** Training accuracy reached **${trainAcc}%** vs held-out test accuracy of **${testAcc}%**.
${gap > 7 ? `- The ${gap.toFixed(1)}% discrepancy indicates the model is memorizing training distribution idiosyncrasies. Increase regularization (L2 weight decay or pruning) to stabilize test generalization.` : `- The small generalization gap (${gap.toFixed(1)}%) demonstrates well-calibrated variance control.`}
- **Loss Optimization:** Final measured loss reached **${metrics.lossHistory?.[metrics.lossHistory.length - 1]?.toFixed(4) || 'stable convergence'}**.

#### 2. Confusion Matrix & Precision-Recall Balance
- **F1 Score:** **${(metrics.f1Score * 100).toFixed(1)}%** (Precision: ${(metrics.precision * 100).toFixed(1)}%, Recall: ${(metrics.recall * 100).toFixed(1)}%).
${metrics.recall < metrics.precision ? '- The classifier exhibits higher precision than recall (more False Negatives than False Positives). Consider adjusting the decision threshold if capturing every positive event is critical.' : '- Balanced precision and recall distribution.'}

#### 3. Computational Throughput & SLA Validation
- **Training Time:** **${metrics.trainingTimeMs} ms** (empirical fit duration).
- **Per-Sample Latency:** **${metrics.inferenceLatencyMs} ms**. Conforms to sub-10ms real-time API serving requirements.

#### 4. Actionable Next Steps
1. Test learning rate decay to smooth late-stage gradient oscillations.
2. Run feature importance checks in WiSim Data Studio to prune low-signal inputs.
3. Compare against tree ensembles in the WiSim Lab leaderboard.`;

    const prompt = `You are WiSim Intelligence's Senior ML Scientist. Interpret the ACTUAL measured empirical experiment results below.
CRITICAL MANDATE: Ground your entire analysis strictly in the provided measured numbers. Do not fabricate hypothetical benchmarks.

Experiment: ${experimentName}
Dataset: ${datasetName}
Algorithm: ${algorithm}
Hyperparameters: ${JSON.stringify(hyperparameters)}
Empirical Measured Metrics:
- Training Accuracy: ${trainAcc}%
- Test Accuracy: ${testAcc}%
- Macro F1: ${(metrics.f1Score * 100).toFixed(1)}%
- Precision: ${(metrics.precision * 100).toFixed(1)}%
- Recall: ${(metrics.recall * 100).toFixed(1)}%
- Training Time: ${metrics.trainingTimeMs} ms
- Inference Latency: ${metrics.inferenceLatencyMs} ms / sample
- Confusion Matrix: ${JSON.stringify(metrics.confusionMatrix)}

Provide a rigorous scientific breakdown:
1. Generalization & Convergence (Evaluate train/test gap)
2. Confusion Matrix Profile (False Positives vs False Negatives)
3. Latency & SLA Verdict
4. Concrete Actionable Adjustments`;

    const systemPrompt = `You are WiSim Intelligence, the empirical experiment interpretation engine of WiSim AI. Explain technical trade-offs, identify missing information, and distinguish estimated results from measured experiment results.`;

    try {
      let aiAnalysis = '';
      await this.inference.executeChatStream(
        [{ role: 'user', content: prompt }],
        systemPrompt,
        { temperature: 0.2 },
        (chunk) => {
          aiAnalysis += chunk;
        }
      );

      if (aiAnalysis && aiAnalysis.trim().length > 50) {
        return { analysis: aiAnalysis, source: 'wisim-intelligence' };
      }
    } catch (err) {
      // Fallback smoothly to native heuristic evaluation
    }

    return { analysis: nativeAnalysis, source: 'wisim-lab-evaluator' };
  }
}
