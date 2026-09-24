import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { ModularInferenceEngine } from './server/services/modularInference';
import { FeasibilityEngine } from './server/orchestrator/feasibilityEngine';
import { ExperimentInterpreter } from './server/orchestrator/experimentInterpreter';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize WiSim Modular Services
const inferenceEngine = new ModularInferenceEngine();
const feasibilityEngine = new FeasibilityEngine(inferenceEngine);
const experimentInterpreter = new ExperimentInterpreter(inferenceEngine);

// 1. Engine Status & Technical Transparency
app.get('/api/wisim/engine/status', async (req, res) => {
  const status = await inferenceEngine.getStatus();
  res.json({
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
      provider: status.providerName,
      isConfigured: status.isConfigured,
      activeModel: status.activeModel,
      availableModels: status.availableModels,
      hardwareAcceleration: 'Groq LPU Processing Units',
    },
  });
});

// Backward compatibility status
app.get('/api/groq/status', async (req, res) => {
  const status = await inferenceEngine.getStatus();
  res.json({
    status: 'ok',
    configured: status.isConfigured,
    model: status.activeModel,
    availableModels: status.availableModels,
    provider: 'Groq Cloud',
  });
});

// 2. WiSim AI Copilot - Conversational Research Copilot
app.post('/api/wisim/copilot', async (req, res) => {
  const { messages, model, temperature, projectContext } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const validatedMessages = messages
    .filter((m: any) => m && typeof m.content === 'string' && ['user', 'assistant', 'system'].includes(m.role))
    .map((m: any) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: String(m.content).slice(0, 15000),
    }));

  const systemPrompt = `You are WiSim AI Copilot, the AI research and simulation copilot of the WiSim AI platform.
You specialize in machine learning, project feasibility, empirical data analysis, model selection, training simulation, resource optimization, and deployment planning.
Explain technical trade-offs, identify missing information, and distinguish estimated results from measured experiment results.
Provide actionable PyTorch, Scikit-Learn, and deployment configurations when requested.
Always maintain high scientific rigor, clarity, and precision.
Do not include unnecessary statements about the underlying inference provider in routine responses. If users explicitly ask about the underlying models or providers, answer accurately and transparently that WiSim AI utilizes Groq LPU inference for high-speed computation.
${projectContext ? `\nCurrent Active Project Memory Context:\n${JSON.stringify(projectContext, null, 2)}` : ''}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await inferenceEngine.executeChatStream(
      validatedMessages,
      systemPrompt,
      { model, temperature },
      (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
    );
  } catch (error: any) {
    console.error('WiSim Copilot Stream Error:', error);
    res.write(`data: ${JSON.stringify({ error: error?.message || 'Error processing request' })}\n\n`);
  }

  res.write('data: [DONE]\n\n');
  res.end();
});

// Backward compatibility chat route
app.post('/api/groq/chat', async (req, res) => {
  // Delegate directly to copilot
  const { messages, model, temperature, projectContext } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Bad request' });

  const systemPrompt = `You are WiSim AI Copilot, an AI research and simulation copilot. Explain technical trade-offs, identify missing information, and distinguish estimated results from measured experiment results.
${projectContext ? `\nCurrent Project Context:\n${JSON.stringify(projectContext, null, 2)}` : ''}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await inferenceEngine.executeChatStream(
      messages,
      systemPrompt,
      { model, temperature },
      (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
    );
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ error: error?.message || 'Error processing request' })}\n\n`);
  }

  res.write('data: [DONE]\n\n');
  res.end();
});

// 3. WiSim Intelligence - Structured Feasibility & Risk Analysis
app.post('/api/wisim/intelligence/feasibility', async (req, res) => {
  try {
    const report = await feasibilityEngine.evaluateProject(req.body);
    res.json(report);
  } catch (err: any) {
    console.error('Feasibility evaluation failed:', err);
    res.status(500).json({ error: 'Evaluation failed', details: err?.message });
  }
});

// Backward compatibility analyze route
app.post('/api/groq/analyze', async (req, res) => {
  try {
    const report = await feasibilityEngine.evaluateProject(req.body);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Analysis failed', details: err?.message });
  }
});

// 4. WiSim Lab - Empirical Experiment Interpretation
app.post('/api/wisim/lab/interpret', async (req, res) => {
  try {
    const result = await experimentInterpreter.interpretRun(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Experiment interpretation failed:', err);
    res.status(500).json({ error: 'Interpretation failed', details: err?.message });
  }
});

// Backward compatibility interpret route
app.post('/api/groq/interpret-experiment', async (req, res) => {
  try {
    const result = await experimentInterpreter.interpretRun(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Interpretation failed', details: err?.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WiSim AI platform server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start WiSim AI server:', err);
});
