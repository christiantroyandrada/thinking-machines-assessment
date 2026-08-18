# WorkSmart — Product Roadmap

Exam deliverable 4. A forward-looking plan for the time-tracking and document-intelligence product built in this assessment. The GenAI swap path is covered in depth in docs/genai-approach.md and docs/architecture.md, so this document references them rather than repeating them.

## 1. Short-term (3 to 6 months)

Make the prototype safe to put in front of real users.

- Real authentication and RBAC. Replace the x-user-id header switcher (docs/architecture.md section 4) with real login, sessions, and role-based access so admin versus user is enforced server-side.
- Admin-managed org structure. Move User.department from free-text seed data to an admin-editable org model (teams, departments, managers).
- Real file parsing. Replace the title or filename fallback with PDF text extraction and OCR for scanned procurement documents, feeding Document.contentText for analysis.
- Deployment hardening. Lock CORS to known origins, add rate limiting, secrets management, and monitoring on the Vercel and Render stack already in use.
- Analytics exports. CSV and Excel export of time, document, and anomaly reports for stakeholders.
- User testing with the GenAI mocks. Validate the mock UX (smart-tag, document analysis, Ask AI) with real procurement staff. Collect the golden dataset the LLM evaluation harness will need later.

## 2. Medium-term (6 to 12 months)

Turn the mock GenAI boundary into real, governed intelligence (swap path in docs/genai-approach.md).

- Real LLM integration. Implement the GenAIProvider interface with an LLMProvider behind the existing services/genai.js boundary, swapping each pure function per the per-feature mapping in docs/genai-approach.md: function calling for categorization and analysis, embeddings plus RAG for search, prompt-based summarization for insights and anomalies.
- Approval workflows. Route POs and quotes through configurable approve, reject, and revision states with an audit trail.
- ERP and accounting integration. Push extracted PO and quote fields (vendor, amount, PO number) to the finance system of record.
- Team notifications. Slack and email alerts for stale reviews, anomalies, and workflow handoffs.

## 3. Long-term (12+ months)

Scale from one procurement team to an enterprise platform.

- Cross-department expansion. Generalize document types and analytics to engineering, design, finance, and support workflows.
- Predictive resource planning. Forecast capacity and bottlenecks from historical check-in and document throughput.
- Anomaly-driven alerts. Move from dashboard banners to proactive, routed alerts (email, Slack) using statistical baselines and model-flagged outliers.
- Multi-tenancy. Isolate data and config per organization with tenant-scoped auth, storage, and billing.

## 4. Development Phases (mapped to Tasks 1 to 36)

| Phase | Scope | Tasks |
| --- | --- | --- |
| A. Foundations | Repo scaffold, Prisma schema, seed data, base config | 1 to 4 |
| B. Time tracking | Timesheet parser, check-in CRUD, analytics aggregation, UI | 5 to 12 |
| C. Documents | Upload, link to check-ins, document detail view | 13 to 16 |
| D. GenAI (mocks) | Mock engine, AI routes, search and insights UI, transparency labels | 17 to 21 |
| E. Admin and polish | Admin dashboard, RBAC-aware admin, centralized error handling | 22 to 24 |
| F. Deploy and docs | Tests, documentation, Docker, deployment | 25 to 36 |

Each phase ships on its own. Phases A through E delivered the working assessment. Phase F produced the deployment config (Docker, Render, Vercel) and the full documentation set. The containerized app is verified running locally via Docker (http://localhost:8080). A public URL comes from the Render and Vercel deploy (configs in server/render.yaml and client/vercel.json).

## 5. Technical Evolution Strategy

A staged, low-risk path from deterministic mocks to governed LLMs:

1. Mock interface today. Pure functions in services/genai.js with stable contracts. Routes and UI depend only on the signatures (docs/architecture.md section 5).
2. Provider abstraction. Add a GenAIProvider interface. MockProvider ships now; LLMProvider (OpenAI or Anthropic) plugs in later with no route or UI changes.
3. Evaluation harness. A golden set of check-ins and documents with expected outputs (built from short-term user testing) gates every provider change and catches regressions before rollout.
4. Feature flags. Turn on real providers per feature (start with categorization, then search) so rollout is incremental and reversible.
5. Cost and guardrails. Confidence thresholds, human confirmation for high-impact actions, token budgets, and response caching keep spend predictable and outputs safe.

## 6. Challenges and Mitigations

| Challenge | Mitigation |
| --- | --- |
| Data quality. Messy free-text check-ins and scans. | Real PDF and OCR parsing plus validation. User-confirmed smart-tag. Golden-set evaluation to measure extraction quality. |
| LLM hallucination. Fabricated vendors or amounts. | Structured-output schemas, grounding in extracted fields, human confirmation for high-impact actions, confidence thresholds. |
| Cost. Per-request LLM spend at scale. | Token budgets, response caching, embeddings reuse, feature flags to scope rollout. Mock fallback for low-value calls. |
| Procurement data sensitivity. Vendor and financial PII. | RBAC and tenant isolation, CORS and origin locking, secrets management, audit trails. Real auth before any production data. |
| Adoption. Teams resistant to new tooling. | UX-first mocks validated in user testing. Advisory (non-automated) AI. Exports and notifications that fit existing workflows. |
