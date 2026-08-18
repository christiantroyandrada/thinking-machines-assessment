# GenAI Approach — Mock Implementation and Real-LLM Mapping

Exam deliverable 2. This document describes the current mock GenAI engine that powers WorkSmart and how each feature would be swapped for a real LLM without touching the API routes or the React UI. The mock engine lives in server/src/services/genai.js as a set of pure functions with stable contracts. The boundary rationale (why the engine is isolated) is in docs/architecture.md section 5. This document is the per-feature companion, not a copy of it.

All mocks are deterministic, need no external API, and return a source field (mock-keyword-rule, mock-extraction-rule, and so on) so the UI can label their provenance and so a real provider can be detected at runtime.

## Feature 1 — Smart Categorization (categorize)

UX touchpoint. client/src/components/CheckInForm.jsx. The check-in form has a checkbox labeled "Smart tag this entry (AI)". When checked and no explicit tag is given, the client sends useSmartTag: true with the free-text activity, and server/src/routes/checkins.js:71 calls mockCategorize(...) to pick the tag before saving the check-in. The chosen tag shows in the TagPill before submit.

Mock rule. A keyword table TAG_KEYWORDS maps eight tags (procurement, project-x, design, meeting, finance, support, ops, general) to trigger words. mockCategorize(text):
1. lower-cases the input,
2. counts how many of each tag's keywords appear (substring includes),
3. keeps the tag with the most hits (first tag wins ties),
4. returns { tag, confidence, source: 'mock-keyword-rule' } where confidence is 0.35 (no hits, defaults to general), 0.9 (two or more hits), or 0.65 (exactly one hit).

Example input to output.
```
Input:  "Reviewed vendor quote for procurement negotiation"
Output: { tag: "procurement", confidence: 0.9, source: "mock-keyword-rule" }
```
(rationale: procurement, vendor, quote, negotiation = 4 hits in the procurement bucket)

Real-LLM mapping.
- Model. A fast, cheap classifier such as gpt-4o-mini or claude-haiku-4 with function calling or JSON mode.
- Prompt shape. System instruction that defines the tag taxonomy plus a few few-shot (activity, tag) examples. User message is the raw activity text.
- JSON schema (function). { tag: enum[...8 tags], confidence: number[0..1] }.
- Latency and UX. Keep the checkbox. Run the classifier debounced on the typed activity to preview the tag in the TagPill (optimistic UI), exactly as today. Low confidence (under 0.5) should leave the field editable rather than auto-apply.
- Fallback. On provider error or timeout, fall back to the existing mockCategorize rule so the form never blocks submit. Persist source: 'fallback-rule'.

## Feature 2 — Document Analysis (analyze)

UX touchpoint. client/src/components/AnalysisCard.jsx on the document detail page (DocumentDetailPage.jsx). The "Analyze with AI" button calls POST /api/documents/:id/analyze. The card renders the extracted fields and a confidence line (AnalysisCard.jsx:31).

Mock rule. mockAnalyzeDocument({ type, title, text }) runs a set of deterministic extractors against the lower-cased text:
- vendor, supplier, or from via extractField (label followed by :, =, or whitespace),
- amount via regex on total|amount|value plus optional $|php|usd|₱ plus a decimal number,
- poNumber via /po[\s-]?\d{4,}/ (for example po-2024; the input is lowercased, so the captured value is lowercase),
- date via YYYY-MM-DD,
- documentType = the passed type.
Confidence is 0.85 (three or more fields extracted), 0.6 (one or more fields), or 0.3 (none). Returns { fields, confidence, source: 'mock-extraction-rule' }. The route also persists analysis on the document row.

Example input to output.
```
Input:  { type: "PO", title: "PO", text: "Vendor: Acme Industrial\nTotal: PHP 500000\nPO-2024-001\nDate: 2026-08-01" }
Output: {
  fields: { vendor: "acme industrial", amount: "php 500000", poNumber: "po-2024", date: "2026-08-01", documentType: "PO" },
  confidence: 0.85,
  source: "mock-extraction-rule"
}
```

Real-LLM mapping.
- Model. A multimodal model (gpt-4o, claude-sonnet) when the upload is a PDF or image, or a text model when only contentText exists.
- Prompt shape. "Extract the structured fields from this procurement document" plus the document text or blocks. Use structured output (JSON schema) so the contract matches the mock.
- JSON schema. { fields: { vendor?, amount?, poNumber?, date?, documentType }, confidence: number }.
- Latency and UX. Show a spinner ("Analyzing...") as today. For image or PDF inputs, stream or poll. Keep the editable field list so users can correct extractions.
- Fallback. If the document is non-text and no vision path is configured, fall back to mockAnalyzeDocument using filename or title only and label source: 'fallback-rule'.

## Feature 3 — Workflow Suggestions (suggest)

UX touchpoint. client/src/components/SuggestionList.jsx on the document detail page. The "Suggested next steps" card lists actions with a priority pill (high, medium, low) and a reason (SuggestionList.jsx:34).

