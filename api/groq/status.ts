import { AVAILABLE_MODELS, methodNotAllowed } from './_shared';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const apiKey = process.env.GROQ_API_KEY;
  const configured = Boolean(apiKey && apiKey.trim().length > 10 && apiKey !== 'gsk_your_groq_api_key_here');
  return res.status(200).json({
    status: 'ok',
    configured,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    availableModels: AVAILABLE_MODELS,
    version: '1.0.0',
    provider: 'server-side AI',
  });
}
