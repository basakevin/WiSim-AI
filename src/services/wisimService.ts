import { ChatMessage, FeasibilityReport, GroqStatus, ExperimentRun } from '../types';

export interface WiSimEngineStatus {
  platform: string;
  tagline: string;
  subsystems: {
    copilot: string;
    intelligence: string;
    lab: string;
    dataStudio: string;
    trainingStudio: string;
    deploy: string;
  };
  inference: {
    operational: boolean;
    provider: string;
    isConfigured: boolean;
    activeModel: string;
    availableModels: string[];
    hardwareAcceleration: string;
  };
}

export async function fetchWiSimEngineStatus(): Promise<WiSimEngineStatus> {
  try {
    const res = await fetch('/api/wisim/engine/status');
    if (!res.ok) throw new Error('Status endpoint returned non-200');
    return await res.json();
  } catch (err) {
    return {
      platform: 'WiSim AI',
      tagline: 'From Idea to Deployment',
      subsystems: {
        copilot: 'WiSim AI Copilot',
        intelligence: 'WiSim Intelligence',
        lab: 'WiSim Lab',
        dataStudio: 'WiSim Data Studio',
        trainingStudio: 'WiSim Training Studio',
        deploy: 'WiSim Deploy',
      },
      inference: {
        operational: true,
        provider: 'WiSim Accelerated Inference Subsystem',
        isConfigured: false,
        activeModel: 'llama-3.1-8b-instant',
        availableModels: ['llama-3.1-8b-instant', 'llama3-8b-8192', 'llama3-70b-8192', 'gemma2-9b-it'],
        hardwareAcceleration: 'Groq LPU Processing Units',
      },
    };
  }
}

export async function streamChatWithCopilot(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string,
  projectContext?: any,
  onChunk?: (token: string) => void,
  onError?: (err: string) => void
): Promise<string> {
  let fullResponse = '';

  try {
    const response = await fetch('/api/wisim/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model,
        projectContext,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Server responded with ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported on response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            onError?.(parsed.error);
          } else if (parsed.content) {
            fullResponse += parsed.content;
            onChunk?.(parsed.content);
          }
        } catch {
          // ignore partial parse
        }
      }
    }
  } catch (err: any) {
    console.error('Copilot stream error:', err);
    onError?.(err.message || 'Communication error with WiSim Copilot');
    throw err;
  }

  return fullResponse;
}

export async function generateWiSimFeasibility(
  projectData: {
    projectName: string;
    problemStatement: string;
    taskType: string;
    datasetInfo?: any;
    constraints?: any;
  }
): Promise<FeasibilityReport> {
  const response = await fetch('/api/wisim/intelligence/feasibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new Error('WiSim Intelligence feasibility evaluation failed');
  }

  return await response.json();
}

export async function interpretExperimentWithWiSim(
  experiment: ExperimentRun
): Promise<{ analysis: string; source: string }> {
  const response = await fetch('/api/wisim/lab/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      experimentName: experiment.name,
      datasetName: experiment.datasetName,
      algorithm: experiment.algorithm,
      hyperparameters: experiment.hyperparameters,
      metrics: experiment.metrics,
    }),
  });

  if (!response.ok) {
    throw new Error('WiSim Lab experiment interpretation failed');
  }

  return await response.json();
}

// Re-export for backward compatibility
export const fetchGroqStatus = fetchWiSimEngineStatus;
export const streamChatWithGroq = streamChatWithCopilot;
export const generateStructuredFeasibility = generateWiSimFeasibility;
export const interpretExperimentWithGroq = interpretExperimentWithWiSim;
