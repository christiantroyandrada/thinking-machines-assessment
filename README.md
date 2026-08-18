# WorkSmart — GenAI-Enhanced Work Management Platform

> Take-home submission for the Engineering Consultant (Software Engineering) role at Thinking Machines Data Science.
> Case study: **Meridian Manufacturing** — unified time tracking + procurement document management with GenAI features.
> Authored in-character as a Thinking Machines software engineer, per the exam brief.

---

## 📌 Quick Links (Master Index)

This README is the **single index of all deliverables** the exam asks for. Every file is linked here and (where applicable) in the Submission Notes below.

| Deliverable | Link / Status |
|---|---|
| 🚀 Deployed App | *To be added after deploy — see [Deployment](#-deployment)* |
| 💻 Source Code (GitHub, private) | this repository |
| 🎥 Demo Video (≤5 min) | *To be added — see [`docs/presentation/demo-script.md`](./docs/presentation/demo-script.md)* |
| 📊 Slides (≤5) | [`docs/presentation/slides.md`](./docs/presentation/slides.md) |
| 📄 Product Vision (2–3 pp) | [`docs/product-vision.md`](./docs/product-vision.md) |
| 🗺️ Product Roadmap (1–2 pp) | [`docs/roadmap.md`](./docs/roadmap.md) |
| 🏗️ Architecture Diagram + Decisions | [`docs/architecture.md`](./docs/architecture.md) (+ [`docs/architecture-diagram.md`](./docs/architecture-diagram.md)) |
| 🤖 Mock GenAI Implementation Notes | [`docs/genai-approach.md`](./docs/genai-approach.md) |
| 📘 User Guide (w/ screenshots) | [`docs/user-guide.md`](./docs/user-guide.md) |
| 📜 API Reference | [`docs/api.md`](./docs/api.md) |
| 🧵 AI Tool Usage Log (prompts + outputs) | [`docs/ai-usage-log.md`](./docs/ai-usage-log.md) |
| 📓 Project Journal | [`docs/journal.md`](./docs/journal.md) |

> **Transparency:** prompts given to the AI coding tool and the generated outputs are logged with **real transcripts** in [`docs/ai-usage-log.md`](./docs/ai-usage-log.md) (see *§Real conversation transcripts*), as required by the exam.

---

## 🧭 Overview

**WorkSmart** is a GenAI-enhanced work management platform built for Meridian Manufacturing, combining:

1. **Time Tracking** — structured check-ins (`<number> [hr|hrs] #<tag> <activities>`), multi-user support, and visualizations by tag / date / department / user.
2. **Intelligent Document Management** — upload, store, and status-track procurement documents (POs, quotes, requisitions), linked to time entries with per-document time totals.
3. **GenAI Features** — **6 of 6** mock-implemented, UX-first touchpoints (the exam requires a minimum of 3).

### Problem it solves
Meridian logs time in spreadsheets and processes procurement documents manually, making productivity, resource allocation, and document throughput hard to analyze. WorkSmart unifies both and surfaces insights (including AI-generated narratives and anomaly flags) that weren't previously possible.

---

## ✅ Features (all implemented)

### Core Time Tracking
- [x] Structured check-in parser (`<number> [hr|hrs] #<tag> <activities>`)
- [x] View / paginate 1000+ check-ins
- [x] Group / visualize by tag, date, department, user
- [x] Edit / delete check-ins
- [x] Multi-user support (seeded **132 users**)
- [x] **Light / dark theme** (class-based toggle, persists choice, respects `prefers-color-scheme`) + **accessibility** (focus-visible rings, skip-to-content link, `aria` labels, `color-scheme` aware, reduced-motion safe) — built with Tailwind CSS v4

### Intelligent Document Management
- [x] Upload & store procurement documents (POs, quotes, requisitions)
- [x] Link documents to time entries
- [x] Track time spent per document (`totalTimeSpent`)
- [x] Status tracking (pending / in-review / approved / rejected)

### GenAI Features (mock implementations; 6 implemented, min 3 required)
- [x] **Smart Categorization** — suggested tags in the check-in form from free-text
- [x] **Document Analysis** — mock field extraction (vendor, amount, dates, line items) on the document detail page
- [x] **Workflow Suggestions** — next-step recommendations per document
- [x] **Natural Language Search** — query check-ins/documents in plain English → answer + result cards
- [x] **Time Insights** — productivity / usage pattern summaries on the dashboard
- [x] **Anomaly Detection** — flags long entries, missing docs, weekend work, etc.

> All GenAI features are **mock** implementations per the exam ("you are NOT required to implement actual GenAI integration"). Each is designed behind a swappable service boundary so it can later be replaced by a real LLM — see [`docs/genai-approach.md`](./docs/genai-approach.md).

---

## 🏗️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React.js (Vite, **JavaScript, not TS**) + **Tailwind CSS v4** | Required by spec; Vite for fast dev/build; Tailwind v4 (CSS-first `@theme`, design tokens in `client/src/styles.css`) for a maintainable, centralized design system |
| State | **React component-local state** (no global store) | The plan's Zustand store was dropped during implementation — the app uses local `useState` + a single `api.js` client; this keeps the client simple and the `api.js` boundary easy to swap |
| Backend | Node.js + Express | Same language as frontend; minimal setup |
| Database | SQLite (Prisma) → Postgres if deployed | Zero local setup with SQLite; Prisma makes the swap trivial |
| Deployment | Vercel (frontend) + Render (backend + Postgres) | Fast zero-config deploys with free tiers |
| GenAI (mocked) | Rule-based fixtures & keyword matches | UX-focused mocks: deterministic, no external APIs |

Full rationale in [`docs/architecture.md`](./docs/architecture.md).

---

## 📂 Project Structure

```
worksmart/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api.js          # single API client (VITE_API_URL-aware)
│   │   ├── pages/          # CheckIns, Analytics, Documents, DocumentDetail, Search, Home(dashboard), Admin
│   │   └── components/     # Pagination, StatusBadge, TagPill, InsightCard, AnomalyBanner, TimeChart, ...
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Express API
│   ├── src/
│   │   ├── routes/         # checkins, analytics, users, documents, ai, admin
│   │   ├── services/       # parser, analytics, genai (mock engine)
│   │   └── middleware/      # auth (x-user-id), error
│   ├── prisma/             # schema + SQLite dev db
│   ├── Dockerfile
│   └── render.yaml         # Render blueprint (deploy)
├── docs/                   # All written deliverables (see Quick Links)
├── docker-compose.yml      # containerized local run
└── README.md               # this master index
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20 (developed against v24)
- npm
- SQLite (bundled — no install needed for local dev)
- Docker (optional, for containerized run)

### Installation
```bash
git clone <your-private-repo-url> worksmart
cd worksmart

npm --prefix server install
npm --prefix client install

cp server/.env.example server/.env   # DATABASE_URL defaults to local SQLite

npm run migrate     # npx prisma db push
npm run seed        # 132 users, 2591 check-ins, 9 documents
```

### Running locally
```bash
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:5173 (Vite proxies /api -> :4000)
```

### Running with Docker (bonus)
```bash
docker compose up --build
# client (nginx)  -> http://localhost:8080
# server (API)    -> http://localhost:4000
```

### Running tests
```bash
npm --prefix server test    # 49 tests
npm --prefix client test    # 14 tests
npm --prefix client run build
npm run test:e2e            # Playwright E2E + API integration (needs Docker stack running)
```

---

## 🌐 Deployment

The app is **containerized** and ships with Render + Vercel configuration so it is reachable via a public URL (exam requirement: *"The application should be accessible via a URL"*).

- `server/render.yaml` — Render web service + free Postgres blueprint.
- `client/vercel.json` — Vercel build/output config; set `VITE_API_URL` to the Render API URL.
- `docker-compose.yml` — one-command local deployment.
- Production DB swap (SQLite → Postgres) is documented in [`docs/architecture.md`](./docs/architecture.md) and [`server/.env.production.example`](./server/.env.production.example).

> The live Deployed App URL (Render + Vercel, Task 35) is filled into the Quick Links table after the manual deploy steps. The containerized app is **verified running locally** via Docker: client at `http://localhost:8080` and API at `http://localhost:4000`, with `npm run test:e2e` passing (7 Playwright specs).

---

## 🤖 GenAI Tooling Disclosure

This submission's planning, code scaffolding, and documentation were assisted by **opencode** (an AI coding agent). Prompts and generated outputs are logged in [`docs/ai-usage-log.md`](./docs/ai-usage-log.md) (with links/screenshots of the working conversation), per the exam's transparency requirement.

---

## 📋 Assumptions Made

- **[Multi-user]** No real auth was built (UX-first scope). Identity is carried by the `x-user-id` HTTP header; the API defaults to user `1` (James Wong, admin) when the header is absent. There is **no in-app user switcher** — callers (and tests) set `x-user-id` directly. This is documented in [`docs/api.md`](./docs/api.md).
- **[Departments]** Seeded string list (Procurement, Engineering, Finance, Operations, Sales, HR) until an admin-managed org structure is scoped.
- **[Check-in tags]** Free-form strings normalized to lowercase; missing tags default to `general` and are eligible for Smart Categorization.
- **[Document text]** Uploaded files are read as UTF-8 text for mock analysis; binary files fall back to filename/title-based extraction.
- **[Data volume]** Seeded with **132 users and 2630 check-ins** (exceeds the 100+ users / 1000+ entries requirements out of the box).
- **[GenAI]** All six GenAI features are deterministic mocks behind `server/src/services/genai.js`, designed to be swapped for a real LLM later.

Full rationale in [`docs/architecture.md`](./docs/architecture.md) and [`docs/journal.md`](./docs/journal.md).

---

## 🗺️ Roadmap Summary

Short-term (3–6mo), medium-term (6–12mo), and long-term (12mo+) priorities — including the mock→real GenAI path, RBAC, ERP integration, and challenge mitigations — are detailed in [`docs/roadmap.md`](./docs/roadmap.md).

---

## 📑 Exam Requirements → Deliverables Map

| Exam requirement | Where it lives |
|---|---|
| Working app (repo + URL) | this repo; deploy config in `server/render.yaml`, `client/vercel.json`, `docker-compose.yml` |
| README with setup | this file |
| Architecture diagram + decisions | `docs/architecture.md`, `docs/architecture-diagram.md` |
| Mock GenAI approach + details | `docs/genai-approach.md` |
| User guide w/ screenshots | `docs/user-guide.md` (+ `docs/screenshots/`) |
| Product vision (2–3 pp) | `docs/product-vision.md` |
| Product roadmap (1–2 pp) | `docs/roadmap.md` |
| Demo video (≤5 min) + slides (≤5) | `docs/presentation/` |
| ≥3 GenAI features | 6 implemented (see Features) |
| React frontend + DB persistence | `client/`, `server/` (Prisma + SQLite) |
| Responsive, intuitive UI | `client/src/styles.css` (mobile breakpoints) |
| Document GenAI approach | `docs/genai-approach.md` |
| Accessible via URL | Deployment section |
| Bonus: admin analytics | `client/src/pages/AdminPage.jsx` + `/api/admin/analytics` |
| Bonus: Dockerize | `docker-compose.yml` + Dockerfiles |
| Bonus: procurement workflows | document upload/status/linking + suggestions |
| Bonus: extendable architecture | `Document.type` enum + `contentText`/`analysis` fields; doc `genai-approach.md` |
| Bonus: error handling | `server/src/middleware/error.js` + `server/tests/error.test.js` |
| Bonus: project journal | `docs/journal.md` |
| Bonus: test coverage | 49 server + 14 client tests |
| Bonus: API documentation | `docs/api.md` |

---

## 🙋 Submission Notes

- Repository is **private**; `exam.txt` is gitignored and **not** committed (per exam instructions not to leak the brief).
- Repository shared privately with: `mamerisawesome`, `tm-chester-supelana`, `butchtm`, `tm-jase-evangelista`, `tm-glenn`.
- All written deliverables are linked from this README (the exam's "index all your files in one document" requirement).
- Submitted to: **hiring@thinkingmachin.es** (email stops the 72-hour timer).
- Author: Christian Andrada — submitted in-character as a Thinking Machines software engineer.
