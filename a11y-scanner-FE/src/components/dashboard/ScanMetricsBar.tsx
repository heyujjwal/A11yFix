import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';
import { type IssueDetail } from '../../types/api.types';

interface ScanMetricsBarProps {
  scanId: string;
  issues: IssueDetail[];
  onReset: () => void;
}

export const ScanMetricsBar: React.FC<ScanMetricsBarProps> = ({ scanId, issues, onReset }) => {
  const [copied, setCopied] = useState(false);

  // Group by impact
  const criticalCount = issues.filter(i => i.impact?.toLowerCase() === 'critical').length;
  const seriousCount = issues.filter(i => i.impact?.toLowerCase() === 'serious').length;
  const moderateCount = issues.filter(i => i.impact?.toLowerCase() === 'moderate').length;
  const minorCount = issues.filter(i => i.impact?.toLowerCase() === 'minor').length;

  // Calculate accessibility score (0 - 100)
  // Deduct points based on severity weights
  const penalty = (criticalCount * 18) + (seriousCount * 10) + (moderateCount * 5) + (minorCount * 2);
  const score = Math.max(10, Math.min(100, 100 - penalty));

  // Determine grade & color
  let scoreColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let grade = 'A';
  if (score < 50) {
    scoreColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    grade = 'F';
  } else if (score < 70) {
    scoreColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    grade = 'C';
  } else if (score < 85) {
    scoreColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    grade = 'B';
  }

  // Unique routes scanned
  const uniqueRoutes = Array.from(new Set(issues.map(i => i.page).filter(Boolean)));

  const handleCopyId = () => {
    navigator.clipboard.writeText(scanId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Scan Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/90 px-5 py-3.5 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Scan ID:</span>
            <code className="text-xs font-mono font-semibold text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {scanId}
            </code>
            <button
              onClick={handleCopyId}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded cursor-pointer"
              title="Copy Scan ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{uniqueRoutes.length > 0 ? `${uniqueRoutes.length} route(s) audited` : 'Audited routes'}</span>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Audit Another Repo</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Compliance Health Score */}
        <div className="col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Health Score
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-100">{score}%</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border font-mono ${scoreColor}`}>
                Grade {grade}
              </span>
            </div>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border font-bold text-sm ${scoreColor}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Violations */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Issues
            </span>
            <span className="text-2xl font-black text-slate-100 mt-1 block">
              {issues.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Critical Issues */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Critical
            </span>
            <span className="text-2xl font-black text-rose-400 mt-1 block">
              {criticalCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Serious Issues */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Serious
            </span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">
              {seriousCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Moderate & Minor */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Moderate / Minor
            </span>
            <span className="text-2xl font-black text-sky-400 mt-1 block">
              {moderateCount + minorCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
