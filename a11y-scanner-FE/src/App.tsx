import { useCallback, useState } from 'react';
import { Header } from './components/layout/Header';
import { ScanForm } from './components/scanner/ScanForm';
import { ScanProgress } from './components/scanner/ScanProgress';
import { IssuesList } from './components/dashboard/IssuesList';
import { IssueDetail } from './components/dashboard/IssueDetail';
import { FixPreview } from './components/remediation/FixPreview';
import { type IssueDetail as IssueDetailType } from './types/api.types';
import { a11yApi } from './services/a11yApi';

export default function App() {
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanCompleted, setScanCompleted] = useState(false);
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
    setSelectedIssue(null);
    setFixId(null);
    setFixError(null);
  }, []);

  const handleSelectIssue = useCallback((issue: IssueDetailType) => {
    setSelectedIssue(issue);
    setFixError(null);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {!scanId && (
          <ScanForm 
            onScanStarted={(id) => {
              setSelectedIssue(null);
              setScanCompleted(false);
              setFixId(null);
              setFixError(null);
              setScanId(id);
            }} 
          />
        )}

        {scanId && !scanCompleted && (
          <div className="space-y-4">
            <ScanProgress 
              scanId={scanId} 
              onScanCompleted={handleScanCompleted} 
              onReset={handleScanReset} 
            />
          </div>
        )}

        {scanCompleted && scanId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-lg text-xs">
              <span className="text-slate-400">
                Active Scan ID: <code className="text-indigo-400 font-mono">{scanId}</code>
              </span>
              <button
                onClick={handleScanReset}
                className="text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer transition-colors"
              >
                Scan Another Repository
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
              <div className="lg:col-span-5 xl:col-span-4">
                <IssuesList 
                  scanId={scanId} 
                  selectedIssueId={selectedIssue?.issueId}
                  onSelectIssue={handleSelectIssue} 
                />
              </div>

              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                {selectedIssue && (
                  <IssueDetail 
                    issue={selectedIssue} 
                    onGenerateFix={handleGenerateFix}
                    isGenerating={generatingFix}
                  />
                )}

                {fixError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
                    {fixError}
                  </div>
                )}

                {fixId && (
                  <FixPreview key={fixId} fixId={fixId} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}