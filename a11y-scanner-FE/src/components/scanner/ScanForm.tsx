import React, { useState } from 'react';
import { 
  GitBranch, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  X, 
  ShieldCheck, 
  Cpu, 
  GitPullRequest, 
  AlertCircle,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { a11yApi } from '../../services/a11yApi';

interface ScanFormProps {
  onScanStarted: (scanId: string) => void;
}

const DEFAULT_DEMO_REPO = 'https://github.com/akashjpal/Hackoctober-fest-sample-website.git';
const DEFAULT_ROUTES = ['/', '/contact', '/products'];

export const ScanForm: React.FC<ScanFormProps> = ({ onScanStarted }) => {
  const [repoUrl, setRepoUrl] = useState(DEFAULT_DEMO_REPO);
  const [routes, setRoutes] = useState<string[]>(DEFAULT_ROUTES);
  const [newRoute, setNewRoute] = useState('');
  const [showRouteInput, setShowRouteInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError('Please provide a valid GitHub repository URL to scan.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await a11yApi.startScan({ 
        repoUrl: repoUrl.trim(),
        routes: routes.length > 0 ? routes : ['/']
      });
      onScanStarted(data.scanId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start repository scan');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setRepoUrl(DEFAULT_DEMO_REPO);
    setRoutes(DEFAULT_ROUTES);
    setError(null);
  };

  const handleAddRoute = () => {
    const trimmed = newRoute.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (!routes.includes(formatted)) {
      setRoutes([...routes, formatted]);
    }
    setNewRoute('');
    setShowRouteInput(false);
  };

  const handleRemoveRoute = (routeToRemove: string) => {
    if (routes.length <= 1) {
      setError('At least one route must be specified.');
      return;
    }
    setRoutes(routes.filter(r => r !== routeToRemove));
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-4 sm:py-8">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Generation WCAG 2.1 Remediation Agent</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Audit & Automatically Fix{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Accessibility Violations
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Clone any web repository, spin up isolated instances, crawl routes with axe-core & Playwright, 
          and let Gemma 4 generate verified, zero-regression GitHub pull requests.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>WCAG 2.1 AA/AAA</span>
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Playwright Headless</span>
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>axe-core Engine</span>
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>AI Code Diffs & PRs</span>
          </span>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></div>

        <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                <span>Start New Accessibility Audit</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target repository will be cloned into a secure sandbox runner for evaluation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseDemo}
                className="px-3 py-1.5 text-xs rounded-lg font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Use Sample Repo</span>
              </button>
              <button
                type="button"
                onClick={() => setRepoUrl('')}
                className="px-3 py-1.5 text-xs rounded-lg font-medium text-slate-400 hover:text-slate-200 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Repo URL Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                GitHub Repository URL
              </label>
              <div className="relative flex items-center">
                <GitBranch className="absolute left-4 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository.git"
                  className="w-full bg-slate-950 border border-slate-700/80 hover:border-slate-600 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Scanned Routes Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target Audit Routes ({routes.length})</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Playwright will crawl each path
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl min-h-[50px]">
                {routes.map((route) => (
                  <span
                    key={route}
                    className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 text-indigo-300 text-xs font-mono px-2.5 py-1 rounded-lg group"
                  >
                    <span>{route}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRoute(route)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-0.5 rounded cursor-pointer"
                      title={`Remove route ${route}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {showRouteInput ? (
                  <div className="inline-flex items-center gap-1 bg-slate-900 border border-indigo-500 rounded-lg px-2 py-0.5">
                    <input
                      type="text"
                      value={newRoute}
                      onChange={(e) => setNewRoute(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRoute();
                        } else if (e.key === 'Escape') {
                          setShowRouteInput(false);
                        }
                      }}
                      placeholder="/route"
                      autoFocus
                      className="bg-transparent text-xs text-slate-200 font-mono w-24 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddRoute}
                      className="text-indigo-400 hover:text-indigo-300 p-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRouteInput(false)}
                      className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowRouteInput(true)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-300 bg-slate-900/60 hover:bg-slate-800 border border-dashed border-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add route</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error callout */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !repoUrl.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm py-4 px-6 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
              >
                <span>{loading ? 'Initializing Audit Runner...' : 'Launch Full Accessibility Scan'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feature Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="p-5 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-2.5 hover:border-slate-700 transition-all">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-100">Sandboxed Environment</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatically clones your GitHub repository, configures dependencies, and starts the development server inside an isolated temporary sandbox.
          </p>
        </div>

        <div className="p-5 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-2.5 hover:border-slate-700 transition-all">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-100">axe-core & Playwright Auditing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Crawls target routes using headless browser automation, evaluating every rendered DOM element against WCAG 2.1 Level AA and AAA standards.
          </p>
        </div>

        <div className="p-5 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-2.5 hover:border-slate-700 transition-all">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-100">Autonomous Gemma AI Fixes</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gemma AI maps DOM violations to source files, generates minimal code patches, verifies build integrity, and creates verified GitHub pull requests.
          </p>
        </div>
      </div>
    </div>
  );
};