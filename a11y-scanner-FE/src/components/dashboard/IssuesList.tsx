import React, { useEffect, useState, useMemo } from 'react';
import { 
  FileText, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  X, 
  ArrowUpDown,
  Layers
} from 'lucide-react';
import { type IssueDetail } from '../../types/api.types';
import { a11yApi } from '../../services/a11yApi';

interface IssuesListProps {
  scanId: string;
  selectedIssueId?: string;
  onSelectIssue: (issue: IssueDetail) => void;
  onIssuesLoaded?: (issues: IssueDetail[]) => void;
}

const getImpactBadgeClass = (impact?: string) => {
  switch (impact?.toLowerCase()) {
    case 'critical':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    case 'serious':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'moderate':
      return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
    case 'minor':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    default:
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
};

const getImpactOrder = (impact?: string) => {
  switch (impact?.toLowerCase()) {
    case 'critical': return 4;
    case 'serious': return 3;
    case 'moderate': return 2;
    case 'minor': return 1;
    default: return 0;
  }
};

export const IssuesList: React.FC<IssuesListProps> = ({ 
  scanId, 
  selectedIssueId, 
  onSelectIssue,
  onIssuesLoaded
}) => {
  const [issues, setIssues] = useState<IssueDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'rule'>('severity');

  useEffect(() => {
    let ignore = false;

    a11yApi.getIssues(scanId)
      .then(res => {
        if (ignore) return;
        const list = res.issues || [];
        setIssues(list);
        if (onIssuesLoaded) {
          onIssuesLoaded(list);
        }
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
  }, [scanId, selectedIssueId, onSelectIssue, onIssuesLoaded]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await a11yApi.getIssues(scanId);
      const list = res.issues || [];
      setIssues(list);
      if (onIssuesLoaded) {
        onIssuesLoaded(list);
      }
      if (list.length > 0 && !selectedIssueId) {
        onSelectIssue(list[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accessibility findings');
    } finally {
      setLoading(false);
    }
  };

  // Severity counts
  const criticalCount = issues.filter(i => i.impact?.toLowerCase() === 'critical').length;
  const seriousCount = issues.filter(i => i.impact?.toLowerCase() === 'serious').length;
  const moderateCount = issues.filter(i => i.impact?.toLowerCase() === 'moderate').length;
  const minorCount = issues.filter(i => i.impact?.toLowerCase() === 'minor').length;

  // Filtered and sorted issues
  const filteredIssues = useMemo(() => {
    return issues
      .filter(issue => {
        // Severity filter
        if (severityFilter !== 'all' && issue.impact?.toLowerCase() !== severityFilter) {
          return false;
        }
        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchRule = issue.ruleId.toLowerCase().includes(term);
          const matchDesc = (issue.description || '').toLowerCase().includes(term);
          const matchTitle = (issue.title || '').toLowerCase().includes(term);
          const matchPage = (issue.page || '').toLowerCase().includes(term);
          const matchTags = (issue.wcagTags || []).some(t => t.toLowerCase().includes(term));
          return matchRule || matchDesc || matchTitle || matchPage || matchTags;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          return getImpactOrder(b.impact) - getImpactOrder(a.impact);
        }
        return a.ruleId.localeCompare(b.ruleId);
      });
  }, [issues, severityFilter, searchTerm, sortBy]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col h-[740px] shadow-xl backdrop-blur-md">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Findings & Violations</h3>
            <span className="text-[11px] text-slate-400">
              {filteredIssues.length} of {issues.length} displayed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleRefresh()}
            disabled={loading}
            title="Refresh Findings"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer border border-transparent hover:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="pt-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by rule, tag, description..."
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between pt-2.5 pb-1 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              severityFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All ({issues.length})
          </button>
          {criticalCount > 0 && (
            <button
              onClick={() => setSeverityFilter('critical')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                severityFilter === 'critical'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              Critical ({criticalCount})
            </button>
          )}
          {seriousCount > 0 && (
            <button
              onClick={() => setSeverityFilter('serious')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                severityFilter === 'serious'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              Serious ({seriousCount})
            </button>
          )}
          {moderateCount > 0 && (
            <button
              onClick={() => setSeverityFilter('moderate')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                severityFilter === 'moderate'
                  ? 'bg-yellow-600 text-white shadow-sm'
                  : 'text-yellow-400 hover:bg-yellow-950/40'
              }`}
            >
              Mod ({moderateCount})
            </button>
          )}
          {minorCount > 0 && (
            <button
              onClick={() => setSeverityFilter('minor')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                severityFilter === 'minor'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-sky-400 hover:bg-sky-950/40'
              }`}
            >
              Minor ({minorCount})
            </button>
          )}
        </div>

        {/* Sort Button */}
        <button
          onClick={() => setSortBy(sortBy === 'severity' ? 'rule' : 'severity')}
          className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
          title={`Sorting by ${sortBy === 'severity' ? 'Impact Severity' : 'Rule ID'}`}
        >
          <ArrowUpDown className="w-3 h-3" />
          <span className="hidden sm:inline">{sortBy === 'severity' ? 'Impact' : 'A-Z'}</span>
        </button>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pt-2 pr-1">
        {loading && issues.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-xs text-slate-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <span>Loading accessibility findings...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && filteredIssues.length === 0 && (
          <div className="text-center py-12 px-4 space-y-3">
            <p className="text-sm text-slate-400">
              {searchTerm || severityFilter !== 'all' 
                ? 'No issues match the selected search or filter.' 
                : 'No accessibility violations found on the scanned pages.'}
            </p>
            {(searchTerm || severityFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSeverityFilter('all');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {filteredIssues.map((issue) => {
          const isSelected = selectedIssueId === issue.issueId;
          const displayTitle = issue.title || issue.description || issue.ruleId;
          const tags = issue.wcagTags && issue.wcagTags.length > 0 ? issue.wcagTags : [issue.ruleId];

          return (
            <div 
              key={issue.issueId}
              onClick={() => onSelectIssue(issue)}
              className={`p-3.5 rounded-xl cursor-pointer transition-all border group ${
                isSelected
                  ? 'border-indigo-500 bg-slate-900 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${getImpactBadgeClass(issue.impact)}`}>
                  {issue.impact || 'finding'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={issue.ruleId}>
                  {issue.ruleId}
                </span>
              </div>

              <p className="text-xs text-slate-200 font-medium line-clamp-2 mb-2 group-hover:text-white transition-colors">
                {displayTitle}
              </p>

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-800/90 text-indigo-300 font-mono px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                  {tags.length > 2 && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      +{tags.length - 2}
                    </span>
                  )}
                </div>

                {issue.page && (
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 max-w-[110px] truncate" title={issue.page}>
                    <Layers className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{issue.page.replace(/^https?:\/\/[^/]+/, '') || '/'}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};