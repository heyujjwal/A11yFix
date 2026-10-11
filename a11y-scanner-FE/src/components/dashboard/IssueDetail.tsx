import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ExternalLink, 
  Wand2, 
  MapPin, 
  Code2, 
  Copy, 
  Check, 
  Sparkles,
  BookOpen,
  Info,
  ChevronRight
} from 'lucide-react';
import { type IssueDetail as IssueDetailType } from '../../types/api.types';

interface IssueDetailProps {
  issue: IssueDetailType;
  onGenerateFix: (issueId: string) => void;
  isGenerating?: boolean;
}

const getImpactBadge = (impact?: string) => {
  switch (impact?.toLowerCase()) {
    case 'critical':
      return {
        label: 'Critical Violation',
        classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      };
    case 'serious':
      return {
        label: 'Serious Violation',
        classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      };
    case 'moderate':
      return {
        label: 'Moderate Violation',
        classes: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
      };
    case 'minor':
      return {
        label: 'Minor Issue',
        classes: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
      };
    default:
      return {
        label: 'Accessibility Finding',
        classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30'
      };
  }
};

export const IssueDetail: React.FC<IssueDetailProps> = ({ 
  issue, 
  onGenerateFix, 
  isGenerating = false 
}) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'guidelines'>('elements');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [copiedSelector, setCopiedSelector] = useState<string | null>(null);

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

  const impactInfo = getImpactBadge(issue.impact);

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleCopySelector = (sel: string, id: string) => {
    navigator.clipboard.writeText(sel);
    setCopiedSelector(id);
    setTimeout(() => setCopiedSelector(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border ${impactInfo.classes}`}>
              {impactInfo.label}
            </span>
            <span className="text-xs bg-slate-950 font-mono text-indigo-300 border border-slate-800 px-2.5 py-1 rounded-lg">
              {issue.ruleId}
            </span>
          </div>

          {issue.helpUrl && (
            <a 
              href={issue.helpUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
            >
              <span>Deque & WCAG Rule Specs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight leading-snug">
            {displayTitle}
          </h2>
          <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-400 font-medium mr-1">Standards:</span>
          {issue.wcagTags && issue.wcagTags.length > 0 ? (
            issue.wcagTags.map((tag, idx) => (
              <span key={idx} className="text-[11px] font-mono text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
              {issue.ruleId}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'elements'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Affected Elements ({elements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('guidelines')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'guidelines'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>WCAG Guideline & Impact</span>
        </button>
      </div>

      {/* Tab 1: Affected Elements */}
      {activeTab === 'elements' && (
        <div className="space-y-4">
          {elements.map((node, idx) => {
            const selectorStr = node.selectors && node.selectors.length > 0 ? node.selectors.join(', ') : '';
            const nodeId = node.nodeId || `element-${idx}`;

            return (
              <div key={nodeId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-inner">
                {/* Location Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-mono">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>Route: {node.page || issue.page || '/'}</span>
                  </div>

                  {selectorStr && (
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono max-w-md truncate">
                      <span className="text-slate-500 shrink-0">Selector:</span>
                      <span className="text-slate-300 truncate" title={selectorStr}>
                        {selectorStr}
                      </span>
                      <button
                        onClick={() => handleCopySelector(selectorStr, nodeId)}
                        className="text-slate-500 hover:text-slate-200 p-1 rounded cursor-pointer"
                        title="Copy Selector"
                      >
                        {copiedSelector === nodeId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* HTML Code Snippet */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Flagged DOM Snippet
                    </span>
                    {node.html && (
                      <button
                        onClick={() => handleCopySnippet(node.html, nodeId)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        {copiedSnippet === nodeId ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Snippet</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-slate-800/90 bg-slate-900/90">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono text-slate-500">
                      <span>HTML / JSX</span>
                      <span>Target Node</span>
                    </div>
                    <pre className="p-3.5 text-xs text-rose-300 font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                      {node.html || '<snippet not available>'}
                    </pre>
                  </div>
                </div>

                {/* Failure Summary Callout */}
                {node.failureSummary && (
                  <div className="p-3.5 bg-amber-950/20 border border-amber-500/25 rounded-xl space-y-1 text-xs text-amber-200/90">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Failure Diagnosis:</span>
                    </div>
                    <p className="leading-relaxed pl-5">
                      {node.failureSummary}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Guidelines */}
      {activeTab === 'guidelines' && (
        <div className="space-y-4 p-5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">WCAG Success Criteria Compliance</h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                This rule aligns directly with the W3C Web Content Accessibility Guidelines (WCAG) 2.1 specifications.
                Failing this requirement creates severe hurdles for assistive technology users, including screen reader users, keyboard-only navigators, and individuals with visual or cognitive impairments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="font-semibold text-slate-200">User Impact:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Screen readers may misannounce elements or skip them entirely. Users relying on high contrast or keyboard focus indicators cannot safely navigate the UI.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="font-semibold text-slate-200">Recommended Fix:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Provide semantic elements, valid alt tags, proper ARIA labels, or sufficient color contrast ratios as suggested by our Gemma AI remediation model.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer: AI Fix Trigger */}
      <div className="pt-2">
        <div className="relative group p-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-600/15">
          <button 
            onClick={() => onGenerateFix(issue.issueId)}
            disabled={isGenerating}
            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm py-4 px-6 rounded-[14px] flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <span className="block text-slate-100 font-bold">
                  {isGenerating ? 'Synthesizing Patch with Gemma AI...' : 'Generate AI Remediation Patch'}
                </span>
                <span className="block text-[11px] text-slate-400 font-normal">
                  Analyzes AST, generates accessible fix, and prepares verified GitHub PR
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md">
              <Wand2 className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Start AI Fix'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};