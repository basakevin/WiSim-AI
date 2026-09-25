import { endSse, groqStream, hasGroqKey, jsonBody, methodNotAllowed, selectedModel, sseHeaders, writeSse } from './shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const body = jsonBody(req);
  const messages = Array.isArray(body.messages) ? body.messages.filter((message: any) => message && typeof message.content === 'string' && ['user', 'assistant', 'system'].includes(message.role)).map((message: any) => ({ role: message.role, content: String(message.content).slice(0, 15000) })) : [];
  if (!messages.length) return res.status(400).json({ error: 'Messages array is required' });
  sseHeaders(res);

  if (!hasGroqKey()) {
    const last = messages[messages.length - 1]?.content || '';
    const reply = `### WiSim AI Research Guidance\n\nYour idea is ready for structured validation. Start with a deterministic baseline, define the primary metric, profile the dataset for leakage and class imbalance, then run a measured comparison in Experiment Lab.\n\n**Next step:** ${last.toLowerCase().includes('data') ? 'open Data Lab and inspect schema, missingness, and label balance.' : 'frame the problem, constraints, and success criteria before selecting a model.'}`;
    for (const chunk of reply.match(/.{1,90}(?:\s|$)/g) || [reply]) { writeSse(res, { content: chunk }); await new Promise((resolve) => setTimeout(resolve, 12)); }
    return endSse(res);
  }

  try {
    const upstream = await groqStream({ model: selectedModel(body.model), messages: [{ role: 'system', content: `You are WiSim AI, an AI research assistant for machine learning feasibility, empirical analysis, resource simulation, and deployment planning. Distinguish measured results from estimates. Current project context: ${JSON.stringify(body.projectContext || {})}` }, ...messages], temperature: typeof body.temperature === 'number' ? body.temperature : 0.3 });
    const reader = upstream.body?.getReader();
    if (!reader) throw new Error('Streaming response unavailable');
    const decoder = new TextDecoder(); let buffer = '';
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n'); buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ') || line.slice(6).trim() === '[DONE]') continue;
        try { const data = JSON.parse(line.slice(6)); const content = data.choices?.[0]?.delta?.content; if (content) writeSse(res, { content }); } catch { /* ignore partial event */ }
      }
    }
    return endSse(res);
  } catch (error) {
    console.error('AI chat error', error);
    writeSse(res, { error: 'We could not complete this analysis. Please try again.' });
    return endSse(res);
  }
}
