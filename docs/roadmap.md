# WorkSmart — Product Roadmap

> Exam deliverable 4. A forward-looking plan for the time-tracking + document-intelligence product built in this assessment. The GenAI swap path is covered in depth in `docs/genai-approach.md` and `docs/architecture.md` — this document references them rather than duplicating them.

## 1. Short-term (3–6 months)

Make the prototype production-credible and safe to put in front of real users.

- **Real authentication & RBAC** — replace the `x-user-id` header switcher (`docs/architecture.md` §4) with real login, session management, and role-based access control so admin vs. user is enforced server-side.
- **Admin-managed org structure** — move `User.department` from free-text seed data to an admin-editable org model (teams, departments, managers).
- **Real file parsing** — replace title/filename fallback with PDF text extraction and OCR for scanned procurement documents, feeding `Document.contentText` for analysis.
- **Deployment hardening** — lock CORS to known origins, add rate limiting, secrets management, and monitoring on the Vercel/Render stack already in use.
- **Analytics exports** — CSV/Excel export of time, document, and anomaly reports for stakeholder sharing.
- **User testing with the GenAI mocks** — validate the mock UX (smart-tag, document analysis, Ask AI) with real procurement staff; collect the golden dataset needed for the LLM evaluation harness later.

## 2. Medium-term (6–12 months)

Convert the mock GenAI boundary into real, governed intelligence (swap path detailed in `docs/genai-approach.md`).

- **Real LLM integration** — implement the `GenAIProvider` interface with an `LLMProvider` behind the existing `services/genai.js` boundary, swapping each pure function per the per-feature mapping in `docs/genai-approach.md`: function calling for categorization/analysis, embeddings + RAG for search, prompt-based summarization for insights/anomalies.
- **Approval workflows** — route POs/quotes through configurable approve/reject/revision states with audit trail.
- **ERP / accounting integration** — push extracted PO/quote fields (vendor, amount, PO #) to the finance system of record.
- **Team notifications** — Slack/email alerts for stale reviews, anomalies, and workflow handoffs.

## 3. Long-term (12+ months)

Scale from a single procurement team to an enterprise platform.

- **Cross-department expansion** — generalize the document types and analytics to engineering, design, finance, and support workflows.
- **Predictive resource planning** — forecast capacity and bottlenecks from historical check-in and document throughput.
- **Anomaly-driven alerts** — move from dashboard banners to proactive, routed alerts (email/Slack) using statistical baselines + model-flagged outliers.
- **Multi-tenancy** — isolate data and config per organization with tenant-scoped auth, storage, and billing.

## 4. Development Phases (mapped to Tasks 1–36)

| Phase | Scope | Tasks |
|---|---|---|
| **A — Foundations** | Repo scaffold, Prisma schema, seed data, base config | 1–4 |
| **B — Time tracking** | Timesheet parser, check-in CRUD, analytics aggregation, UI | 5–12 |
| **C — Documents** | Upload, link to check-ins, document detail view | 13–16 |
| **D — GenAI (mocks)** | Mock engine, AI routes, search/insights UI, transparency labels | 17–21 |
| **E — Admin / polish** | Admin dashboard, RBAC-aware admin, centralized error handling | 22–24 |
| **F — Deploy / docs** | Tests, documentation, Docker, deployment | 25–36 |

Each phase is independently shippable; Phases A–E delivered the working assessment, and Phase F produced the deployment configuration (Docker, Render, Vercel) and the full documentation set. The containerized app is verified running locally via Docker (`http://localhost:8080`); a public URL is produced by the Render + Vercel deploy (configs in `server/render.yaml` and `client/vercel.json`).

## 5. Technical Evolution Strategy

A staged, low-risk path from deterministic mocks to governed LLMs:

1. **Mock interface today** — pure functions in `services/genai.js` with stable contracts; routes/UI depend only on signatures (`docs/architecture.md` §5).
2. **Provider abstraction** — introduce a `GenAIProvider` interface; `MockProvider` ships now, `LLMProvider` (OpenAI / Anthropic) plugs in later with no route/UI changes.
3. **Evaluation harness** — a golden set of check-ins and documents with expected outputs (built from short-term user testing) gates every provider change and catches regressions before rollout.
4. **Feature flags** — enable real providers per feature (start with categorization, then search), so rollout is incremental and reversible.
5. **Cost & guardrails** — confidence thresholds, human confirmation for high-impact actions, token budgets, and response caching to keep spend predictable and outputs safe.

## 6. Challenges & Mitigations

| Challenge | Mitigation |
|---|---|
| **Data quality** — messy free-text check-ins and scans | Real PDF/OCR parsing + validation; user-confirmed smart-tag; golden-set evaluation to measure extraction quality. |
| **LLM hallucination** — fabricated vendors/amounts | Structured-output schemas, grounding in extracted fields, human confirmation for high-impact actions, confidence thresholds. |
| **Cost** — per-request LLM spend at scale | Token budgets, response caching, embeddings reuse, feature flags to scope rollout; mock fallback for low-value calls. |
| **Procurement data sensitivity** — vendor/financial PII | RBAC + tenant isolation, CORS/origin locking, secrets management, audit trails; real auth before any production data. |
| **Adoption** — teams resistant to new tooling | UX-first mocks validated in user testing; advisory (non-automated) AI; exports and notifications that fit existing workflows. |
