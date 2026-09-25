import { fallbackAnalysis, groqCompletion, hasGroqKey, jsonBody, methodNotAllowed, selectedModel } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const body = jsonBody(req);
  if (!hasGroqKey()) return res.status(200).json(fallbackAnalysis(body));
  const prompt = `Analyze this machine learning project and return valid JSON only. Do not fabricate experimental measurements; clearly label theoretical estimates.\n${JSON.stringify({ projectName: body.projectName || 'ML Initiative', problemStatement: body.problemStatement || 'Not specified', taskType: body.taskType || 'classification', datasetInfo: body.datasetInfo || {}, constraints: body.constraints || {} })}`;
  try {
    const completion = await groqCompletion({ model: selectedModel(), messages: [{ role: 'system', content: 'You are WiSim AI. Return a structured feasibility report as valid JSON only.' }, { role: 'user', content: prompt }], temperature: 0.2, response_format: { type: 'json_object' } });
    return res.status(200).json({ ...JSON.parse(completion.choices?.[0]?.message?.content || '{}'), source: 'ai-analysis' });
  } catch (error) {
    console.error('AI feasibility error', error);
    return res.status(200).json({ ...fallbackAnalysis(body), source: 'fallback-after-error' });
  }
}
