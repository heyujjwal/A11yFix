import React, { useEffect, useState } from 'react';
import { ShieldCheck, BookOpen, RefreshCw, Activity } from 'lucide-react';
import { a11yApi } from '../../services/a11yApi';
import { GuideModal } from './GuideModal';

interface HeaderProps {
  onResetScan?: () => void;
  hasActiveScan?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onResetScan, hasActiveScan }) => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        await a11yApi.checkHealth();
        if (mounted) setBackendOnline(true);
      } catch {
        if (mounted) setBackendOnline(false);
      }
    };

    void check();
    const interval = setInterval(check, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        {/* Left: Brand & Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-slate-900 border border-slate-700/80 p-2.5 rounded-xl text-indigo-400 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-100 via-indigo-100 to-slate-200 bg-clip-text text-transparent">
                A11yFix
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Gemma 4
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                WCAG 2.1 AA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              Autonomous Accessibility Auditing & AI Patch Engine
            </p>
          </div>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Health status badge */}
          <div 
            title={backendOnline === true ? "Backend server running on http://localhost:3000" : "Checking backend status..."}
            className="hidden sm:flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-lg border bg-slate-900/90 border-slate-800"
          >
            {backendOnline === true ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300 text-[11px]">Backend Online</span>
              </>
            ) : backendOnline === false ? (
              <>
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span className="text-rose-400 text-[11px]">Backend Offline</span>
              </>
            ) : (
              <>
                <Activity className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-slate-400 text-[11px]">Connecting...</span>
              </>
            )}
          </div>

          {/* Guide Modal Trigger */}
          <button
            onClick={() => setGuideOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm hover:border-slate-700"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">WCAG Guide</span>
          </button>

          {/* New Scan button if in an active scan */}
          {hasActiveScan && onResetScan && (
            <button
              onClick={onResetScan}
              className="flex items-center space-x-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Audit</span>
            </button>
          )}

          {/* GitHub Link */}
          <a
            href="https://github.com/akashjpal/Hackoctober-fest-sample-website"
            target="_blank"
            rel="noreferrer"
            aria-label="View on GitHub"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </header>

      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
};