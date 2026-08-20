# WorkSmart — Presentation Slides

## Slide 1 — Problem

Meridian runs on disconnected manual effort.

- Time tracking lives in spreadsheets. Analysts fill in rows of hours, tags are free text, and there is no structured link between time spent and the work it produced.
- Procurement document processing (purchase orders, quotes, requisitions) is done by hand: open PDFs, copy fields into forms, decide next steps with no help.
- Effort is severed from output. Leadership cannot answer "how much time did procurement actually take?" because the documents and the time logs never meet.

The result: wasted coordination time, no analytics, and no value drawn from data that is already being captured.

## Slide 2 — Solution

WorkSmart is a unified platform that connects effort to outcomes.

- Structured check-ins. Quick, parser-friendly time entries with smart suggested tags (1.5 hrs #meeting standup).
- Analytics. Slice logged time by tag, department, and user to see where effort really goes.
- Document workflows. Upload POs, quotes, and REQs, drive them through a pending to in-review to approved lifecycle.
- Document to time linking. Attach check-ins to a document and surface totalTimeSpent automatically, finally joining effort to output.

One workspace, no spreadsheet exports, no copy-paste.

## Slide 3 — GenAI Touchpoints

Six UX-first GenAI features, built behind a swappable mock service layer so the UI ships now and the model swaps in later.

1. Smart categorization. Auto-suggests a tag for a check-in from its free-text activities.
2. Document analysis. Extracts structured fields (vendor, amount, line items) from an uploaded PO, quote, or REQ via Analyze with AI.
3. Workflow suggestions. Recommends the next status or routing step for a document based on its contents.
4. Natural-language search. Ask "how much time on procurement this month?" and get an answer plus result cards.
5. Time insights. Summarizes trends and shows where time is concentrating on the dashboard.
6. Anomaly detection. Flags unusual entries (for example, outlier hours) with banner warnings.

Each is clearly marked as mock or confident in the UI today, ready to be upgraded to a real model behind the same interface.

## Slide 4 — Architecture

A conventional, deployable full-stack shape with a mock-GenAI seam.

```
React SPA (Vite)  ----HTTP---->  Express API  --->  Prisma  --->  persistent SQLite
                                   |
                                   +--->  GenAI service layer  (mock today, swappable to real model)
```

- Frontend: React SPA (Vite dev server on :8080).
- Backend: Express; identity via the x-user-id header (defaults to user 1, James Wong, admin) with a mock user switcher in the UI.
- Data: Prisma ORM over SQLite locally and on a persistent production disk.
- GenAI: isolated behind a service module with stable response shapes. A real provider adds an asynchronous server adapter while keeping the route and UI contracts.
- Hosting: Docker Compose on a VPS, behind nginx and Let's Encrypt HTTPS.

## Slide 5 — Roadmap

From mock to production-grade intelligence, with evaluation built in.

- Mock to real GenAI. Replace each mock service with a real model behind the existing interface; keep the same UX and confidence labels.
- Org and RBAC expansion. Grow beyond a single seeded admin; richer roles, teams, and permissions.
- Integrations. Pull time and documents from existing tools (Slack, email, ERP) instead of manual entry.
- Phased delivery

  | Phase | Focus | Evaluation alignment |
  |-------|-------|----------------------|
  | 1 | Core check-ins and analytics | Manual QA of tag accuracy |
  | 2 | Document workflows and linking | Field-extraction spot checks |
  | 3 | GenAI touchpoints (mock) | UX review of suggestions |
  | 4 | Real models, RBAC, integrations | Metric-based eval of NL search and insights |

Every GenAI feature ships with an evaluation hook so quality is measurable, not assumed.
