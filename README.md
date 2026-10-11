# ✦ A11yFix

<p align="center">
  <strong>Find the friction. Fix the experience.</strong><br />
  An accessibility audit dashboard that turns web accessibility findings into reviewable fixes.
</p>

<p align="center">
  <a href="https://github.com/heyujjwal/A11yFix"><img alt="GitHub repository" src="https://img.shields.io/badge/GitHub-A11yFix-18181b?logo=github&logoColor=white" /></a>
  <img alt="React" src="https://img.shields.io/badge/Frontend-React%2019-61dafb?logo=react&logoColor=111827" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white" />
  <img alt="Accessibility engine" src="https://img.shields.io/badge/Audit-axe--core-6c47ff" />
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-22c55e.svg" /></a>
</p>

---

## The idea

Accessibility work should feel less like hunting through a report and more like a clear path to a better experience. **A11yFix** gives you a polished, dark-mode workspace to scan a GitHub website, inspect accessibility findings, and review AI-generated code changes before they become a pull request.

Paste a repository URL, choose the routes to audit, and follow the scan from clone to findings. Select an issue to see its details, request a focused fix, and review the proposed change before deciding whether to open a PR.

## ✨ What you can do

- **Audit selected routes** in a GitHub-hosted web app with Playwright and axe-core.
- **Watch scan progress** and review findings in a dashboard with issue details and summary metrics.
- **Generate targeted accessibility fixes** that are validated before they are shown for review.
- **Inspect the proposed change** before opening a GitHub pull request.
- **Check visual regressions** and generate or run Playwright tests for a fix.
- **Start quickly with the sample repository** already available in the scan form.

## 🪄 The workflow

```text
GitHub repository + routes
            │
            ▼
 Clone → install → start app → scan with Playwright + axe-core
                                      │
                                      ▼
                         Findings dashboard → select an issue
                                      │
                                      ▼
                  Generate → validate → review fix → optional PR
                                      │
                                      ▼
                      Visual checks + generated Playwright tests
```

## 🧰 Built with

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Lucide icons |
| API | Node.js, Express |
| Accessibility and browser automation | axe-core, Playwright |
| AI-assisted fixes and test generation | OpenRouter API (default model: `inclusionai/ling-3.0-flash`) |
| GitHub integration | Octokit, simple-git |

> The interface currently describes the experience as Gemma-powered, but the backend's actual default is configured through OpenRouter as `inclusionai/ling-3.0-flash`. Set `OPENROUTER_MODEL` to use another compatible model.

## 🚀 Run it locally

### Prerequisites

- Node.js and npm
- Git
- An OpenRouter API key for AI fix generation and test generation
- A GitHub personal access token for GitHub operations such as creating pull requests

### 1. Configure the backend

```powershell
cd backend
npm install
```

Create `backend/.env` and add your keys:

```dotenv
OPENROUTER_API_KEY=your_openrouter_api_key
GITHUB_TOKEN=your_github_token
# Optional: defaults to inclusionai/ling-3.0-flash
OPENROUTER_MODEL=inclusionai/ling-3.0-flash
# Optional: defaults to 3000
PORT=3000
# Optional comma-separated scan routes
ROUTES=/,/contact,/products
```

Never commit API keys or tokens.

Start the API in one terminal:

```powershell
npm run dev
```

The API listens on `http://localhost:3000`; its health endpoint is `http://localhost:3000/api/health`.

### 2. Start the frontend

In a second terminal, from the repository root:

```powershell
cd a11y-scanner-FE
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The Vite development server proxies `/api` requests to the backend on port `3000`.

### Other useful commands

Run these from their respective project folders:

```powershell
# Frontend (a11y-scanner-FE)
npm run build
npm run lint
npm run preview

# Backend (backend)
npm test
npm run test:api
npm start
```

## 🔌 API at a glance

The backend exposes a small JSON API under `/api`:

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Check backend availability |
| `POST /api/scans` | Start a repository scan |
| `GET /api/scans/:scanId` | Read scan status and progress |
| `GET /api/scans/:scanId/issues` | List scan findings |
| `GET /api/scans/:scanId/issues/:issueId` | Read finding details |
| `POST /api/scans/:scanId/issues/:issueId/fixes` | Generate a fix for a finding |
| `GET /api/fixes/:fixId` | Check fix status |
| `POST /api/fixes/:fixId/pull-request` | Create a pull request |
| `GET` or `POST /api/fixes/:fixId/visual-test` | Read or run a visual test |
| `POST /api/fixes/:fixId/tests/generate` | Generate Playwright tests |
| `POST /api/fixes/:fixId/tests/run` | Run generated tests |

## 🗂️ Project layout

```text
A11yFix/
├── a11y-scanner-FE/       # React + TypeScript dashboard
│   └── src/
│       ├── components/    # Scan form, findings, metrics, fix review
│       ├── services/      # Frontend API client
│       └── types/         # API types
└── backend/               # Express API and scan/remediation jobs
    ├── src/
    │   ├── routes/        # Scan, fix, and test endpoints
    │   ├── services/      # GitHub, scanner, AI, and test services
    │   ├── jobs/          # Scan workflow runner
    │   └── store/         # In-memory scan and fix state
    └── scripts/           # Backend test runners
```

## ⚠️ Before scanning a repository

A scan clones the supplied repository, installs its npm dependencies, and starts its app to inspect the requested routes. **Only scan repositories you trust.** This workflow runs repository-provided install and start scripts on the machine hosting the backend; the current implementation uses temporary working directories, not an isolated security sandbox.

Scan and fix state is stored in memory, so it is cleared when the backend restarts. Repository clones and running app processes also consume local resources.

## 🤝 Contributing

Issues and pull requests are welcome. For a change, include a short description of the problem or improvement and any relevant test or verification steps.

## 📄 License

A11yFix is released under the [MIT License](./LICENSE).
