export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  const body = typeof req.body === 'object' ? req.body : (() => { try { return JSON.parse(req.body || '{}'); } catch { return {}; } })();
  const messages = Array.isArray(body.messages) ? body.messages.filter((m: any) => m && typeof m.content === 'string' && ['system', 'user', 'assistant'].includes(m.role)).map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 15000) })) : [];
  if (!messages.length) return res.status(400).json({ error: 'Messages array is required' });
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8'); res.setHeader('Cache-Control', 'no-cache, no-transform'); res.setHeader('Connection', 'keep-alive');
  const emit = (value: any) => res.write(`data: ${JSON.stringify(value)}\n\n`);
  const finish = () => { res.write('data: [DONE]\n\n'); res.end(); };
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.length < 10 || apiKey === 'gsk_your_groq_api_key_here') {
    const last = messages[messages.length - 1].content || '';
    const reply = `### WiSim AI Research Guidance\n\nYour idea is ready for structured validation. Start with a deterministic baseline, define the primary metric, profile the dataset for leakage and class imbalance, then run a measured comparison in Experiment Lab.\n\n**Next step:** ${last.toLowerCase().includes('data') ? 'open Data Lab and inspect schema, missingness, and label balance.' : 'frame the problem, constraints, and success criteria before selecting a model.'}`;
    for (const chunk of reply.match(/.{1,90}(?:\s|$)/g) || [reply]) { emit({ content: chunk }); await new Promise((resolve) => setTimeout(resolve, 10)); }
    return finish();
  }
  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: body.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', messages, temperature: typeof body.temperature === 'number' ? body.temperature : 0.3, stream: true }) });
    if (!upstream.ok || !upstream.body) throw new Error('AI stream unavailable');
    const reader = upstream.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
    while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const lines = buffer.split('\n'); buffer = lines.pop() || ''; for (const line of lines) { if (!line.startsWith('data: ') || line.slice(6).trim() === '[DONE]') continue; try { const data = JSON.parse(line.slice(6)); const content = data.choices?.[0]?.delta?.content; if (content) emit({ content }); } catch {} } }
    return finish();
  } catch { emit({ error: 'We could not complete this analysis. Please try again.' }); return finish(); }
}
