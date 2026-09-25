# WiSim AI | From Idea to Deployment

WiSim AI is an intelligent research and experimentation platform for evaluating AI project feasibility, analyzing datasets, comparing machine-learning models, simulating training requirements, and planning deployment.

## Product journey

The interface is organized around one guided path:

**Idea → Plan → Data → Experiment → Evaluate → Deploy**

- **Home:** start with one plain-language idea prompt or open the optional AI Crop Disease Detection sample project.
- **My Projects:** return to the current project workspace and its saved context.
- **Playground:** use the persistent AI Copilot to refine the idea with streaming, project-aware guidance.
- **Reports:** review the blueprint, feasibility assumptions, risks, measured results, and deployment recommendations.
- **Data:** choose a sample dataset, prepare an upload, or learn what data the project needs before selecting technical controls.
- **Experiment:** begin in beginner mode with sensible defaults, or switch to advanced mode for algorithm and hyperparameter control.

The workspace keeps the active project context visible and presents one clear next action at each stage. Technical details remain available through the relevant stage instead of competing for attention on the home screen.

## Product Architecture & Subsystems

1. **WiSim AI Copilot**
   - Project-aware conversational research copilot with guided workflows and contextual recommendations.
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
   - Production deployment planner generating practical FastAPI microservices, slim multi-stage Dockerfiles, and Kubernetes Horizontal Pod Autoscaler (HPA) manifests.

---

## Backend Orchestration & Inference Configuration

WiSim AI uses a modular inference provider interface on an Express backend (`server.ts` and `server/orchestrator/`). Vercel deployments also expose native serverless adapters under `api/wisim/` and `api/groq/`, so the browser routes remain functional when the frontend is deployed without the Express process.

### API key configuration

Store your Groq key exclusively in server environment variables or Vercel project secrets:

```bash
GROQ_API_KEY="gsk_your_groq_api_key_here"
GROQ_MODEL="llama-3.3-70b-versatile"
```

The API key is strictly server-side and is never exposed in client bundles, browser storage, or network responses. When no provider is configured, the dataset, feasibility, resource, deployment, and genuine local experiment workflows remain usable in offline mode.

### Run the platform

```bash
npm install
npm run dev       # Vite + Express development server
npm run lint      # TypeScript validation
npm run build     # Production frontend build
npm start         # Express production server
```

WiSim AI clearly distinguishes measured experiment results from theoretical AI-generated estimates. Provider details are retained in technical documentation and diagnostics, not presented as the product experience.
