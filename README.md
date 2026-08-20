# WorkSmart — GenAI-Enhanced Work Management Platform

Take-home submission for the Engineering Consultant (Software Engineering) role at Thinking Machines Data Science.
Case study: Meridian Manufacturing. Unified time tracking plus procurement document management, with GenAI features.
Written in-character as a Thinking Machines software engineer, per the exam brief.

## Quick Links (Master Index)

This README indexes every deliverable the exam asks for. Each file is linked here and in Submission Notes below.

| Deliverable | Link / Status |
| --- | --- |
| Deployed App | [https://worksmart.ctaprojects.xyz](https://worksmart.ctaprojects.xyz) |
| Source Code (GitHub, private) | this repository |
| Demo Video (under 5 min) | [demo.webm](docs/presentation/demo.webm) ([script](docs/presentation/demo-script.md)) |
| Slides (5 or fewer) | [slides.md](docs/presentation/slides.md) |
| Product Vision (2 to 3 pages) | [product-vision.md](docs/product-vision.md) |
| Product Roadmap (1 to 2 pages) | [roadmap.md](docs/roadmap.md) |
| Architecture Diagram + Decisions | [architecture.md](docs/architecture.md) and [architecture-diagram.md](docs/architecture-diagram.md) |
| Mock GenAI Implementation Notes | [genai-approach.md](docs/genai-approach.md) |
| User Guide (with screenshots) | [user-guide.md](docs/user-guide.md) |
| API Reference | [api.md](docs/api.md) |
| AI Tool Usage Log (prompts and outputs) | [ai-usage-log.md](docs/ai-usage-log.md) |
| Project Journal | [journal.md](docs/journal.md) |

Transparency: representative prompts, adopted outputs, corrections, and final checks from opencode and Codex are recorded in docs/ai-usage-log.md.

## Overview

WorkSmart is a GenAI-enhanced work management platform built for Meridian Manufacturing. It combines three things:

1. Time tracking. Structured check-ins (`<number> [hr|hrs] #<tag> <activities>`), multi-user support, and charts by tag, date, department, or user.
2. Document management. Upload, store, and track procurement documents (POs, quotes, requisitions), linked to time entries with per-document time totals.
3. GenAI features. Six of six mock-implemented UX touchpoints. The exam requires a minimum of three.

Problem it solves: Meridian logs time in spreadsheets and handles procurement documents by hand. That makes productivity, resource allocation, and document throughput hard to measure. WorkSmart puts both in one place and surfaces insights, including AI-written summaries and anomaly flags, that were not possible before.

## Features (all implemented)

Core time tracking
- Structured check-in parser (`<number> [hr|hrs] #<tag> <activities>`)
- View and paginate 1,000+ check-ins
- Group and chart by tag, date, department, or user
- Edit and delete check-ins
- Multi-user support (100 users seeded)
- Light and dark theme (class-based toggle, persists choice, respects prefers-color-scheme) with accessibility (focus-visible rings, skip-to-content link, aria labels, reduced-motion safe). Built with Tailwind CSS v4.

Document management
- Upload and store procurement documents (POs, quotes, requisitions)
- Link documents to time entries
- Track time spent per document (`totalTimeSpent`)
- Status tracking (pending, in-review, approved, rejected)

GenAI features (mock implementations; six built, three required)
- Smart Categorization. Suggested tags in the check-in form from free text.
- Document Analysis. Mock field extraction (vendor, amount, dates, line items) on the document detail page.
- Workflow Suggestions. Next-step recommendations per document.
- Natural Language Search. Ask about check-ins or documents in plain English. Returns an answer plus result cards.
- Time Insights. Productivity and usage summaries on the dashboard.
- Anomaly Detection. Flags long entries, missing documents, weekend work, and more.

All GenAI features are mocks, as the exam allows ("you are NOT required to implement actual GenAI integration"). Each sits behind a swappable service boundary so a real LLM can replace it later. See docs/genai-approach.md.

## Tech Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | React (Vite, JavaScript not TypeScript) and Tailwind CSS v4 | Required by spec. Vite for fast dev and build. Tailwind v4 (CSS-first @theme, tokens in client/src/styles.css) for one design system. |
| State | Zustand for identity/theme; component-local request state | Only truly cross-page state is global. Page data stays request-scoped. |
| Backend | Node.js and Express | Same language as the frontend. Minimal setup. |
| Database | SQLite via Prisma | Zero local setup; Docker and the VPS use a persistent database volume. |
| Deployment | Docker Compose on a VPS behind nginx and Let's Encrypt | Runs the tested client, API, and SQLite stack without a provider-specific database swap. |
| GenAI (mocked) | Rule-based fixtures and keyword matches | Deterministic mocks. No external APIs. |

Full rationale is in docs/architecture.md.

## Project Structure

```
worksmart/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api.js          # single API client (VITE_API_URL-aware)
│   │   ├── pages/          # route-level data orchestration
│   │   ├── components/     # Atomic Design: atoms, molecules, organisms, templates
│   │   └── store/          # Zustand identity and theme state
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Express API
│   ├── src/
│   │   ├── routes/         # HTTP controllers and URI plumbing
│   │   ├── services/       # business use cases and response shaping
│   │   ├── repositories/   # all Prisma/data access
│   │   └── middleware/      # auth (x-user-id), error
│   ├── prisma/             # schema and SQLite dev db
│   ├── Dockerfile
│   └── render.yaml         # Render blueprint (deploy)
├── docs/                   # all written deliverables (see Quick Links)
├── docker-compose.yml      # containerized local run
└── README.md               # this master index
```

## Getting Started

Prerequisites
- Node.js 20 or newer (developed on v24)
- npm
- SQLite (bundled, no install for local dev)
- Docker (optional, for containerized run)

Installation
```bash
git clone <your-private-repo-url> worksmart
cd worksmart

npm --prefix server install
npm --prefix client install

cp server/.env.example server/.env   # DATABASE_URL defaults to local SQLite

npm run migrate     # npx prisma db push
npm run seed        # seeds only an empty DB; add -- --force for an intentional reset
```

Run locally
```bash
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:5173 (Vite proxies /api to :4000)
```

Run with Docker
```bash
docker compose up --build
# client (nginx)  -> http://localhost:8080
# server (API)    -> http://localhost:4000
```

Run tests
```bash
npm --prefix server test    # 75 tests on a per-run isolated disposable test DB
npm --prefix client test    # 34 tests
npm --prefix client run build
npm run test:e2e            # 10 Playwright UI/API specs (needs Docker stack running)
```

## Deployment

The app is deployed at [worksmart.ctaprojects.xyz](https://worksmart.ctaprojects.xyz) as an isolated Docker Compose project on a VPS. The existing nginx gateway terminates HTTPS and proxies `/api` to the Express service; SQLite lives in the persistent `worksmart_data` volume.

- deploy/vps. Active VPS Compose and nginx configuration.
- server/render.yaml and client/vercel.json. Alternative Render/Vercel deployment configuration.
- docker-compose.yml. One-command local deployment.
- The server startup applies the Prisma schema and runs a non-destructive seed: existing data is never replaced unless `npm run seed -- --force` is explicitly used.

The public HTTPS deployment passed all 10 Playwright browser and API flows. SQLite retained the same 100 users and database hash across an API-container restart, and the certificate renewal simulation passed.

## GenAI Tooling Disclosure

opencode assisted with the first implementation. OpenAI Codex Desktop handled the final engineering review, debugging, UI work, and documentation pass. The tools, representative prompts, adopted outputs, corrections, and verification evidence are recorded in docs/ai-usage-log.md.

## Assumptions Made

- Multi-user. No real auth was built (UX-first scope). The login screen is a mock user switcher; identity travels in the `x-user-id` HTTP header and the API defaults to seeded user 1 when absent. Documented in docs/api.md.
- Departments. Seeded string list (Procurement, Engineering, Finance, Operations, Sales, HR) until an admin-managed org structure is scoped.
- Check-in tags. Free-form strings normalized to lowercase. Missing tags default to general and are eligible for Smart Categorization.
- Document text. TXT, Markdown, CSV, JSON, and LOG files up to 5 MB are retained as UTF-8 text for mock analysis. Unsupported binary formats are rejected clearly rather than silently discarded.
- Data volume. Seeded with 100 users and 2,000+ check-ins. This clears the 100+ users and 1,000+ entries bar out of the box.
- GenAI. All six GenAI features are deterministic mocks behind server/src/services/genai.js, built to be swapped for a real LLM later.

Full rationale is in docs/architecture.md and docs/journal.md.

## Roadmap Summary

Short-term (3 to 6 months), medium-term (6 to 12 months), and long-term (12+ months) priorities are in docs/roadmap.md. They cover the mock to real GenAI path, RBAC, ERP integration, and challenge mitigations.

## Exam Requirements to Deliverables Map

| Exam requirement | Where it lives |
| --- | --- |
| Working app (repo and URL) | this repo. Deploy config in server/render.yaml, client/vercel.json, docker-compose.yml |
| README with setup | this file |
| Architecture diagram and decisions | docs/architecture.md, docs/architecture-diagram.md |
| Mock GenAI approach and details | docs/genai-approach.md |
| User guide with screenshots | docs/user-guide.md and docs/screenshots/ |
| Product vision (2 to 3 pages) | docs/product-vision.md |
| Product roadmap (1 to 2 pages) | docs/roadmap.md |
| Demo video (under 5 min) and slides (5 or fewer) | docs/presentation/ |
| At least 3 GenAI features | 6 built (see Features) |
| React frontend and DB persistence | client/ and server/ (Prisma and SQLite) |
| Responsive, intuitive UI | client/src/styles.css (mobile breakpoints) |
| Document GenAI approach | docs/genai-approach.md |
| Accessible via URL | Deployment section |
| Bonus: admin analytics | client/src/pages/AdminPage.jsx and /api/admin/analytics |
| Bonus: Dockerize | docker-compose.yml and Dockerfiles |
| Bonus: procurement workflows | document upload, status, linking, and suggestions |
| Bonus: extendable architecture | Validated document type contract, contentText and analysis fields. See docs/genai-approach.md |
| Bonus: error handling | server/src/middleware/error.js and server/tests/error.test.js |
| Bonus: project journal | docs/journal.md |
| Bonus: test coverage | 75 server tests and 34 client tests, plus 10 Playwright specs |
| Bonus: API documentation | docs/api.md |

## Submission Notes

- Repository is private. exam.txt is gitignored and not committed (per exam instructions not to leak the brief).
- Repository access is private. Read access is accepted by tm-chester-supelana; invitations are pending for mamerisawesome, butchtm, tm-jase-evangelista, and tm-glenn.
- All written deliverables are linked from this README (the exam's "index all your files in one document" requirement).
- Final submission step: email the deliverables link to hiring@thinkingmachin.es to stop the timer.
- Author: Christian Andrada. Submitted in-character as a Thinking Machines software engineer.
