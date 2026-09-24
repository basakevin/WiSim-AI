import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertCircle,
  HelpCircle,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Workflow,
  Cpu,
  Database
} from 'lucide-react';
import { ChatMessage, ProjectContext, ExperimentRun } from '../types';
import { streamChatWithCopilot } from '../services/wisimService';

interface CopilotViewProps {
  currentProject: ProjectContext;
  experiments: ExperimentRun[];
  activeModel: string;
  onModelChange: (model: string) => void;
  availableModels: string[];
  onNavigateToTab?: (tab: string) => void;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  currentProject,
  experiments,
  activeModel,
  onModelChange,
  availableModels,
  onNavigateToTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-wisim',
      role: 'assistant',
      content: `Hello! I'm WiSim AI, your AI research and simulation copilot. Describe your project idea, and I'll help you evaluate its feasibility, select appropriate models, estimate resources and plan deployment.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isStreaming) return;

    setErrorMessage(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `asst-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, initialAssistantMsg]);
    setIsStreaming(true);

    const projectContextData = {
      projectName: currentProject.name,
      taskType: currentProject.taskType,
      primaryMetric: currentProject.primaryMetric,
      targetLatencyMs: currentProject.targetLatencyMs,
      budgetMonthlyUsd: currentProject.budgetMonthlyUsd,
      recentExperimentSummary: experiments.slice(0, 3).map((e) => ({
        algorithm: e.algorithm,
        testAccuracy: e.metrics.testAccuracy,
        f1Score: e.metrics.f1Score,
        latencyMs: e.metrics.inferenceLatencyMs,
      })),
    };

    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      await streamChatWithCopilot(
        apiMessages,
        activeModel,
        projectContextData,
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        (errorStr) => {
          setErrorMessage(errorStr);
        }
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing request in WiSim AI Copilot');
    } finally {
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Hello! I'm WiSim AI, your AI research and simulation copilot. Describe your project idea, and I'll help you evaluate its feasibility, select appropriate models, estimate resources and plan deployment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Structured guided workflow triggers
  const workflowActions = [
    {
      label: 'Evaluate Feasibility',
      prompt: `Please evaluate the algorithmic feasibility and technical risks for ${currentProject.name}. Suggest suitable loss functions, sample sizes, and baseline models.`,
      icon: Workflow,
    },
    {
      label: 'Compare Algorithms',
      prompt: `Compare the trade-offs between Gradient Boosted Decision Trees and Multilayer Perceptrons for our ${currentProject.taskType} task. Focus on training complexity and inference latency.`,
      icon: Layers,
    },
    {
      label: 'Estimate GPU & Costs',
      prompt: `Estimate training compute hours, required GPU VRAM, and monthly serving costs for ${currentProject.name} to stay under our $${currentProject.budgetMonthlyUsd}/month budget.`,
      icon: Cpu,
    },
    {
      label: 'Export PyTorch Pipeline',
      prompt: `Generate a production-grade PyTorch training loop with cosine learning rate scheduling, mixed precision, and ONNX export for ${currentProject.name}.`,
      icon: Zap,
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-3 sm:px-6">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/40 text-cyan-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                WiSim AI Copilot
              </span>
              <span className="rounded bg-cyan-950/60 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-800/40">
                Project Memory Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Context: <span className="text-slate-200 font-medium">{currentProject.name}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">
            <span className="text-slate-500 text-[11px]">Model:</span>
            <select
              value={activeModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="bg-transparent font-mono text-xs text-cyan-400 focus:outline-none cursor-pointer"
            >
              {availableModels.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-slate-200">
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                  isUser
                    ? 'border-indigo-600 bg-indigo-900/60 text-indigo-300'
                    : 'border-cyan-800 bg-cyan-950 text-cyan-400'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div className="group relative max-w-2xl sm:max-w-3xl space-y-1">
                <div className={`flex items-center space-x-2 text-[11px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{isUser ? 'You' : 'WiSim AI'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-950/40 rounded-tr-none'
                      : 'border border-slate-800/90 bg-slate-950/80 text-slate-200 shadow-md shadow-slate-950/50 rounded-tl-none'
                  }`}
                >
                  <div className="prose prose-invert prose-xs sm:prose-sm max-w-none whitespace-pre-wrap font-sans">
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block h-3.5 w-1.5 ml-1 bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Copy button */}
                {!isUser && msg.content && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center space-x-1 rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400 hover:text-white border border-slate-700/60 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {errorMessage && (
          <div className="flex items-center space-x-2 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Guided Workflow Pills */}
      <div className="border-t border-slate-800/70 bg-slate-950/40 px-4 py-2 sm:px-6">
        <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1 font-medium">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Guided AI Research Actions:</span>
          </span>
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('feasibility')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center cursor-pointer"
            >
              <span>Open WiSim Intelligence</span>
              <ArrowRight className="h-3 w-3 ml-0.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {workflowActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(action.prompt)}
                disabled={isStreaming}
                className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-700/60 hover:text-cyan-300 hover:bg-slate-800/80 transition-all cursor-pointer"
              >
                <Icon className="h-3 w-3 text-cyan-400" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="border-t border-slate-800 bg-slate-950/80 p-3 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask WiSim AI about ${currentProject.name} algorithms, data requirements, or PyTorch code...`}
            disabled={isStreaming}
            className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3 pr-24 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />

          <div className="absolute right-2 flex items-center space-x-1">
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                input.trim() && !isStreaming
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/30 hover:from-cyan-400 hover:to-indigo-500 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isStreaming ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span className="flex items-center space-x-1">
            <Info className="h-3 w-3" />
            <span>WiSim Intelligence Orchestration • Context-Aware Research Memory</span>
          </span>
          <span>Shift + Enter for newline</span>
        </div>
      </div>
    </div>
  );
};
