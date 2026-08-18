# WorkSmart — Product Vision

## 1. Executive Summary

WorkSmart is an internal operations platform for Meridian Manufacturing. It unifies two workflows that used to live apart: employee time tracking and procurement document processing. Today, procurement teams keep time in spreadsheets and documents in shared folders, with no way to connect effort to output. WorkSmart brings structured check-ins and a document intake and review workflow into one product, then adds six focused GenAI features that remove repetitive manual work and surface patterns spreadsheets could not show. The result lets Meridian measure productivity, allocate resources, track document throughput, and tie the time people spend to the documents they move.

## 2. Problem and User Needs

Meridian runs a procurement org of about 65 to 75 staff who handle thousands of supplier documents a month: invoices, purchase orders, contracts, and related paperwork. Two pains dominate their day:

- Time lives in spreadsheets. Each person logs hours in a personal sheet. There is no shared, queryable view, so managers cannot easily analyze productivity, compare departments, or reallocate work when volume shifts.
- Documents are processed by hand. Intake, status tracking, and data extraction happen across shared drives and email. Reviewers retype vendor names, amounts, and dates. There is no reliable link between time spent on a task and the document it produced.

The needs that follow directly:

- Productivity analysis. Understand how people and teams spend their time.
- Resource allocation. Move effort toward the work that matters as volume changes.
- Document throughput. Know how long documents take to clear review and where they stall.
- Connecting effort to output. Tie time entries to the documents they relate to, so leadership sees the cost of procurement activity, not just the count.

## 3. Solution and Key Features

WorkSmart replaces the spreadsheet and folder setup with one coordinated app:

- Structured check-ins. Staff record time against consistent fields (what they did, for whom, in which department, with tags and dates) so every entry is comparable.
- 1,000+ entry views. The time log and analytics stay responsive and navigable at scale, so history stays useful instead of becoming a slow export.
- Tag, date, department, and user analytics. Managers slice time any way the business asks, turning raw logs into usable views.
- Document upload and status workflow. Files move through explicit statuses, giving each one a clear place in the process and an auditable trail.
- Document to time linking. Time entries attach to the documents they relate to, finally joining the effort side of procurement to its output side.

## 4. GenAI Feature Design

Six GenAI features are built in. Each targets a real friction point and is clearly labeled as AI-generated (and, where relevant, as a mock) so users always know when they see model output.

| # | Feature | What it does | UX touchpoint | User value |
| --- | --- | --- | --- | --- |
| 1 | Smart categorization | Parses a check-in and suggests a tag | Check-in form | Less typing. Users pick instead of write. |
| 2 | Document analysis | Extracts mock fields (vendor, amount, dates, line items) | Document detail page | Cuts manual data entry. Key facts surface on their own. |
| 3 | Workflow suggestions | Recommends next steps: status, follow-ups, tags | Document detail page | Guides users through review with concrete steps. |
| 4 | NL search | Takes a plain-English query and returns an answer plus result cards | Search page | Lowers the analytics learning curve. Ask, do not filter. |
| 5 | Time insights | Writes a short narrative of time trends | Dashboard | Surfaces what spreadsheets could not. Plain-language takeaways. |
| 6 | Anomaly detection | Flags long entries, missing documents, weekend work | Dashboard | Surfaces risk and outliers that would otherwise slip by. |

## 5. Principles

- Value over novelty. Every GenAI feature removes a real observed friction point (typing effort, manual extraction, discovery overhead), not a demo of technology.
- Automation balanced with control. Tags, suggestions, and extracted fields are proposed, not silently applied. The user decides and can accept, edit, or ignore what the model produces.
- Transparency. GenAI output is marked, with confidence indicators and explicit "AI" or "mock" labels, so reviewers always know when they see model content rather than verified data.

## 6. Success Metrics

- Time-to-log. How fast a staff member can record a complete, well-tagged check-in. A direct read on whether smart categorization cuts entry friction.
- Tag accuracy. The rate suggested tags are correct and kept. Shows how much trust the feature earns.
- Document processing days. Average time a document spends in its status workflow. Shows whether analysis and suggestions speed up review.
- Adoption. Share of the 65 to 75 procurement staff actively using check-ins and the document workflow. Confirms the product replaces the old spreadsheet and folder habits.
