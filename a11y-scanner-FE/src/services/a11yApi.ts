import type { 
  ScanRequestPayload, 
  ScanResponse, 
  IssueDetail, 
  FixResponse,
  VisualTestResponse,
  TestGenResponse,
  TestRunResponse
} from '../types/api.types';

const API_BASE = '/api';

export const a11yApi = {
  async checkHealth(): Promise<{ status: string; timestamp?: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) {
      throw new Error('Backend server is unreachable');
    }
    return res.json();
  },

  async startScan(payload: ScanRequestPayload): Promise<ScanResponse> {
    const res = await fetch(`${API_BASE}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to start repository scan');
    }
    return res.json();
  },

  async getScan(scanId: string): Promise<ScanResponse> {
    const res = await fetch(`${API_BASE}/scans/${scanId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch scan progress');
    }
    return res.json();
  },

  async getIssues(scanId: string): Promise<{ count: number; issues: IssueDetail[] }> {
    const res = await fetch(`${API_BASE}/scans/${scanId}/issues`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch accessibility findings');
    }
    return res.json();
  },

  async getIssueDetail(scanId: string, issueId: string): Promise<IssueDetail> {
    const res = await fetch(`${API_BASE}/scans/${scanId}/issues/${issueId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch issue details');
    }
    return res.json();
  },

  async generateFix(scanId: string, issueId: string): Promise<FixResponse> {
    const res = await fetch(`${API_BASE}/scans/${scanId}/issues/${issueId}/fixes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to trigger AI fix generation');
    }
    return res.json();
  },

  async getFixStatus(fixId: string): Promise<FixResponse> {
    const res = await fetch(`${API_BASE}/fixes/${fixId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to poll fix status');
    }
    return res.json();
  },

  async createPullRequest(fixId: string): Promise<FixResponse> {
    const res = await fetch(`${API_BASE}/fixes/${fixId}/pull-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to initiate pull request creation');
    }
    return res.json();
  },

  async getVisualTest(fixId: string): Promise<VisualTestResponse> {
    const res = await fetch(`${API_BASE}/fixes/${fixId}/visual-test`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch visual test result');
    }
    return res.json();
  },

  async runVisualTest(fixId: string): Promise<VisualTestResponse> {
    const res = await fetch(`${API_BASE}/fixes/${fixId}/visual-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to execute visual regression test');
    }
    return res.json();
  },

  async generateTests(fixId: string): Promise<TestGenResponse> {
    const res = await fetch(`${API_BASE}/fixes/${fixId}/tests/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate Playwright tests');
    }
    return res.json();
  },

  async runTests(fixId: string): Promise<TestRunResponse> {
    const res = await fetch(`${API_BASE}/fixes/${fixId}/tests/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to run test suite');
    }
    return res.json();
  }
};