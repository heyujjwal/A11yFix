import React from 'react';
import { AlertTriangle, ExternalLink, Wand2, MapPin, Code } from 'lucide-react';
import { type IssueDetail as IssueDetailType } from '../../types/api.types';

interface IssueDetailProps {
  issue: IssueDetailType;
  onGenerateFix: (issueId: string) => void;
  isGenerating?: boolean;
}

export const IssueDetail: React.FC<IssueDetailProps> = ({ issue, onGenerateFix, isGenerating = false }) => {
  const displayTitle = issue.title || issue.description || issue.ruleId;
  const elements = issue.elements && issue.elements.length > 0 
    ? issue.elements 
    : [
        {
          nodeId: issue.issueId,
          page: issue.page,
          selectors: issue.target || [],
          html: issue.htmlSnippet,
          failureSummary: issue.failureSummary,
          sourceMapping: { status: 'unmapped' as const, files: [] },
          fixStatus: 'available'
        }
      ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-lg">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-base font-semibold text-slate-100">
              {displayTitle}
            </h3>
          </div>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded font-mono">
            {issue.ruleId}
          </span>
        </div>

        <p className="text-sm text-slate-300 mt-2">
          {issue.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          {issue.impact && (
            <span className="text-[11px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              Impact: {issue.impact}
            </span>
          )}
          {issue.wcagTags && issue.wcagTags.length > 0 && (
            <span className="text-[11px] text-indigo-300 font-mono">
              WCAG: {issue.wcagTags.join(', ')}
            </span>
          )}
          {issue.helpUrl && (
            <a 
              href={issue.helpUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 transition-colors"
            >
              <span>Rule documentation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
          <Code className="w-4 h-4 text-slate-400" />
          <span>Affected DOM Elements ({elements.length})</span>
        </h4>

        {elements.map((node, idx) => (
          <div key={node.nodeId || idx} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400">
              <span className="text-indigo-400 font-mono flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Route: {node.page || issue.page}</span>
              </span>
              {node.selectors && node.selectors.length > 0 && (
                <span className="text-slate-500 font-mono truncate max-w-xs" title={node.selectors.join(' ')}>
                  Target: {node.selectors.join(', ')}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Rendered HTML Snippet:</span>
              <pre className="bg-slate-900/90 border border-slate-800 p-3 rounded text-xs text-red-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                {node.html || '<snippet not available>'}
              </pre>
            </div>

            {node.failureSummary && (
              <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded">
                <span className="font-semibold block mb-0.5">Failure Details:</span>
                {node.failureSummary}
              </div>
            )}
          </div>
        ))}

        <div className="pt-2">
          <button 
            onClick={() => onGenerateFix(issue.issueId)}
            disabled={isGenerating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>{isGenerating ? 'Initiating AI Remediation...' : 'Generate AI Fix for Finding'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};