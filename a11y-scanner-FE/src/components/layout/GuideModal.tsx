import React, { useEffect } from 'react';
import { X, ShieldCheck, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-indigo-500/10 flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">A11yFix Compliance & Remediation Guide</h2>
              <p className="text-xs text-slate-400">Autonomous WCAG 2.1 auditing and AI-assisted patch generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Section 1: The 4 Principles */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>WCAG 2.1 Core Principles (POUR)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  1. Perceivable
                </span>
                <p className="text-slate-400">
                  Information and UI components must be presentable to users in ways they can perceive (e.g. text alternatives, sufficient color contrast, captions).
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  2. Operable
                </span>
                <p className="text-slate-400">
                  Interface components and navigation must be fully operable by keyboard, without keyboard traps, with clear focus indicators and adequate time.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  3. Understandable
                </span>
                <p className="text-slate-400">
                  Information and operation of user interface must be understandable (predictable navigation, explicit input labels, meaningful error guidance).
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  4. Robust
                </span>
                <p className="text-slate-400">
                  Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Severity Levels */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Violation Severity Classifications</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-3 p-3 bg-red-950/20 border border-red-500/20 rounded-xl">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-red-500/20 text-red-400 uppercase tracking-wide shrink-0">
                  Critical
                </span>
                <p className="text-slate-300">
                  Completely blocks users of assistive technology (e.g. missing alternative text on essential image links, missing form labels, severe keyboard traps).
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-500/20 text-amber-400 uppercase tracking-wide shrink-0">
                  Serious
                </span>
                <p className="text-slate-300">
                  Causes major barriers or confusion (e.g. failing color contrast under 3:1, missing landmarks, incorrect ARIA role attributes).
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-950/20 border border-yellow-500/20 rounded-xl">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-yellow-500/20 text-yellow-400 uppercase tracking-wide shrink-0">
                  Moderate
                </span>
                <p className="text-slate-300">
                  Reduces usability or violates standards without fully blocking access (e.g. heading order skipping levels, suboptimal link text).
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-500/20 text-blue-400 uppercase tracking-wide shrink-0">
                  Minor
                </span>
                <p className="text-slate-300">
                  Nits and minor best practices that improve screen reader efficiency and code maintainability.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Remediation Workflow */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>How Gemma 4 AI Fixes Work</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>AST Localization</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Maps the rendered DOM element and selectors back to the repository source component file.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>Minimal Code Patch</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Synthesizes semantic HTML/ARIA attributes while strictly preserving existing business logic and styles.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>Visual Quality Gate</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Executes Playwright pixelmatch screenshot diffing and verifies layout shift tolerance (&le;8px).
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-mono">4</span>
                  <span>PR & Verification</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Builds the app, re-scans with axe-core to ensure 0 remaining violations, and opens a GitHub PR.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Got it, close guide
          </button>
        </div>
      </div>
    </div>
  );
};
