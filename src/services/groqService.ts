import { ChatMessage, FeasibilityReport, GroqStatus, ExperimentRun } from '../types';

export async function fetchGroqStatus(): Promise<GroqStatus> {
  try {
    const res = await fetch('/api/groq/status');
    if (!res.ok) throw new Error('Status endpoint returned non-200');
    return await res.json();
  } catch (err) {
    return {
      configured: false,
      model: 'llama-3.3-70b-versatile',
      availableModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
      provider: 'Groq Cloud',
    };
  }
}

export async function streamChatWithGroq(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string,
  projectContext?: any,
  onChunk?: (token: string) => void,
  onError?: (err: string) => void
): Promise<string> {
  let fullResponse = '';

  try {
    const response = await fetch('/api/groq/chat', {
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
          // ignore partial JSON parse error
        }
      }
    }
  } catch (err: any) {
    console.error('Groq stream error:', err);
    onError?.(err.message || 'Stream communication failed');
    throw err;
  }

  return fullResponse;
}

export async function generateStructuredFeasibility(
  projectData: {
    projectName: string;
    problemStatement: string;
    taskType: string;
    datasetInfo?: any;
    constraints?: any;
  }
): Promise<FeasibilityReport> {
  const response = await fetch('/api/groq/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new Error('Failed to generate structured feasibility report');
  }

  return await response.json();
}

export async function interpretExperimentWithGroq(
  experiment: ExperimentRun
): Promise<{ analysis: string; source: string }> {
  const response = await fetch('/api/groq/interpret-experiment', {
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
    throw new Error('Failed to interpret experiment results via Groq');
  }

  return await response.json();
}
