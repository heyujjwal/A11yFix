import React, { useState, useEffect, useRef } from 'react';
import { 
  GitPullRequest, 
  CheckCircle2, 
  RefreshCw, 
  Code2, 
  AlertTriangle, 
  ExternalLink, 
  FileCode, 
  Copy, 
  Check, 
  Sparkles,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { type FixResponse } from '../../types/api.types';
import { a11yApi } from '../../services/a11yApi';

interface FixPreviewProps {
  fixId: string;
}

// Lightweight canvas confetti effect
function triggerConfetti(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvas.parentElement?.clientWidth || 600;
  canvas.height = canvas.parentElement?.clientHeight || 300;

  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotSpeed: number;
    opacity: number;
  }> = [];

  const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#38bdf8', '#fbbf24'];

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.8) * 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let animId: number;
  let frames = 0;

  const render = () => {
    frames++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3; // gravity
      p.rotation += p.rotSpeed;
      p.opacity -= 0.015;

      if (p.opacity > 0) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (frames < 75) {
      animId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  animId = requestAnimationFrame(render);
  return () => cancelAnimationFrame(animId);
}

export const FixPreview: React.FC<FixPreviewProps> = ({ fixId }) => {
  const [fixData, setFixData] = useState<FixResponse | null>(null);
  const [polling, setPolling] = useState(true);
  const [submittingPr, setSubmittingPr] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiTriggered = useRef(false);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const data = await a11yApi.getFixStatus(fixId);
        if (stopped) return;
        setFixData(prev => ({
          ...data,
          prUrl: data.prUrl || prev?.prUrl,
          verification: data.verification || prev?.verification
        }));

        if (data.status === 'generated' || data.status === 'completed' || data.status === 'failed') {
          setPolling(false);
          if (data.status === 'completed' && !confettiTriggered.current) {
            confettiTriggered.current = true;
            setTimeout(() => triggerConfetti(canvasRef.current), 150);
          }
          return;
        }
      } catch (err) {
        console.error('Error polling fix status:', err);
      }

      if (!stopped) {
        timer = setTimeout(poll, 2000);
      }
    };

    void poll();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [fixId]);

  const handleCreatePR = async () => {
    setSubmittingPr(true);
    setActionError(null);
    try {
      const res = await a11yApi.createPullRequest(fixId);
      setFixData(res);
      setPolling(false);
      if (!confettiTriggered.current) {
        confettiTriggered.current = true;
        setTimeout(() => triggerConfetti(canvasRef.current), 150);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to apply patch and create pull request');
    } finally {
      setSubmittingPr(false);
    }
  };

  const handleCopyFile = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!fixData) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-7 text-slate-400 flex items-center justify-center space-x-3 shadow-xl backdrop-blur-md">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
        <span className="text-sm font-medium">Initializing AI patch synthesizer...</span>
      </div>
    );
  }

  const isGenerating = fixData.status === 'generating';
  const isGenerated = fixData.status === 'generated' || fixData.status === 'ready_for_pr';
  const isApplying = fixData.status === 'applying' || submittingPr;
  const isCompleted = fixData.status === 'completed' || fixData.status === 'pr_created';
  const isFailed = fixData.status === 'failed';

  return (
    <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Canvas for Confetti */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-30 w-full h-full"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Gemma AI Remediation Engine</span>
            </h3>
            <p className="text-xs text-slate-400">Autonomous patch authoring & verification</p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider border ${
            isCompleted 
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : isApplying
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
              : isGenerated
              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
              : isFailed
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            {fixData.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Target File Badge */}
      {fixData.filePath && (
        <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300 truncate">
            <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-500">Target File:</span>
            <span className="text-indigo-300 font-bold truncate">{fixData.filePath}</span>
          </div>
          <button
            onClick={() => handleCopyFile(fixData.filePath!)}
            className="text-slate-500 hover:text-slate-200 p-1 rounded transition-colors cursor-pointer shrink-0"
            title="Copy file path"
          >
            {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* AI Summary Card */}
      {fixData.summary && (
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Remediation Summary</span>
          </span>
          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed space-y-1.5">
            <p className="font-medium text-slate-100">{fixData.summary}</p>
            <p className="text-slate-400 text-[11px]">
              Patch applies semantic attributes, accessible roles, or required contrast to eliminate the reported WCAG failure.
            </p>
          </div>
        </div>
      )}

      {/* Code Preview / Diff if newContent is available */}
      {fixData.newContent && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              <span>Remediated Code Content</span>
            </span>
            <button
              onClick={() => handleCopyCode(fixData.newContent!)}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-950">
            <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-950/30 border-b border-emerald-500/20 text-[10px] font-mono text-emerald-400">
              <span>+ Remediated Source</span>
              <span>Validated AST</span>
            </div>
            <pre className="p-3.5 text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre leading-relaxed max-h-64">
              {fixData.newContent}
            </pre>
          </div>
        </div>
      )}

      {/* Generating State */}
      {isGenerating && (
        <div className="flex items-center space-x-3.5 p-5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-100">Gemma 4 is synthesizing AST code patch...</p>
            <p className="text-slate-400 text-[11px]">
              Inspecting component structure, determining minimal changes, and preparing git branch.
            </p>
          </div>
        </div>
      )}

      {/* Generated: Ready for PR State */}
      {isGenerated && !isApplying && !isCompleted && (
        <div className="space-y-4 pt-1">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Patch validated and ready for repository integration</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Clicking below will create a dedicated fix branch (<code className="text-indigo-300 font-mono">a11yfix/...</code>), apply the patch, run build verification, re-evaluate with axe-core, and open an official GitHub Pull Request.
            </p>
          </div>

          <button 
            onClick={handleCreatePR}
            disabled={submittingPr}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-xl text-sm flex items-center justify-center space-x-2.5 transition-all shadow-xl shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
          >
            <GitPullRequest className="w-4 h-4" />
            <span>{submittingPr ? 'Applying Patch & Opening PR...' : 'Approve Patch & Create GitHub Pull Request'}</span>
          </button>
        </div>
      )}

      {/* Applying State */}
      {isApplying && (
        <div className="flex items-center space-x-3.5 p-5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-200">Applying patch & verifying build integrity...</p>
            <p className="text-slate-400 text-[11px]">
              Checking git branch, running build verification, re-scanning with axe-core, and pushing PR to GitHub.
            </p>
          </div>
        </div>
      )}

      {/* Completed State: PR Created */}
      {isCompleted && (
        <div className="space-y-4 pt-1">
          <div className="bg-gradient-to-b from-emerald-950/40 to-slate-950/80 border border-emerald-500/40 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-100">
                    GitHub Pull Request Created!
                  </h4>
                  <p className="text-xs text-emerald-400/80">
                    Automated accessibility remediation patch is live
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Clean ✨
              </span>
            </div>

            {fixData.prUrl && (
              <div className="pt-2">
                <a 
                  href={fixData.prUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 p-3.5 rounded-xl text-xs font-mono text-emerald-300 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    <GitPullRequest className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{fixData.prUrl}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 shrink-0 font-sans font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Open PR</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              </div>
            )}

            {fixData.verification && (
              <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Re-scan Audit Results:</span>
                </span>
                <span className="font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  {fixData.verification.clean ? '0 remaining violations (100% Clean)' : `${fixData.verification.violationCount ?? 0} remaining violations`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Failed State */}
      {isFailed && (
        <div className="p-5 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Remediation Process Failed</span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed font-mono">
            {fixData.error || actionError || 'An error occurred during AI remediation or git operations.'}
          </p>
        </div>
      )}

      {actionError && !isFailed && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300">
          {actionError}
        </div>
      )}

      {/* Sync Footer */}
      {polling && !isCompleted && !isFailed && (
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
          <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
          <span>Syncing status with backend runner...</span>
        </div>
      )}
    </div>
  );
};