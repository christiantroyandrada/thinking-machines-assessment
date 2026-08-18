# WorkSmart — Presentation Slides

## Slide 1 — Problem

**Meridian Consulting runs on disconnected manual effort.**

- **Time tracking** lives in spreadsheets: analysts fill in rows of hours, tags are free-text, and there is no structured link between time spent and the work it produced.
- **Procurement document processing** (purchase orders, quotes, requisitions) is handled by hand — opening PDFs, copying fields into forms, deciding next steps with no assistance.
- **Effort is severed from output.** Leadership cannot answer "how much time did procurement actually take?" because the documents and the time logs never meet.

The result: wasted coordination time, no analytics, and zero leverage from the data that is already being captured.

---

## Slide 2 — Solution

**WorkSmart is a unified platform that connects effort to outcomes.**

- **Structured check-ins** — quick, parser-friendly time entries with smart suggested tags (`1.5 hrs #meeting standup`).
- **Analytics** — slice logged time by tag, department, and user to see where effort really goes.
- **Document workflows** — upload POs/quotes/REQs, drive them through a `pending → in-review → approved` lifecycle.
- **Document ↔ time linking** — attach check-ins to a document and surface `totalTimeSpent` automatically, finally joining effort to output.

One workspace, no spreadsheet exports, no copy-paste.

---

## Slide 3 — GenAI Touchpoints

**Six UX-first GenAI features — built behind a swappable mock service layer so the UI ships now, the model swaps in later.**

1. **Smart categorization** — auto-suggests a tag for a check-in from its free-text activities.
2. **Document analysis** — extracts structured fields (vendor, amount, line items) from an uploaded PO/quote/REQ via *Analyze with AI*.
3. **Workflow suggestions** — recommends the next status / routing step for a document based on its contents.
4. **Natural-language search** — ask "how much time on procurement this month?" and get an answer plus result cards.
5. **Time insights** — summarizes trends and highlights where time is concentrating on the dashboard.
6. **Anomaly detection** — flags unusual entries (e.g., outlier hours) with banner warnings.

Each is clearly marked as mock/confident in the UI today, ready to be upgraded to a real model behind the same interface.

---

## Slide 4 — Architecture

**A conventional, deployable full-stack shape with a mock-GenAI seam.**

```
React SPA (Vite)  ──HTTP──▶  Express API  ──▶  Prisma  ──▶  SQLite (dev) / Postgres (prod)
                                  │
                                  └──▶  GenAI service layer  (mock today, swappable to real model)
```

- **Frontend:** React SPA (Vite dev server on `:8080`).
- **Backend:** Express; identity via the `x-user-id` header (defaults to user 1, James Wong / admin) — no login UI.
- **Data:** Prisma ORM over SQLite locally, Postgres in production.
- **GenAI:** isolated behind a service module so the mock can be replaced without touching routes or UI.
- **Hosting:** Vercel (client) + Render (server/API).

---

## Slide 5 — Roadmap

**From mock to production-grade intelligence, with evaluation built in.**

- **Mock → real GenAI** — replace each mock service with a real model behind the existing interface; keep the same UX and confidence labels.
- **Org & RBAC expansion** — grow beyond a single seeded admin; richer roles, teams, and permissions.
- **Integrations** — pull time/docs from existing tools (Slack, email, ERP) instead of manual entry.
- **Phased delivery**

  | Phase | Focus | Evaluation alignment |
  |-------|-------|----------------------|
  | 1 | Core check-ins + analytics | Manual QA of tag accuracy |
  | 2 | Document workflows + linking | Field-extraction spot checks |
  | 3 | GenAI touchpoints (mock) | UX review of suggestions |
  | 4 | Real models + RBAC + integrations | Metric-based eval of NL search & insights |

Every GenAI feature ships with an evaluation hook so quality is measurable, not assumed.
