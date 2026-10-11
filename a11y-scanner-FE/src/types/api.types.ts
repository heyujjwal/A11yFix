export type ScanStatus = 'queued' | 'cloning' | 'installing' | 'starting' | 'scanning' | 'completed' | 'failed';
export type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor' | string;

export interface ScanRequestPayload {
  repoUrl: string;
  routes?: string[];
}

export interface ScanResponse {
  scanId: string;
  status: ScanStatus;
  progress?: number;
  repoUrl?: string;
  appUrl?: string;
  error?: string;
  createdAt?: string;
  message?: string;
}

export interface IssueNode {
  nodeId: string;
  page: string;
  selectors: string[];
  html: string;
  failureSummary?: string;
  sourceMapping?: {
    status: 'mapped' | 'unmapped';
    files: string[];
  };
  fixStatus?: string;
}

export interface IssueDetail {
  issueId: string;
  ruleId: string;
  description: string;
  impact?: ImpactLevel;
  wcagTags?: string[];
  page: string;
  htmlSnippet: string;
  target?: string[];
  helpUrl?: string;
  failureSummary?: string;
  title?: string;
  scanId?: string;
  elements?: IssueNode[];
}

export type FixStatus =
  | 'generating'
  | 'generated'
  | 'applying'
  | 'completed'
  | 'failed'
  | 'ready_for_pr'
  | 'pr_in_progress'
  | 'pr_created';

export interface FixVerification {
  clean?: boolean;
  violationCount?: number;
  violations?: unknown[];
}

export interface FixResponse {
  fixId: string;
  status: FixStatus;
  summary?: string | null;
  filePath?: string | null;
  newContent?: string | null;
  error?: string | null;
  createdAt?: string;
  prUrl?: string;
  verification?: FixVerification | null;
  visual?: VisualTestResult | null;
  testFile?: string | null;
  testCode?: string | null;
  message?: string;
  // Optional backwards compatibility
  scanId?: string;
  issueId?: string;
  pullRequest?: {
    number?: number;
    url: string;
    branch?: string;
    baseBranch?: string;
  } | null;
}

export interface VisualComparison {
  route: string;
  before?: string | null;
  after?: string | null;
  diffFile?: string | null;
  diffRatio?: number | null;
  error?: string;
}

export interface LayoutShift {
  route: string;
  selector: string;
  delta?: {
    dx: number;
    dy: number;
    dw: number;
    dh: number;
  };
  reason?: string;
}

export interface VisualTestSummary {
  maxDiffRatio: number;
  layoutShiftCount: number;
  thresholds: {
    failDiff: number;
    layoutShiftPx: number;
  };
}

export interface VisualTestResult {
  status: 'passed' | 'failed' | 'baseline-created';
  message?: string;
  baselineDir?: string;
  shots?: Array<{ route: string; file: string | null }>;
  comparisons?: VisualComparison[];
  layoutShifts?: LayoutShift[];
  summary?: VisualTestSummary;
}

export interface VisualTestResponse {
  fixId: string;
  visual: VisualTestResult | null;
  error?: string;
}

export interface TestGenResponse {
  fixId: string;
  testFile?: string;
  testCode?: string;
  message?: string;
  error?: string;
}

export interface TestRunResponse {
  fixId: string;
  passed?: boolean;
  output?: string;
  error?: string;
}