Mock rule. mockSuggestWorkflow({ type, status, analysis }) inspects analysis.fields and the document status and emits up to three suggestions:
- missing amount to "Request total amount from vendor" (high),
- missing vendor to "Confirm vendor/supplier name" (high),
- status === 'pending' to "Review document fields" (medium),
- status === 'in-review' to "Decide: approve or request revisions" (medium),
- status === 'approved' to "File document and log remaining time" (low),
- always to "Attach related time entries" (medium),
then slice(0, 3).

Example input to output.
```
Input:  { type: "PO", status: "in-review", analysis: { fields: { vendor: "acme" } } }
Output: [
  { action: "Request total amount from vendor", reason: "Missing monetary value for accurate tracking", priority: "high" },
  { action: "Decide: approve or request revisions", reason: "Document has been in review", priority: "medium" },
  { action: "Attach related time entries", reason: "Links effort to document outputs", priority: "medium" }
]
```

Real-LLM mapping.
- Model. claude-haiku or gpt-4o-mini with tool use, given the document fields, status, and linked time entries as context.
- Prompt shape. "Given this document's extracted fields and current status, propose the next 1 to 3 workflow actions." Few-shot examples of good next steps.
- JSON schema. [{ action, reason, priority: enum[high,medium,low] }] (capped at 3 to match today's UX).
- Latency and UX. Same "Get suggestions" button and spinner. Results are advisory and never auto-applied (no silent state change).
- Fallback. The rule engine above (mockSuggestWorkflow) on any provider failure.

## Feature 4 — Natural Language Search (search)

UX touchpoint. client/src/pages/SearchPage.jsx, the "AI Search" box. The answer renders with an AI: prefix and matching rows below (SearchPage.jsx:36).

Mock rule. mockSearch(query, { checkins, documents }) detects an intent by regex over the lower-cased query:
- time-total. Matches how many, total, hours, time spent, logged. Optionally filters check-ins by a tag found in the query, sums hours, answers with the total, and returns up to 5 check-ins.
- documents. Matches document, po, quote, requisition, status, approved, pending, review. Filters documents by any mentioned status, returns up to 5.
- who. Matches ^who. Aggregates hours per userName and reports the top contributor.
- keyword (fallback). Matches the first word of the query against activities or tag, returns up to 5.
Empty query returns a generic help answer. Returns { intent, answer, results }.

Example input to output.
```
Input:  "how many hours on procurement"
Output: {
  intent: "time-total",
  answer: "Total logged time on procurement: 12.5 hrs across 3 check-in(s).",
  results: [ /* up to 5 check-ins tagged procurement */ ]
}
```

Real-LLM mapping.
- Model and architecture. Embeddings plus RAG. Embed the query and the check-in or document corpus, retrieve the top-k nearest records, then a model (gpt-4o-mini or claude-haiku) writes a natural-language answer grounded in the retrieved rows with citations.
- Prompt shape. "Answer the user's question using ONLY the retrieved records below. Include the entity IDs you based the answer on."
- JSON schema or output. { intent, answer (cited), results: [...retrieved ids] }. Same shape so SearchPage is unchanged.
- Latency and UX. Show "Thinking..." (already in the UI). Cache embeddings. For first paint, return the retrieved results immediately and stream the answer.
- Fallback. The regex intent router above is a natural degraded mode. If the embedding store or model is unavailable, fall back to keyword or intent matching.

## Feature 5 — Time Insights (insights)

UX touchpoint. client/src/pages/HomePage.jsx renders the insights as a row of InsightCards (HomePage.jsx:32), each with a title, body, and type.

Mock rule. mockTimeInsights(checkins) aggregates:
- total hours and check-in count to { title: 'Total logged time', type: 'summary' },
- top tag by hours to { title: 'Top activity', type: 'pattern' },
- hours logged in the last 7 days to { title: 'Last 7 days', type: 'trend' }.
Returns an array of { title, body, type }.

Example input to output.
```
Input:  [ { hours: 4, tag: 'ops', date: <2026-08-01> }, { hours: 2, tag: 'ops', date: <2026-08-02> } ]
Output: [
  { title: "Total logged time", body: "6.0 hrs across 2 check-in(s).", type: "summary" },
  { title: "Top activity", body: "ops accounts for the most time at 6.0 hrs.", type: "pattern" },
  { title: "Last 7 days", body: "You logged 6.0 hrs in the last 7 days.", type: "trend" }
]
```

Real-LLM mapping.
- Model. gpt-4o-mini or claude-haiku for summarization over aggregated stats, or a heavier model for richer narrative insights.
- Prompt shape. "Here are this user's aggregated time stats (total, by-tag, last-7-days). Write 3 short, plain-language insight cards." Few-shot card examples.
- JSON schema. [{ title, body, type: enum[summary,pattern,trend] }].
- Latency and UX. Insights load on dashboard mount. Show a skeleton while the model responds. The static aggregation can render first, with the natural-language gloss filling in.
- Fallback. The deterministic aggregation above always produces the cards, so the model only enhances wording. A provider failure keeps the rule-generated cards.

## Feature 6 — Anomaly Detection (anomalies)

UX touchpoint. client/src/pages/HomePage.jsx renders each anomaly as an AnomalyBanner (HomePage.jsx:38), color-coded by severity.

Mock rule. mockAnomalies(checkins, documents) flags:
- long-entry (high). Any check-in with hours greater than 14.
- weekend-entry (medium). Check-in whose date falls on Saturday or Sunday.
- high-volume (medium). More than 5 check-ins sharing the same date or tag.
- stale-review (high). Document status === 'in-review' with daysSince(updatedAt) greater than 14.
Returns up to 8 { entity, type, detail, severity }.

Example input to output.
```
Input:  checkins = [ { id: 7, hours: 20, activities: "deploy", date: <2026-08-03> } ], documents = []
Output: [
  { entity: "Check-in #7", type: "long-entry", detail: "20 hrs logged in a single entry — deploy", severity: "high" }
]
```

Real-LLM mapping.
- Model and architecture. Primarily a statistical or heuristic layer (z-score on daily hours, per-user baselines, calendar lookups) wrapped by an LLM that drafts human-readable explanations and severity. The deterministic rules above become the baseline detectors feeding the model.
- Prompt shape. "Given these statistical outliers for the user, explain each in one sentence and assign a severity." Provide the raw anomaly and context.
- JSON schema. [{ entity, type, detail, severity: enum[high,medium,low] }].
- Latency and UX. Banners are non-blocking and shown below insights. Compute offline or periodically rather than on every page load to avoid latency in the critical path.
- Fallback. The rule set above is already the fallback. It runs locally with zero dependencies and can stand alone if the model is unavailable.

## Transparency

The product is UX-first and deliberately shows machine output rather than hiding it. Concrete places the UI labels provenance and keeps the human in control:

- Confidence scores. AnalysisCard.jsx:31 prints "Extracted with N% confidence (mock rule-based extraction)." It is the only feature that currently shows a numeric confidence to the end user.
- AI labels. The mock is labeled as AI throughout:
  - CheckInForm.jsx:54. Checkbox "Smart tag this entry (AI)".
  - AnalysisCard.jsx:25. "AI Document Analysis" header and "Analyze with AI" button.
  - SuggestionList.jsx:27. "Suggested next steps" card.
  - SearchPage.jsx:27,36. "AI Search" heading and the AI: answer prefix.
- No silent automation. Every GenAI output is advisory:
  - Categorization applies only when the user opts in via the checkbox (checkins.js:71). Otherwise the tag stays as typed.
  - Document analysis and suggestions appear in editable or reviewable cards and never change document state on their own.
  - Insights and anomalies are read-only banners the user can dismiss or act on.

Concern (flagged). Insights (InsightCard) and Anomalies (AnomalyBanner) do not currently render a source or mock badge, unlike AnalysisCard. For full transparency parity, add a small "mock" chip to InsightCard and AnomalyBanner driven by a source field once the engine returns one consistently. This is a low-risk UI addition.

## Swap Strategy

The mocks were built behind one deliberate seam so a real LLM can replace them without touching any route or component:

1. Single service boundary. All six features are pure functions in server/src/services/genai.js. The routes (ai.js, documents.js, checkins.js) and the React client depend only on the return shapes, never the internals. Swapping means rewriting function bodies (or pointing them at a provider). Routes and UI stay put.
2. Feature flags. Gate each provider behind a config flag, for example GENAI_PROVIDER=categorize:llm,analyze:llm,search:mock or a single USE_REAL_LLM toggle per feature. This lets features go live one at a time and revert instantly if a provider misbehaves.
3. Provider abstraction. Add a GenAIProvider interface with MockProvider (today's functions) and LLMProvider (OpenAI or Anthropic) behind the existing boundary. architecture.md section 6 already names this GenAIProvider seam. The client and route call sites are unchanged. Only the provider injected into genai.js differs.
4. Evaluation harness (golden set). Keep server/tests/genai.test.js (already present) plus a curated golden dataset of check-ins and documents with expected tags, fields, intents, insights, and anomalies. Add a script that runs both MockProvider and LLMProvider against the golden set and reports precision or recall or exact-match diffs. This is the regression gate that proves the real LLM is at least as good as the mock before a flag flips to llm in production.
5. Latency and resilience by design. Every call site already has a loading state ("Analyzing...", "Thinking...", "..."). The mapping above pairs each feature with a deterministic fallback so the app degrades to the mock rule engine on any provider error or timeout. The UI never blocks on the model.

## Scope

Documentation only. No code, tests, or behavior changed by this deliverable. The mock logic described above was read directly from server/src/services/genai.js, server/src/routes/ai.js, server/src/routes/documents.js, server/src/routes/checkins.js, and the client components CheckInForm, AnalysisCard, SuggestionList, SearchPage, InsightCard, and AnomalyBanner.
