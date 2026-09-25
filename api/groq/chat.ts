import { endSse, getGroqClient, jsonBody, methodNotAllowed, selectedModel, sseHeaders, writeSse } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const body = jsonBody(req);
  const messages = Array.isArray(body.messages)
    ? body.messages
        .filter((message: any) => message && typeof message.content === 'string' && ['user', 'assistant', 'system'].includes(message.role))
        .map((message: any) => ({ role: message.role, content: String(message.content).slice(0, 15000) }))
    : [];
  if (!messages.length) return res.status(400).json({ error: 'Messages array is required' });

  sseHeaders(res);
  const groq = getGroqClient();
  if (!groq) {
    const last = messages[messages.length - 1]?.content || '';
    const reply = `### WiSim AI Research Guidance\n\nYour idea is ready for structured validation. Start with a deterministic baseline, define the primary metric, profile the dataset for leakage and class imbalance, then run a measured comparison in Experiment Lab.\n\n**Next step:** ${last.toLowerCase().includes('data') ? 'open Data Lab and inspect schema, missingness, and label balance.' : 'frame the problem, constraints, and success criteria before selecting a model.'}`;
    for (const chunk of reply.match(/.{1,90}(?:\s|$)/g) || [reply]) {
      writeSse(res, { content: chunk });
      await new Promise((resolve) => setTimeout(resolve, 12));
    }
    return endSse(res);
  }

  try {
    const completion = await groq.chat.completions.create({
      model: selectedModel(body.model),
      messages: [
        {
          role: 'system',
          content: `You are WiSim AI, an AI research assistant for machine learning feasibility, empirical analysis, resource simulation, and deployment planning. Distinguish measured results from estimates. Current project context: ${JSON.stringify(body.projectContext || {})}`,
        },
        ...messages,
      ],
      temperature: typeof body.temperature === 'number' ? body.temperature : 0.3,
      stream: true,
    });
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) writeSse(res, { content });
    }
    return endSse(res);
  } catch (error) {
    console.error('AI chat error', error);
    writeSse(res, { error: 'We could not complete this analysis. Please try again.' });
    return endSse(res);
  }
}
