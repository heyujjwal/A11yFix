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
  error?: string | null;
  createdAt?: string;
  prUrl?: string;
  verification?: FixVerification | null;
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