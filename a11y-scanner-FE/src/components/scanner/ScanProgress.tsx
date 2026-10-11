import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { type ScanResponse } from '../../types/api.types';
import { a11yApi } from '../../services/a11yApi';

interface ScanProgressProps {
  scanId: string;
  onScanCompleted: () => void;
  onReset: () => void;
}

const STATUS_MESSAGES: Record<string, string> = {
  queued: 'Queued in job runner...',
  cloning: 'Cloning repository from GitHub...',
  installing: 'Installing repository dependencies with npm...',
  starting: 'Booting application development server...',
  scanning: 'Running Playwright and axe-core WCAG analysis across routes...',
  completed: 'Scan completed. Retrieving findings...',
  failed: 'Scan failed.'
};

export const ScanProgress: React.FC<ScanProgressProps> = ({ scanId, onScanCompleted, onReset }) => {
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const [pollingError, setPollingError] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let timeout: ReturnType<typeof setTimeout>;
    let emptyIssuesCheckCount = 0;

    const poll = async () => {
      try {
        const data = await a11yApi.getScan(scanId);
        if (stopped) return;
        setScanData(data);
        setPollingError(null);

        if (data.status === 'completed') {
          // Verify that axe scan has completed writing findings
          try {
            const issuesRes = await a11yApi.getIssues(scanId);
            if (issuesRes.issues && issuesRes.issues.length > 0) {
              onScanCompleted();
              return;
            }
          } catch {
            // Ignore temporary issue fetch error and re-poll
          }

          emptyIssuesCheckCount++;
          // Give background scanner up to ~6 attempts (approx 9 seconds) to finalize findings
          if (emptyIssuesCheckCount >= 6) {
            onScanCompleted();
            return;
          }
        }

        if (data.status === 'failed') {
          return;
        }
      } catch (err) {
        if (!stopped) {
          setPollingError(err instanceof Error ? err.message : 'Unable to fetch scan status');
        }
      }

      if (!stopped) {
        timeout = setTimeout(poll, 1500);
      }
    };

    void poll();

    return () => {
      stopped = true;
      clearTimeout(timeout);
    };
  }, [scanId, onScanCompleted]);

  if (scanData?.status === 'failed') {
    return (
      <div className="bg-slate-900 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto text-center space-y-4 mt-12 shadow-xl">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <div>
          <h3 className="text-base font-semibold text-slate-100">Scan Failed</h3>
          <p className="text-sm text-red-300 mt-2">{scanData.error || 'The scan could not be completed.'}</p>
        </div>
        <button 
          onClick={onReset} 
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors"
        >
          Try another scan
        </button>
      </div>
    );
  }

  const currentStatus = scanData?.status || 'queued';
  const statusMessage = STATUS_MESSAGES[currentStatus] || 'Processing scan...';
  const progressPercent = typeof scanData?.progress === 'number' ? scanData.progress : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md mx-auto text-center space-y-5 mt-12 shadow-xl">
      <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
        {currentStatus === 'completed' ? (
          <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-pulse" />
        ) : (
          <RefreshCw className="w-7 h-7 animate-spin" />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-100 capitalize">
          Scan Status: {currentStatus}
        </h3>
        <p className="text-xs text-slate-400">
          {pollingError || statusMessage}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div 
          className="bg-indigo-600 h-2 transition-all duration-500 rounded-full"
          style={{ width: `${Math.max(progressPercent, 5)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
        <span>Scan ID: {scanId.slice(0, 14)}...</span>
        <span>{progressPercent}%</span>
      </div>
    </div>
  );
};