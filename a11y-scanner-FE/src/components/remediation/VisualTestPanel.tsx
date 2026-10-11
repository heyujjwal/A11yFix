import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Play, 
  FileCode, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Move,
  Info,
  Camera,
  ArrowRight,
  GitPullRequest
} from 'lucide-react';
import { 
  type VisualTestResult, 
  type TestGenResponse, 
  type TestRunResponse 
} from '../../types/api.types';
import { a11yApi } from '../../services/a11yApi';

interface VisualTestPanelProps {
  fixId: string;
  isPrCreated?: boolean;
  initialVisual?: VisualTestResult | null;
  onVisualUpdate?: (visual: VisualTestResult) => void;
  onTriggerPR?: () => void;
}

export const VisualTestPanel: React.FC<VisualTestPanelProps> = ({ 
  fixId, 
  isPrCreated = false,
  initialVisual,
  onVisualUpdate,
  onTriggerPR
}) => {
  const [visualData, setVisualData] = useState<VisualTestResult | null>(initialVisual || null);
  const [loadingVisual, setLoadingVisual] = useState(false);
  const [visualError, setVisualError] = useState<string | null>(null);

  // E2E Test states
  const [activeTab, setActiveTab] = useState<'visual' | 'e2e'>('visual');
  const [generatingTests, setGeneratingTests] = useState(false);
  const [runningTests, setRunningTests] = useState(false);
  const [testGenData, setTestGenData] = useState<TestGenResponse | null>(null);
  const [testRunData, setTestRunData] = useState<TestRunResponse | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(false);

  // Fetch initial visual test status on mount if not provided
  useEffect(() => {
    let ignore = false;
    if (!initialVisual && fixId) {
      a11yApi.getVisualTest(fixId)
        .then(res => {
          if (!ignore && res.visual) {
            setVisualData(res.visual);
            if (onVisualUpdate) onVisualUpdate(res.visual);
          }
        })
        .catch(() => {
          // Normal if not run yet
        });
    }
    return () => {
      ignore = true;
    };
  }, [fixId, initialVisual, onVisualUpdate]);

  // Execute visual test (either baseline capture or diff comparison)
  const handleRunVisualTest = async () => {
    setLoadingVisual(true);
    setVisualError(null);
    try {
      const res = await a11yApi.runVisualTest(fixId);
      if (res.visual) {
        setVisualData(res.visual);
        if (onVisualUpdate) onVisualUpdate(res.visual);
      }
    } catch (err) {
      setVisualError(err instanceof Error ? err.message : 'Visual regression test failed to execute');
    } finally {
      setLoadingVisual(false);
    }
  };

  // Generate Playwright tests
  const handleGenerateTests = async () => {
    setGeneratingTests(true);
    setTestError(null);
    try {
      const res = await a11yApi.generateTests(fixId);
      setTestGenData(res);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : 'Failed to generate Playwright tests');
    } finally {
      setGeneratingTests(false);
    }
  };

  // Run generated Playwright tests
  const handleRunTests = async () => {
    setRunningTests(true);
    setTestError(null);
    try {
      const res = await a11yApi.runTests(fixId);
      setTestRunData(res);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : 'Failed to execute Playwright test suite');
    } finally {
      setRunningTests(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isBaseline = visualData?.status === 'baseline-created';
  const isCompared = visualData?.status === 'passed' || visualData?.status === 'failed';
  const isPassed = visualData?.status === 'passed';
  const isFailed = visualData?.status === 'failed';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl backdrop-blur-md">
      {/* Top Header & Nav Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">Visual & Regression Quality Gate</h4>
              {visualData && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                  isPassed
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : isBaseline
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                    : isFailed
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {isBaseline ? 'Baseline Recorded' : visualData.status.replace('-', ' ')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Before/after Playwright capture & pixelmatch layout verification
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visual Diff & Layout
          </button>
          <button
            onClick={() => setActiveTab('e2e')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'e2e'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Playwright E2E Suite
          </button>
        </div>
      </div>

      {/* TAB 1: VISUAL TEST & LAYOUT STABILITY */}
      {activeTab === 'visual' && (
        <div className="space-y-6">
          {/* Visual Lifecycle Stepper */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Visual Quality Gate Lifecycle</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {isCompared ? 'Stage 3 of 3: Completed' : isPrCreated ? 'Stage 3 of 3: Ready for Diff' : isBaseline ? 'Stage 2 of 3: Ready for PR' : 'Stage 1 of 3: Baseline Needed'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              {/* Step 1: Baseline */}
              <div className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                isBaseline || isCompared
                  ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-200'
                  : 'bg-slate-900 border-purple-500/50 shadow-md ring-1 ring-purple-500/20 text-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-mono">1</span>
                    <span>Pre-Fix Baseline</span>
                  </span>
                  {(isBaseline || isCompared) && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {isBaseline || isCompared ? 'Baseline screenshots captured of unfixed app' : 'Capture baseline of unfixed app before patch'}
                </p>
              </div>

              {/* Step 2: Apply & Restart */}
              <div className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                isPrCreated
                  ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-200'
                  : isBaseline
                  ? 'bg-slate-900 border-indigo-500/40 text-slate-200 ring-1 ring-indigo-500/20'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-mono">2</span>
                    <span>Apply Patch & Restart</span>
                  </span>
                  {isPrCreated && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {isPrCreated ? 'Patch applied & app server restarted with fix' : 'Approve PR below to restart server on fixed code'}
                </p>
              </div>

              {/* Step 3: Diff Comparison */}
              <div className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                isCompared
                  ? isPassed 
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' 
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  : isPrCreated && isBaseline
                  ? 'bg-slate-900 border-purple-500/50 shadow-md ring-1 ring-purple-500/20 text-slate-200'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-mono">3</span>
                    <span>Visual Diff & Layout</span>
                  </span>
                  {isCompared && (
                    isPassed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {isCompared ? (isPassed ? 'Zero regression & 0 layout shifts verified' : 'Visual drift or layout displacement detected') : 'Diffs fixed app vs baseline using pixelmatch'}
                </p>
              </div>
            </div>
          </div>

          {/* Contextual Action Callout based on Lifecycle */}
          <div className="space-y-4">
            {/* SCENARIO A: No baseline exists yet */}
            {!visualData && (
              <div className="p-4 bg-slate-950/90 border border-purple-500/30 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-purple-400" />
                      <span>Step 1: Capture Pre-Fix Baseline Screenshots</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                      The application is currently running the <strong>original unfixed code</strong>. Capture the baseline now so that after the patch is applied and the app restarts, pixelmatch can perform a real before-vs-after diff.
                    </p>
                  </div>

                  <button
                    onClick={handleRunVisualTest}
                    disabled={loadingVisual}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Camera className={`w-3.5 h-3.5 ${loadingVisual ? 'animate-spin' : ''}`} />
                    <span>{loadingVisual ? 'Capturing Baseline...' : 'Capture Pre-Fix Baseline'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCENARIO B: Baseline is created, but PR is not yet approved/applied */}
            {isBaseline && !isPrCreated && (
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Baseline Recorded ({visualData?.shots?.length || 'all'} routes) &mdash; Ready to Apply Patch</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed max-w-xl">
                      Baseline screenshots are safely stored in <code className="text-indigo-300 font-mono">tmp/{fixId.slice(0, 8)}.../baseline</code>. Now approve and apply the patch below to restart the dev server on the fixed code.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleRunVisualTest}
                      disabled={loadingVisual}
                      className="text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      title="Re-take baseline screenshots"
                    >
                      Re-capture
                    </button>
                    {onTriggerPR && (
                      <button
                        onClick={onTriggerPR}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <GitPullRequest className="w-3.5 h-3.5" />
                        <span>Approve & Apply Patch</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO C: PR is applied / app restarted, and baseline was created -> READY FOR DIFF! */}
            {isBaseline && isPrCreated && (
              <div className="p-4 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950 border border-purple-500/40 rounded-xl space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>App Server Restarted with Fix &mdash; Run Visual Comparison Now!</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed max-w-xl">
                      The dev server is serving the remediated code. Compare the fixed app against the pre-fix baseline to verify that no visual breakage or layout shifts occurred.
                    </p>
                  </div>

                  <button
                    onClick={handleRunVisualTest}
                    disabled={loadingVisual}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/25 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingVisual ? 'animate-spin' : ''}`} />
                    <span>{loadingVisual ? 'Diffing Fixed vs Baseline...' : 'Run Visual Comparison (Fixed vs Baseline)'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* SCENARIO D: Already compared -> show re-run button */}
            {isCompared && (
              <div className="flex items-center justify-between p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Visual comparison complete against pre-fix baseline</span>
                </div>
                <button
                  onClick={handleRunVisualTest}
                  disabled={loadingVisual}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingVisual ? 'animate-spin' : ''}`} />
                  <span>Re-run Visual Diff</span>
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {visualError && (
            <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{visualError}</span>
            </div>
          )}

          {/* Running State Spinner */}
          {loadingVisual && (
            <div className="p-6 bg-purple-950/20 border border-purple-500/20 rounded-xl text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-purple-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-200">
                  {isBaseline ? 'Diffing Fixed Screenshots against Baseline...' : 'Capturing Stabilized Screenshots with Playwright...'}
                </h5>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Pausing animations, awaiting font loads, measuring target element bounding boxes, and computing pixelmatch differential comparisons.
                </p>
              </div>
            </div>
          )}

          {/* Result Content */}
          {!loadingVisual && visualData && (
            <div className="space-y-5">
              {/* Metrics Summary Grid if compared */}
              {visualData.summary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Diff Ratio Card */}
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Max Pixel Drift</span>
                      <span className="font-mono text-purple-300">Max &le; {(visualData.summary.thresholds.failDiff * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-xl font-black font-mono ${
                        visualData.summary.maxDiffRatio < visualData.summary.thresholds.failDiff 
                          ? 'text-emerald-400' 
                          : 'text-rose-400'
                      }`}>
                        {(visualData.summary.maxDiffRatio * 100).toFixed(3)}%
                      </span>
                      <span className="text-[10px] text-slate-500">differential</span>
                    </div>
                  </div>

                  {/* Layout Shifts Card */}
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Layout Shifts</span>
                      <span className="font-mono text-purple-300">Tol &le; {visualData.summary.thresholds.layoutShiftPx}px</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-xl font-black font-mono ${
                        visualData.summary.layoutShiftCount === 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {visualData.summary.layoutShiftCount}
                      </span>
                      <span className="text-[10px] text-slate-500">elements shifted</span>
                    </div>
                  </div>

                  {/* Overall Gate Card */}
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-400">
                      <span>Quality Gate Status</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {isPassed ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-300">Zero Regression</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-rose-400" />
                          <span className="text-sm font-bold text-rose-300">Visual Drift</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Layout Shifts Details */}
              {visualData.layoutShifts && visualData.layoutShifts.length > 0 ? (
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Move className="w-4 h-4 text-amber-400" />
                    <span>Target Element Layout Displacement Detected:</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {visualData.layoutShifts.map((shift, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-amber-500/20">
                        <div className="truncate max-w-sm">
                          <span className="text-slate-500">Selector:</span> <span className="text-amber-300">{shift.selector}</span>
                          <span className="text-slate-500 ml-2">({shift.route})</span>
                        </div>
                        {shift.delta && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>dx: {shift.delta.dx}px</span>
                            <span>dy: {shift.delta.dy}px</span>
                            <span>dw: {shift.delta.dw}px</span>
                            <span>dh: {shift.delta.dh}px</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : visualData.comparisons && visualData.comparisons.length > 0 ? (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/25 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Layout stability confirmed: Target elements preserved spatial boundaries with 0 shifts.</span>
                </div>
              ) : null}

              {/* Route-by-Route Comparisons */}
              {visualData.comparisons && visualData.comparisons.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      <span>Audited Route Comparisons ({visualData.comparisons.length})</span>
                    </span>
                    {visualData.comparisons.length > 2 && (
                      <button
                        onClick={() => setShowAllRoutes(!showAllRoutes)}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{showAllRoutes ? 'Show Less' : 'View All'}</span>
                        {showAllRoutes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {(showAllRoutes ? visualData.comparisons : visualData.comparisons.slice(0, 3)).map((comp, idx) => {
                      const diffPct = typeof comp.diffRatio === 'number' ? (comp.diffRatio * 100).toFixed(3) : '0.000';
                      const withinTol = typeof comp.diffRatio === 'number' ? comp.diffRatio < 0.03 : true;

                      return (
                        <div key={idx} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-0.5 truncate">
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-indigo-400 font-bold">{comp.route}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                withinTol ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {withinTol ? 'Stable' : 'Regression'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate max-w-md">
                              {comp.diffFile ? `Diff Artifact: ${comp.diffFile}` : 'Stabilized baseline captured'}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 font-mono">
                            <div className="text-right">
                              <span className="text-slate-500 text-[10px] block">Diff Ratio</span>
                              <span className={`font-bold ${withinTol ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {diffPct}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLAYWRIGHT E2E TEST GENERATION */}
      {activeTab === 'e2e' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>Synthesize Playwright E2E Component Tests</span>
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically authors accessibility test specs for the modified component using Playwright test runner.
                </p>
              </div>

              <button
                onClick={handleGenerateTests}
                disabled={generatingTests}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generatingTests ? 'animate-spin' : ''}`} />
                <span>{generatingTests ? 'Authoring Tests...' : testGenData ? 'Re-generate Tests' : 'Generate Playwright Tests'}</span>
              </button>
            </div>

            {testError && (
              <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{testError}</span>
              </div>
            )}
          </div>

          {/* Generated Test Code Display */}
          {testGenData?.testCode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>Spec File: <strong className="text-purple-300">{testGenData.testFile || 'generated-test.spec.ts'}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(testGenData.testCode!)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Spec</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleRunTests}
                    disabled={runningTests}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Play className={`w-3 h-3 ${runningTests ? 'animate-spin' : ''}`} />
                    <span>{runningTests ? 'Running Suite...' : 'Execute Test Suite'}</span>
                  </button>
                </div>
              </div>

              {/* Code Box */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                  <span>Playwright Test Spec</span>
                  <span>TypeScript</span>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre leading-relaxed max-h-60">
                  {testGenData.testCode}
                </pre>
              </div>
            </div>
          )}

          {/* Test Execution Output Terminal */}
          {testRunData && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-200">Execution Output</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                    testRunData.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {testRunData.passed ? 'Suite Passed' : 'Suite Failed'}
                  </span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
                <pre className={testRunData.passed ? 'text-emerald-300 whitespace-pre-wrap' : 'text-rose-300 whitespace-pre-wrap'}>
                  {testRunData.output || (testRunData.passed ? 'All tests passed successfully.' : 'Tests failed.')}
                </pre>
              </div>
            </div>
          )}

          {!testGenData && (
            <div className="p-6 bg-slate-950/60 border border-slate-800/80 rounded-xl text-center space-y-1 text-slate-500 text-xs">
              <Info className="w-4 h-4 text-slate-500 mx-auto" />
              <p>Click "Generate Playwright Tests" to create targeted regression tests for this code patch.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
