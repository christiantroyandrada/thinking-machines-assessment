# WorkSmart — Demo Script (under 5 minutes)

Recording note: a walkthrough video is recorded at docs/presentation/demo.webm (under 5 minutes). The repository is private. The script below is the shot list used to record it. Recommended tool if re-recording: Loom or OBS for screen and voice capture.

Identity is deliberately mocked. Start by choosing James Wong (admin) from the identity picker. The client then sends his ID through the x-user-id header. This is a demo convenience, not production authentication.

## Beat 1 — Open the app (0:00 to 0:30)

- URL: deployed URL, or http://localhost:8080 (dev).
- Click path: open the link, choose James Wong (admin), and land on the Dashboard.
- Talking point: the identity picker makes multi-user and admin views easy to demonstrate without pretending this is production authentication.

## Beat 2 — Check-ins with a smart tag (0:30 to 1:15)

- URL or path: /check-ins
- Click path: Navigate to Check-ins, enter "2 hrs vendor negotiation and quote review", toggle smart tag on, submit.
- Talking point: The parser reads free text; the mock GenAI suggests a tag (for example procurement). This is touchpoint 1, smart categorization.

## Beat 3 — Analytics by tag and department (1:15 to 1:50)

- URL or path: /analytics
- Click path: Open Analytics, group by tag, then by department.
- Talking point: Leadership finally sees where time goes, procurement, engineering, support, without exporting a spreadsheet.

## Beat 4 — Documents: upload, analyze, workflow, link time (1:50 to 3:15)

- URL or path: /documents
- Click path:
  1. Upload a PO (title plus type PO).
  2. Open it, run Analyze with AI, view extracted fields.
  3. View workflow suggestions, move status pending to in-review to approved.
  4. From Check-ins, log time against this document (documentId linked), return to the document to see totalTimeSpent.
- Talking point: Document analysis extracts vendor and amount (touchpoint 2), workflow suggestions propose the next step (3), and linking check-ins surfaces total time spent. Effort finally meets output.

## Beat 5 — Natural-language search (3:15 to 3:45)

- URL or path: /search
- Click path: Type "how much time on procurement this month?" and submit.
- Talking point: NL search (4) returns a direct answer plus result cards. No SQL, no spreadsheets.

## Beat 6 — Dashboard insights and anomalies (3:45 to 4:15)

- URL or path: / (Dashboard)
- Click path: Return to Dashboard, point out the time insights panel and any anomaly banner (for example outlier hours).
- Talking point: The dashboard surfaces time insights (5) and anomaly detection (6) so managers act on signals, not just data.

## Beat 7 — Admin team analytics (4:15 to 4:45)

- URL or path: /admin
- Click path: Open Admin, view team analytics across users and departments.
- Talking point: As the default admin (James Wong), I see org-wide analytics, the same data scoped to the team.

## Wrap (4:45 to 5:00)

- Talking point: Six GenAI touchpoints, all behind a swappable mock layer, connecting effort to outcomes. Ready for real models next.
