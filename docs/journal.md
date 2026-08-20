# WorkSmart — Project Journal

Thought process, assumptions, and decisions recorded during the engagement.

## Entry 1 — Repo initialization and conventions

- Set up the monorepo: a root package.json with dev:server, dev:client, migrate, seed, test, and build scripts. .gitignore excludes node_modules, .env, *.db, exam.txt, and docs/superpowers/.
- Decision: keep the exam text and the agent's planning artifacts out of the committed tree (gitignored) to comply with the private repo and no public leak rule.

## Entry 2 — Execution approach (subagent-driven, not docs-first)

- The build ran the 36-task plan sequentially through subagent-driven execution in opencode: an implementer agent produced each task, a reviewer agent verified it, and work landed continuously on main (the user consented to work directly on main).
- Code tasks 1 to 27 were completed first (server: check-in parser, analytics, documents, AI routes, admin, then the React client: pages, components, GenAI panels). Documentation tasks 28 to 36 came afterward.
- This corrects an earlier stub that claimed docs were produced first by design. They were authored after the product code was complete and green.

## Entry 3 — Key reconciliation decisions (and why)

- Single API client (client/src/api.js), not api/client.js. The plan referenced api/client.js, which does not exist; the repo already had api.js with named functions, so the client was reconciled to that. Why: avoid a phantom module and keep one HTTP boundary.
- Zustand app store for shared identity and theme. Why: only the mock user identity (x-user-id) and the theme are genuinely cross-page; page data stays in local useState. Confirmed in docs/architecture.md (state row).
- Mock auth via the x-user-id header and an in-app identity switcher. The API defaults to user 1 (James Wong, admin) when the header is absent. Why: the switcher makes multi-user flows easy to demonstrate, while real auth and RBAC remain outside this assessment's scope.
- aggregateBy returns { series, total }. A planned byTag.slice was corrected to byTag.series.slice in server/src/routes/admin.js. Why: the function's actual return shape must be honored.
- Rule-based GenAI behind one service boundary. All six AI features are deterministic mocks in server/src/services/genai.js, swappable for a real LLM later. Why: permitted by the exam and keeps a clean seam.
- Admin and Insights routes are unguarded. With no auth backend, role checks live only in the seeded role field; the routes trust the x-user-id header. Why: consistency with the mock-auth model.

## Entry 4 — Assumptions (carried into code)

- Departments are a seeded string list; documents are typed PO, QUOTE, REQ, or OTHER.
- Check-in tags normalized to lowercase; a missing tag goes to general (eligible for smart categorization).
- Uploaded text files are read as UTF-8 for mock analysis; binary files fall back to filename or title.
- Seed: 100 users (Procurement is the majority) and 2,000+ check-ins, plus 9 documents. This clears the 100+ users and 1,000+ entries requirements.

## Entry 5 — Blockers encountered and how they were handled

- Node not on the default PATH. Used the nvm-provided Node at C:\Users\Admin\.nvm\versions\node\v24.19.0\bin, added to PATH per shell session.
- SQLite user ID skew. After an early reseed, seeded user IDs started at 307, so authMiddleware's default userId = 1 pointed at a missing user and every create or update returned a 500 FK violation. Fixed by reseeding so IDs start at 1.
- Playwright ran locally. The Docker stack was brought up, screenshots were captured with scripts/capture-screenshots.mjs and embedded in docs/user-guide.md, and all 10 Playwright UI/API specs pass against the live stack.
- A final Codex review found that the first server test setup reused the Docker SQLite database. Tests now create a unique disposable database per run; two complete suites pass concurrently without changing the demo data.
- Plan bugs found and fixed during the build. api/client.js non-existence, the Zustand-store assumption, byTag.slice to byTag.series.slice, and the missing role-guard reality were reconciled against the actual implementation.

## Entry 6 — Final status

- Application complete: 75 server tests and 34 client tests green, client build OK.
- Documentation complete: product-vision, architecture (plus diagram), roadmap, genai-approach, api, user-guide, ai-usage-log, and this journal.
- Deployed at https://worksmart.ctaprojects.xyz on the owner's VPS. All 10 Playwright specs passed against the public HTTPS URL; SQLite retained the same 100 users and database hash across an API-container restart.
- Demo video recorded: docs/presentation/demo.webm (under 5 minutes), walking through the six GenAI touchpoints.
