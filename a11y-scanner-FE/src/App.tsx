import { useCallback, useState } from 'react';
import { Header } from './components/layout/Header';
import { ScanForm } from './components/scanner/ScanForm';
import { ScanProgress } from './components/scanner/ScanProgress';
import { IssuesList } from './components/dashboard/IssuesList';
import { IssueDetail } from './components/dashboard/IssueDetail';
import { ScanMetricsBar } from './components/dashboard/ScanMetricsBar';
import { FixPreview } from './components/remediation/FixPreview';
import { type IssueDetail as IssueDetailType } from './types/api.types';
import { a11yApi } from './services/a11yApi';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [issues, setIssues] = useState<IssueDetailType[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<IssueDetailType | null>(null);
  const [fixId, setFixId] = useState<string | null>(null);
  const [generatingFix, setGeneratingFix] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);

  const handleScanCompleted = useCallback(() => {
    setScanCompleted(true);
  }, []);

  const handleScanReset = useCallback(() => {
    setScanId(null);
    setScanCompleted(false);
    setIssues([]);
    setSelectedIssue(null);
    setFixId(null);
    setFixError(null);
  }, []);

  const handleSelectIssue = useCallback((issue: IssueDetailType) => {
    setSelectedIssue(issue);
    setFixError(null);
  }, []);

  const handleIssuesLoaded = useCallback((loadedIssues: IssueDetailType[]) => {
    setIssues(loadedIssues);
  }, []);

  const handleGenerateFix = async (issueId: string) => {
    if (!scanId) return;
    setGeneratingFix(true);
    setFixError(null);
    try {
      const res = await a11yApi.generateFix(scanId, issueId);
      setFixId(res.fixId);
    } catch (err) {
      setFixError(err instanceof Error ? err.message : 'Failed to start AI fix generation');
    } finally {
      setGeneratingFix(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans bg-mesh-pattern selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <Header 
        onResetScan={handleScanReset} 
        hasActiveScan={!!scanId} 
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Landing / Scan Initiation */}
        {!scanId && (
          <ScanForm 
            onScanStarted={(id) => {
              setIssues([]);
              setSelectedIssue(null);
              setScanCompleted(false);
              setFixId(null);
              setFixError(null);
              setScanId(id);
            }} 
          />
        )}

        {/* Scan In Progress */}
        {scanId && !scanCompleted && (
          <ScanProgress 
            scanId={scanId} 
            onScanCompleted={handleScanCompleted} 
            onReset={handleScanReset} 
          />
        )}

        {/* Scan Completed: Dashboard & Remediation */}
        {scanCompleted && scanId && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Metrics & Health Overview */}
            <ScanMetricsBar 
              scanId={scanId} 
              issues={issues} 
              onReset={handleScanReset} 
            />

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Violations List */}
              <div className="lg:col-span-5 xl:col-span-4">
                <IssuesList 
                  scanId={scanId} 
                  selectedIssueId={selectedIssue?.issueId}
                  onSelectIssue={handleSelectIssue} 
                  onIssuesLoaded={handleIssuesLoaded}
                />
              </div>

              {/* Right Column: Violation Detail & AI Remediation Preview */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                {selectedIssue ? (
                  <IssueDetail 
                    issue={selectedIssue} 
                    onGenerateFix={handleGenerateFix}
                    isGenerating={generatingFix}
                  />
                ) : (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                    <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto" />
                    <h3 className="text-sm font-semibold text-slate-300">No finding selected</h3>
                    <p className="text-xs text-slate-500">Select any violation from the list to view DOM snippets and trigger AI fixes.</p>
                  </div>
                )}

                {/* Error Banner */}
                {fixError && (
                  <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center justify-between">
                    <span>{fixError}</span>
                    <button 
                      onClick={() => setFixError(null)} 
                      className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer ml-2"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* AI Fix Remediation Preview & PR Approval */}
                {fixId && (
                  <FixPreview key={fixId} fixId={fixId} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 px-4 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">A11yFix</span>
            <span>•</span>
            <span>Autonomous Web Accessibility & Remediation Agent</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span>Powered by axe-core & Gemma 4</span>
            <a 
              href="https://github.com/akashjpal/Hackoctober-fest-sample-website" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}