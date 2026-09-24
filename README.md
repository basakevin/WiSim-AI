# WiSim AI | From Idea to Deployment

WiSim AI is an intelligent research and experimentation platform for evaluating AI project feasibility, analyzing datasets, comparing machine-learning models, simulating training requirements, and planning deployment.

## Product Architecture & Subsystems

1. **WiSim AI Copilot**
   - Distinctive conversational research copilot with project-aware memory, guided workflows, contextual follow-ups, and interactive recommendations.
   - Generates actionable PyTorch training loops, ONNX quantization scripts, and deployment configurations.

2. **WiSim Intelligence**
   - Automated feasibility, risk, and algorithmic trade-off analysis engine.
   - Schema-validated structured reports evaluating task formulation, sample size requirements, class imbalance mitigations, technical risk matrices, and cloud compute budgets.

3. **WiSim Lab**
   - Genuine empirical machine-learning experiment environment.
   - Executes real mathematical training solvers (Logistic Regression with gradient descent, Multilayer Perceptrons with backpropagation, Random Forest ensembles, and k-NN).
   - Measures true empirical metrics: confusion matrices, loss trajectories, precision, recall, F1-scores, and per-sample inference latency.
   - Interprets real measured experiment results without fabricating hypothetical numbers.

4. **WiSim Data Studio**
   - Tabular dataset workspace with live statistical profiling (mean, standard deviation, min, max, distributions), interactive histograms, and train/test partition controls.

5. **WiSim Training Studio**
   - Cloud compute and resource simulation engine.
   - Hardware calculators for NVIDIA H100, A100, L4, T4, and CPU instances comparing On-Demand vs Spot pricing across AWS and GCP.

6. **WiSim Deploy**
   - Production deployment planner generating production-ready FastAPI microservices, slim multi-stage Dockerfiles, and Kubernetes Horizontal Pod Autoscaler (HPA) manifests.

---

## Backend Orchestration & Inference Configuration

WiSim AI utilizes a modular inference provider interface on an Express backend (`server.ts` and `server/orchestrator/`). High-speed foundational model inference is executed server-side via the official Groq SDK.

### 1. API Key Configuration
Store your Groq key exclusively in the server environment:

```bash
# In .env or platform secrets:
GROQ_API_KEY="gsk_your_groq_api_key_here"

# Optional: Default model (defaults to llama-3.1-8b-instant with automatic fallback)
GROQ_MODEL="llama-3.1-8b-instant"
```

*Security: The API key is strictly server-side and is never exposed in client bundles, browser storage, or network responses.*

### 2. Run the Platform
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 3. Technical Transparency
WiSim AI utilizes open-weights foundation models (such as Meta Llama 3) accelerated via Groq LPU processing clusters for high-speed conversational synthesis and risk extraction. WiSim AI clearly distinguishes empirical measurements (from WiSim Lab) from theoretical AI-generated projections.
