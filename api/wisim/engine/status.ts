import { AVAILABLE_MODELS, methodNotAllowed } from '../../groq/_shared';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const apiKey = process.env.GROQ_API_KEY;
  const configured = Boolean(apiKey && apiKey.trim().length > 10 && apiKey !== 'gsk_your_groq_api_key_here');
  return res.status(200).json({
    platform: 'WiSim AI',
    tagline: 'Simulate. Validate. Build.',
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
      provider: 'WiSim server-side inference',
      isConfigured: configured,
      activeModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      availableModels: AVAILABLE_MODELS,
      hardwareAcceleration: 'Server-side inference',
    },
  });
}
