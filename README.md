# WiSim AI | From Idea to Deployment

WiSim AI is an end-to-end Machine Learning research and deployment copilot platform. It guides engineers, data scientists, and ML teams from initial concept formulation through structured feasibility analysis, real empirical dataset experiments, cloud budget optimization, and production deployment.

## Features

1. **AI Project Copilot (Powered by Groq API)**
   - Ultra-fast streaming conversational intelligence with `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`.
   - Context-aware project guidance, algorithm trade-offs, architecture reasoning, and PyTorch/ONNX code generation.

2. **Structured Feasibility Analyzer**
   - Schema-validated structured technical evaluation:
     - Problem formulation & data feasibility score
     - Recommended machine learning architectures & trade-offs
     - Class balance & sample size requirements
     - Risk breakdown (overfitting, distribution shift, latency SLA)
     - Estimated compute & infrastructure costs
     - Production deployment path & Go/No-Go decision matrix

3. **Dataset Lab & Real ML Experiment Engine**
   - Real datasets (California Housing, Churn & Risk classification, Customer Intent NLP, Time-Series Sensor, etc.).
   - Genuine empirical machine learning execution:
     - Real training solvers (Logistic Regression, Decision Trees/Random Forests, KNN, Linear SVM, Deep Multi-layer Perceptrons with Backpropagation).
     - Actual empirical metrics: Loss convergence per epoch, Accuracy, F1-Score, Precision, Recall, Confusion Matrix, Latency per sample, Parameter footprint.
   - **Groq Experiment Interpreter**: Groq takes *real empirical metrics* from your experiment runs and diagnoses bias/variance, convergence rates, and architectural adjustments—strictly grounding explanations in real data without inventing fake benchmarks.

4. **Cloud Budget & Resource Optimizer**
   - Real compute cost calculators for NVIDIA H100, A100, L4, T4, and CPU instances across cloud providers (AWS, GCP, Azure, CoreWeave).
   - Training hours vs spot pricing calculations and inference token serving costs (vLLM / TensorRT-LLM vs Serverless endpoints).

5. **Deployment Studio**
   - Automated generation of production artifacts:
     - Dockerfile with GPU/CUDA or ONNX Runtime acceleration
     - FastAPI inference server with input validation & health checks
     - Kubernetes manifests (HPA, GPU resource limits, service definition)
     - Triton / TorchServe configuration guides

---

## Environment Setup & Groq API Configuration

WiSim AI communicates with the Groq API exclusively through a secure backend Express route. The API key is **never** sent to the client browser, bundle, or logs.

### 1. Obtain a Groq API Key
1. Sign in or register at [Groq Console](https://console.groq.com/).
2. Navigate to **API Keys** and generate a new key (`gsk_...`).

### 2. Configure Environment Variables
Create or update your `.env` file (or set secrets in your hosting provider's dashboard):

```bash
# Required: Your Groq API Key
GROQ_API_KEY="gsk_your_groq_api_key_here"

# Optional: Default Groq model (defaults to llama-3.3-70b-versatile)
GROQ_MODEL="llama-3.3-70b-versatile"
```

Supported Groq models:
- `llama-3.3-70b-versatile` (Recommended: high reasoning capability, excellent for deep ML trade-offs)
- `llama-3.1-8b-instant` (Ultra-low latency, optimal for rapid interactive suggestions)
- `mixtral-8x7b-32768`
- `gemma2-9b-it`

### 3. Run the Application
```bash
# Install dependencies
npm install

# Start development server (Full-stack with Vite + Express)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
