import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  GitBranch, 
  Package, 
  Server, 
  Eye, 
  Sparkles,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { type ScanResponse } from '../../types/api.types';
import { a11yApi } from '../../services/a11yApi';

interface ScanProgressProps {
  scanId: string;
  onScanCompleted: () => void;
  onReset: () => void;
}

interface StepConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PIPELINE_STEPS: StepConfig[] = [
  { key: 'queued', label: 'Queue Runner', description: 'Allocating sandbox execution runner', icon: RefreshCw },
  { key: 'cloning', label: 'Git Clone', description: 'Cloning repository tree into isolated runner', icon: GitBranch },
  { key: 'installing', label: 'Install Packages', description: 'Installing dependencies with npm', icon: Package },
  { key: 'starting', label: 'Dev Server Boot', description: 'Launching application instance on dynamic port', icon: Server },
  { key: 'scanning', label: 'WCAG Crawl & axe', description: 'Crawling routes with Playwright and axe-core', icon: Eye },
  { key: 'completed', label: 'Finalize Findings', description: 'Processing violation nodes and mapping AST', icon: Sparkles }
];

const STEP_ORDER = ['queued', 'cloning', 'installing', 'starting', 'scanning', 'completed'];

export const ScanProgress: React.FC<ScanProgressProps> = ({ scanId, onScanCompleted, onReset }) => {
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedId, setCopiedId] = useState(false);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling effect
  useEffect(() => {
    let stopped = false;
    let timeout: ReturnType<typeof setTimeout>;
    let emptyIssuesCheckCount = 0;

    const poll = async () => {
      try {
        const data = await a11yApi.getScan(scanId);
        if (stopped) return;
        setScanData(data);
        setPollingError(null);

        if (data.status === 'completed') {
          // Check if axe findings have been recorded
          try {
            const issuesRes = await a11yApi.getIssues(scanId);
            if (issuesRes.issues && issuesRes.issues.length > 0) {
              onScanCompleted();
              return;
            }
          } catch {
            // Temporary issue fetch retry
          }

          emptyIssuesCheckCount++;
          if (emptyIssuesCheckCount >= 6) {
            onScanCompleted();
            return;
          }
        }

        if (data.status === 'failed') {
          return;
        }
      } catch (err) {
        if (!stopped) {
          setPollingError(err instanceof Error ? err.message : 'Unable to fetch scan status');
        }
      }

      if (!stopped) {
        timeout = setTimeout(poll, 1500);
      }
    };

    void poll();

    return () => {
      stopped = true;
      clearTimeout(timeout);
    };
  }, [scanId, onScanCompleted]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(scanId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (scanData?.status === 'failed') {
    return (
      <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-5 my-8 shadow-2xl backdrop-blur-md">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Accessibility Scan Failed</h3>
          <p className="text-sm text-rose-300 mt-2 font-mono bg-rose-950/30 p-3 rounded-xl border border-rose-500/20 break-words text-left">
            {scanData.error || 'The scan runner encountered an error while booting or analyzing the target repository.'}
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <button 
            onClick={onReset} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Another Repository</span>
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = scanData?.status || 'queued';
  const currentIndex = STEP_ORDER.indexOf(currentStatus);
  const activeStepIdx = currentIndex >= 0 ? currentIndex : 0;
  const progressPercent = typeof scanData?.progress === 'number' ? scanData.progress : Math.min((activeStepIdx + 1) * 16, 95);

  return (
    <div className="max-w-3xl mx-auto space-y-6 my-6">
      {/* Main Status Container */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-75"></div>

        <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                <h2 className="text-lg font-bold text-slate-100">Audit Pipeline Executing</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sandboxed crawler analyzing routes for WCAG compliance
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
                <span className="text-slate-500">Elapsed:</span>
                <span className="font-semibold text-indigo-300">{formatElapsed(elapsedSeconds)}</span>
              </div>
              <button
                onClick={onReset}
                className="text-xs text-slate-400 hover:text-slate-200 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Shimmer Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium capitalize">
                {currentStatus.replace('_', ' ')} Phase
              </span>
              <span className="font-mono text-indigo-400 font-semibold">{progressPercent}%</span>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-700 shimmer-bg"
                style={{ width: `${Math.max(progressPercent, 6)}%` }}
              />
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className="space-y-3 pt-2">
            {PIPELINE_STEPS.map((step, idx) => {
              const isPassed = activeStepIdx > idx;
              const isCurrent = activeStepIdx === idx;
              const isPending = activeStepIdx < idx;
              const StepIcon = step.icon;

              return (
                <div 
                  key={step.key}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-950 border-indigo-500/60 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/20'
                      : isPassed
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                      : 'bg-slate-950/20 border-slate-900 text-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div 
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        isCurrent
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-500/20'
                          : isPassed
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <StepIcon className="w-4 h-4 text-indigo-400 animate-spin" />
                      ) : (
                        <span className="text-xs font-mono">{idx + 1}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isCurrent ? 'text-slate-100' : isPassed ? 'text-slate-300' : 'text-slate-500'}`}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 animate-pulse">
                            Processing
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {isPassed && (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        Done
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[11px] text-indigo-400 font-mono animate-pulse">
                        Active...
                      </span>
                    )}
                    {isPending && (
                      <span className="text-[11px] text-slate-600 font-mono">
                        Waiting
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scan Info Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Scan ID:</span>
              <code className="bg-slate-950 px-2 py-0.5 rounded font-mono text-indigo-300 border border-slate-800 text-[11px]">
                {scanId}
              </code>
              <button
                onClick={handleCopyId}
                className="p-1 hover:text-slate-200 transition-colors cursor-pointer"
                title="Copy Scan ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {pollingError && (
              <span className="text-amber-400 text-[11px]">{pollingError}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};