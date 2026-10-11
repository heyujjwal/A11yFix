import React, { useState } from 'react';
import { Code2, ArrowRight, Sparkles } from 'lucide-react';
import { a11yApi } from '../../services/a11yApi';

interface ScanFormProps {
  onScanStarted: (scanId: string) => void;
}

const DEFAULT_DEMO_REPO = 'https://github.com/akashjpal/Hackoctober-fest-sample-website.git';

export const ScanForm: React.FC<ScanFormProps> = ({ onScanStarted }) => {
  const [repoUrl, setRepoUrl] = useState(DEFAULT_DEMO_REPO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError('Please provide a repository URL to scan.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await a11yApi.startScan({ repoUrl: repoUrl.trim() });
      onScanStarted(data.scanId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start repository scan');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setRepoUrl(DEFAULT_DEMO_REPO);
    setError(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-slate-100">Start Repository Accessibility Scan</h2>
        <button
          type="button"
          onClick={handleUseDemo}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Use Sample Repo</span>
        </button>
      </div>
      <p className="text-sm text-slate-400 mb-6">
        Enter a GitHub repository URL to clone, build, and evaluate for WCAG accessibility violations.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Code2 className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
          <input 
            type="url" 
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repository.git" 
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !repoUrl.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-md"
        >
          <span>{loading ? 'Queuing Scan...' : 'Scan Repository'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
};