import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { type IssueDetail } from '../../types/api.types';
import { a11yApi } from '../../services/a11yApi';

interface IssuesListProps {
  scanId: string;
  selectedIssueId?: string;
  onSelectIssue: (issue: IssueDetail) => void;
}

const getImpactBadgeClass = (impact?: string) => {
  switch (impact?.toLowerCase()) {
    case 'critical':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'serious':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'moderate':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'minor':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

export const IssuesList: React.FC<IssuesListProps> = ({ scanId, selectedIssueId, onSelectIssue }) => {
  const [issues, setIssues] = useState<IssueDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    a11yApi.getIssues(scanId)
      .then(res => {
        if (ignore) return;
        const list = res.issues || [];
        setIssues(list);
        if (list.length > 0 && !selectedIssueId) {
          onSelectIssue(list[0]);
        }
      })
      .catch(err => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load accessibility findings');
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [scanId, selectedIssueId, onSelectIssue]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await a11yApi.getIssues(scanId);
      const list = res.issues || [];
      setIssues(list);
      if (list.length > 0 && !selectedIssueId) {
        onSelectIssue(list[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accessibility findings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[650px] shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-slate-200">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Violation Findings</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleRefresh()}
            disabled={loading}
            title="Refresh Findings"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-medium">
            {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pt-4 pr-1">
        {loading && issues.length === 0 && (
          <div className="flex items-center justify-center p-8 text-xs text-slate-400 space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Loading accessibility findings...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && issues.length === 0 && (
          <div className="text-center py-12 px-4 space-y-3">
            <p className="text-sm text-slate-400">No accessibility violations found on the scanned pages.</p>
            <button
              onClick={() => void handleRefresh()}
              className="text-xs text-indigo-400 hover:underline"
            >
              Check again
            </button>
          </div>
        )}

        {issues.map(issue => {
          const isSelected = selectedIssueId === issue.issueId;
          const displayTitle = issue.title || issue.description || issue.ruleId;
          const tags = issue.wcagTags && issue.wcagTags.length > 0 ? issue.wcagTags : [issue.ruleId];

          return (
            <div 
              key={issue.issueId}
              onClick={() => onSelectIssue(issue)}
              className={`p-3.5 rounded-lg cursor-pointer transition-all border ${
                isSelected
                  ? 'border-indigo-500 bg-slate-900/90 shadow-md ring-1 ring-indigo-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide border ${getImpactBadgeClass(issue.impact)}`}>
                  {issue.impact || 'finding'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]" title={issue.ruleId}>
                  {issue.ruleId}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium line-clamp-2 mb-1.5">
                {displayTitle}
              </p>
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-800/80 text-indigo-300 font-mono px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};