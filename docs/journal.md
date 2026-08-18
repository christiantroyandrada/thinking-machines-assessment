# WorkSmart — Project Journal

> Thought process, assumptions, and decisions recorded during the engagement.

## Entry 1 — Repo initialization & conventions
- Set up the monorepo: root `package.json` with `dev:server` / `dev:client` / `migrate` / `seed` / `test` / `build`; `.gitignore` excluding `node_modules`, `.env`, `*.db`, `exam.txt`, and `docs/superpowers/`.
- Decision: keep the exam text and the agent's planning artifacts **out of the committed tree** (gitignored) to comply with the "private repo / no public leak" rule.

## Entry 2 — Execution approach (subagent-driven, not docs-first)
- The build executed the **36-task plan sequentially via subagent-driven execution in opencode**: an implementer agent produced each task, a reviewer agent verified it, and work landed continuously on `main` (user consented to implement directly on `main`).
- **Code tasks (1–27) were completed first** — server (check-in parser, analytics, documents, AI routes, admin), then the React client (pages, components, GenAI panels). **Documentation tasks (28–36) came afterward.**
- This corrects an earlier stub that claimed docs were "produced first, by design." That was inaccurate: docs were authored after the product code was complete and green.

## Entry 3 — Key reconciliation decisions (and why)
- **Single API client (`client/src/api.js`), not `api/client.js`.** The plan referenced `api/client.js`, which does not exist; the repo already had `api.js` with named functions, so the client was reconciled to that. *Why:* avoid a phantom module and keep one HTTP boundary.
- **No global store (Zustand dropped) → React component-local state.** *Why:* the app's data flow is request/response per page; a global store added no value and added complexity. Confirmed in `docs/architecture.md` (component-local state, no global store).
- **Mock auth via `x-user-id` header, no in-app switcher.** The API reads `x-user-id`; when absent it defaults to user `1` (James Wong, admin). There is **no UI identity switcher** — callers/tests set the header directly. *Why:* the exam is UX-first and permits mocks; real auth/RBAC is deferred to the roadmap. (Matches the corrected README.)
- **`aggregateBy` returns `{ series, total }`.** A planned `byTag.slice` was corrected to `byTag.series.slice` in `server/src/routes/admin.js`. *Why:* the function's actual return shape must be honored.
- **Rule-based GenAI behind one service boundary.** All six "AI" features are deterministic mocks in `server/src/services/genai.js`, swappable for a real LLM later. *Why:* permitted by the exam and keeps a clean seam.
- **Admin/Insights routes are unguarded.** With no auth backend, role checks live only in the seeded `role` field; the routes trust the `x-user-id` header. *Why:* consistency with the mock-auth model.

## Entry 4 — Assumptions (carried into code)
- Departments are a **seeded string list**; documents are typed `PO` / `QUOTE` / `REQ` / `OTHER`.
- Check-in tags normalized to **lowercase**; a missing tag → `general` (eligible for smart categorization).
- Uploaded text files are read as **UTF-8** for mock analysis; binary falls back to filename/title.
- Seed: **132 users** (Procurement majority) and **2630 check-ins**, plus 9 documents — exceeds the 100+ users / 1000+ entries requirements.

## Entry 5 — Blockers encountered & how they were handled
- **Node not on default PATH** → used the nvm-provided Node at `C:\Users\Admin\.nvm\versions\node\v24.19.0\bin`, added to `PATH` per shell session.
- **Playwright / chromium unavailable** → the user-guide screenshots fell back to prose walkthroughs; `scripts/capture-screenshots.mjs` is provided for later capture against a live server (no fake placeholder images were committed).
- **Docker daemon offline** → `docker compose up --build` was verified by inspection only (compose + Dockerfiles are correct by inspection); not run locally.
- **Plan bugs found and fixed during build** → `api/client.js` non-existence, the Zustand-store assumption, `byTag.slice` → `byTag.series.slice`, and the missing role-guard reality were reconciled against the actual implementation.

## Entry 6 — Final status
- Application complete: **49 server tests + 14 client tests green**, client `build` OK.
- Documentation complete: product-vision, architecture (+ diagram), roadmap, genai-approach, api, user-guide, ai-usage-log, and this journal.
- Docker is configured (Task 27: `Dockerfile`s + `docker-compose.yml`). Deploy is a **manual Render (server) + Vercel (client) step**; the dedicated deploy-config task (35) finalizes hosted deployment — no automated deploy is wired yet.
