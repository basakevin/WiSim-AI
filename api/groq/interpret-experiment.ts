import { fallbackInterpretation, groqCompletion, hasGroqKey, jsonBody, methodNotAllowed, selectedModel } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const body = jsonBody(req);
  if (!body.metrics) return res.status(400).json({ error: 'Metrics are required to interpret an experiment' });
  if (!hasGroqKey()) return res.status(200).json(fallbackInterpretation(body.metrics, body.algorithm, body.datasetName));
  const prompt = `Interpret the following measured ML experiment. Ground the analysis strictly in the provided metrics. Do not invent benchmarks.\n${JSON.stringify({ experimentName: body.experimentName || 'Run #1', datasetName: body.datasetName || 'Dataset', algorithm: body.algorithm || 'ML Model', hyperparameters: body.hyperparameters || {}, metrics: body.metrics })}`;
  try {
    const completion = await groqCompletion({ model: selectedModel(), messages: [{ role: 'system', content: 'You are WiSim AI, a rigorous ML research scientist. Distinguish measured metrics from estimates.' }, { role: 'user', content: prompt }], temperature: 0.2 });
    return res.status(200).json({ analysis: completion.choices?.[0]?.message?.content || 'Unable to generate interpretation.', source: 'ai-analysis' });
  } catch (error) {
    console.error('AI experiment interpretation error', error);
    return res.status(200).json(fallbackInterpretation(body.metrics, body.algorithm, body.datasetName));
  }
}
