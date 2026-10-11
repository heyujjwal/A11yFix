import React, { useState, useEffect } from 'react';
import { GitPullRequest, CheckCircle2, RefreshCw, Code2, AlertTriangle, ExternalLink, FileCode } from 'lucide-react';
import { type FixResponse } from '../../types/api.types';
import { a11yApi } from '../../services/a11yApi';

interface FixPreviewProps {
  fixId: string;
}

export const FixPreview: React.FC<FixPreviewProps> = ({ fixId }) => {
  const [fixData, setFixData] = useState<FixResponse | null>(null);
  const [polling, setPolling] = useState(true);
  const [submittingPr, setSubmittingPr] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
          return;
        }
      } catch (err) {
        console.error('Error polling fix status:', err);
      }

      if (!stopped) {
        timer = setTimeout(poll, 2500);
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
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to apply patch and create pull request');
    } finally {
      setSubmittingPr(false);
    }
  };

  if (!fixData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-400 flex items-center justify-center space-x-3 shadow-lg">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
        <span className="text-sm">Initializing AI patch generation...</span>
      </div>
    );
  }

  const isGenerating = fixData.status === 'generating';
  const isGenerated = fixData.status === 'generated' || fixData.status === 'ready_for_pr';
  const isApplying = fixData.status === 'applying' || submittingPr;
  const isCompleted = fixData.status === 'completed' || fixData.status === 'pr_created';
  const isFailed = fixData.status === 'failed';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-200">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>AI Fix & Remediation</span>
        </h3>
        <span className="text-xs px-2.5 py-0.5 rounded font-mono uppercase bg-slate-800 text-indigo-300 border border-slate-700">
          Status: {fixData.status}
        </span>
      </div>

      {fixData.summary && (
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-mono uppercase">AI Proposed Change:</span>
          <p className="text-sm text-slate-200 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            {fixData.summary}
          </p>
        </div>
      )}

      {fixData.filePath && (
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded border border-slate-800 font-mono">
          <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Target File: <strong className="text-indigo-300">{fixData.filePath}</strong></span>
        </div>
      )}

      {/* When generating */}
      {isGenerating && (
        <div className="flex items-center space-x-3 p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-lg text-xs text-indigo-300">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
          <span>Gemma AI model is analyzing finding and authoring minimal WCAG code patch...</span>
        </div>
      )}

      {/* When generated: ready for approval */}
      {isGenerated && !isApplying && !isCompleted && (
        <div className="space-y-3 pt-2">
          <p className="text-xs text-slate-400">
            The AI model has generated and validated a code patch for this finding. You can approve to apply the patch, run build verification, and open a GitHub Pull Request.
          </p>
          <button 
            onClick={handleCreatePR}
            disabled={submittingPr}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium text-xs flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer disabled:opacity-50"
          >
            <GitPullRequest className="w-4 h-4" />
            <span>{submittingPr ? 'Applying Patch & Opening PR...' : 'Approve & Create GitHub Pull Request'}</span>
          </button>
        </div>
      )}

      {/* When applying */}
      {isApplying && (
        <div className="flex items-center space-x-3 p-4 bg-amber-950/20 border border-amber-500/20 rounded-lg text-xs text-amber-300">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
          <span>Applying patch on dedicated branch, verifying build & axe re-scan, and opening GitHub PR...</span>
        </div>
      )}

      {/* When completed: PR link and verification */}
      {isCompleted && (
        <div className="space-y-3">
          <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-lg space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs font-semibold text-emerald-200">
                Pull Request Created Successfully!
              </p>
            </div>

            {fixData.prUrl && (
              <div className="pt-1">
                <a 
                  href={fixData.prUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-mono flex items-center gap-1.5 break-all"
                >
                  <span>{fixData.prUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            )}

            {fixData.verification && (
              <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between">
                <span>Verification Re-scan:</span>
                <span className="font-mono">
                  {fixData.verification.clean ? '0 remaining violations (Clean)' : `${fixData.verification.violationCount ?? 0} remaining violations`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* When failed */}
      {isFailed && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-lg space-y-2">
          <div className="flex items-center space-x-2 text-red-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Remediation Failed</span>
          </div>
          <p className="text-xs text-red-300">
            {fixData.error || actionError || 'An error occurred during AI remediation or PR creation.'}
          </p>
        </div>
      )}

      {actionError && !isFailed && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
          {actionError}
        </div>
      )}

      {polling && !isCompleted && !isFailed && (
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
          <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
          <span>Syncing status with backend...</span>
        </div>
      )}
    </div>
  );
};