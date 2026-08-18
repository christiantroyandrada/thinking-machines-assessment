# WorkSmart — Demo Script (≤5 min)

> **Recording note:** This is a ready-to-record walkthrough. No video has been captured yet. The repository is **private**. Recommended tool: **Loom** (or OBS) for screen + voice capture. Target runtime: ~4–5 minutes.
>
> **Identity reconciliation:** There is **no login UI**. The app opens directly. Identity is supplied by the `x-user-id` HTTP header, which **defaults to user 1 — James Wong (admin)**. In the deployed/demo environment the default admin identity is used, so no sign-in step occurs.

---

## Beat 1 — Open the app (0:00–0:30)
- **URL:** deployed URL, or `http://localhost:8080` (dev).
- **Click path:** just open the link — you land on the **Dashboard** immediately.
- **Talking point:** "WorkSmart opens straight to the dashboard — no login screen. Identity is the `x-user-id` header, defaulting to our admin, James Wong, so the demo is frictionless."

## Beat 2 — Check-ins with a smart tag (0:30–1:15)
- **URL/path:** `/checkins`
- **Click path:** Navigate to **Check-ins** → enter `2 hrs vendor negotiation and quote review` → toggle/enable **smart tag** → submit.
- **Talking point:** "The parser reads free text; the mock GenAI suggests a tag (e.g., `procurement`). This is touchpoint #1, smart categorization."

## Beat 3 — Analytics by tag/department (1:15–1:50)
- **URL/path:** `/analytics`
- **Click path:** Open **Analytics** → group by **tag**, then by **department**.
- **Talking point:** "Leadership finally sees where time goes — procurement, engineering, support — without exporting a spreadsheet."

## Beat 4 — Documents: upload, analyze, workflow, link time (1:50–3:15)
- **URL/path:** `/documents`
- **Click path:**
  1. **Upload** a PO (title + type `PO`).
  2. Open it → **Analyze with AI** → view extracted fields.
  3. View **workflow suggestions**; move status `pending → in-review → approved`.
  4. From Check-ins, log time against this document (`documentId` linked) → return to the document to see **`totalTimeSpent`**.
- **Talking point:** "Document analysis extracts vendor/amount (touchpoint #2), workflow suggestions propose the next step (#3), and linking check-ins surfaces total time spent — effort finally meets output."

## Beat 5 — Natural-language search (3:15–3:45)
- **URL/path:** `/search`
- **Click path:** Type `how much time on procurement this month?` → submit.
- **Talking point:** "NL search (#4) returns a direct answer plus result cards — no SQL, no spreadsheets."

## Beat 6 — Dashboard insights + anomalies (3:45–4:15)
- **URL/path:** `/` (Dashboard)
- **Click path:** Return to Dashboard → point out **time insights** panel and any **anomaly banner** (e.g., outlier hours).
- **Talking point:** "The dashboard surfaces time insights (#5) and anomaly detection (#6) so managers act on signals, not just data."

## Beat 7 — Admin team analytics (4:15–4:45)
- **URL/path:** `/admin`
- **Click path:** Open **Admin** → view **team analytics** across users/departments.
- **Talking point:** "As the default admin (James Wong), I see org-wide analytics — the same data, scoped to the team."

## Wrap (4:45–5:00)
- **Talking point:** "Six GenAI touchpoints, all behind a swappable mock layer, connecting effort to outcomes. Ready for real models next."

> **Reminder:** This script is ready to record; no actual video exists yet. Repo is private.
