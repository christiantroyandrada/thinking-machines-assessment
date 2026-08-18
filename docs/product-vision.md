# WorkSmart — Product Vision

## 1. Executive Summary

WorkSmart is an internal operations platform built for Meridian Manufacturing that unifies two previously disconnected workflows: employee time tracking and procurement document processing. Today, procurement teams juggle spreadsheets for time logs and shared folders for documents, with no way to see how effort connects to output. WorkSmart brings structured check-ins and a document intake-and-review workflow into a single product, then layers six focused GenAI features on top to remove repetitive manual work and surface insights that spreadsheets could never show. The result is a system that lets Meridian's procurement organization measure productivity, allocate resources, track document throughput, and connect the time people spend to the documents they move.

## 2. Problem & User Needs

Meridian Manufacturing runs a procurement organization of roughly 65–75 staff who, every month, handle thousands of supplier documents — invoices, purchase orders, contracts, and related paperwork. Two pain points dominate their day:

- **Time is tracked in spreadsheets.** Each person logs hours in a per-person spreadsheet. There is no shared, queryable view, so managers cannot easily analyze productivity, compare departments, or reallocate resources when workloads shift.
- **Documents are processed by hand.** Intake, status tracking, and data extraction happen manually across shared drives and email. Reviewers retype vendor names, amounts, and dates, and there is no reliable link between the time spent on a task and the document it produced.

The needs that follow directly from this are:

- **Productivity analysis** — understand how individuals and teams spend their time.
- **Resource allocation** — move effort toward the work that matters as volume fluctuates.
- **Document throughput** — know how long documents take to move through review and where they stall.
- **Connecting effort to outputs** — tie time entries to the documents they relate to so leadership can see the cost of procurement activity, not just the count.

## 3. Solution & Key Features

WorkSmart replaces the spreadsheet-and-folder setup with one coordinated application:

- **Structured check-ins.** Instead of free-form spreadsheet rows, staff record time against a consistent set of fields — what they worked on, for whom, in which department, with tags and dates — so every entry is comparable.
- **1,000+ entry views.** The time log and analytics surfaces are built to remain responsive and navigable at scale, so historical data stays useful rather than becoming a sluggish export.
- **Tag / date / department / user analytics.** Managers can slice time data any way the business asks: by tag, by date range, by department, or by individual user, turning raw logs into actionable views.
- **Document upload + status workflow.** Documents are uploaded into a tracked workflow with explicit statuses, giving every file a clear place in the process and an auditable trail.
- **Document ↔ time linking.** Time entries can be associated with the documents they relate to, finally connecting the effort side of procurement to its output side.

## 4. GenAI Feature Design

Six GenAI features were built into the product. Each targets a specific friction point and is clearly labeled as AI-generated (and, where appropriate, as a mock) so users always know when they are seeing model output.

| # | Feature | What it does | UX touchpoint | User value |
|---|---------|--------------|---------------|------------|
| 1 | Smart categorization | Parses a check-in and suggests relevant tags | Check-in form (parser + suggested tags) | Reduces data-entry friction — users pick rather than type |
| 2 | Document analysis | Extracts mock fields (vendor, amount, dates, line items) from a document | Document detail page | Cuts manual data extraction — key facts are surfaced automatically |
| 3 | Workflow suggestions | Recommends next steps: status, follow-ups, tags | Document detail page | Guides users through the review process with concrete recommendations |
| 4 | NL search | Accepts a natural-language query and returns an answer plus result cards | Search page | Lowers the analytics learning curve — ask in plain language, not filters |
| 5 | Time insights | Auto-generates a narrative summary of time trends | Dashboard | Surfaces what spreadsheets couldn't — plain-language takeaways |
| 6 | Anomaly detection | Flags long entries, missing documents, weekend work | Dashboard | Surfaces risk and outliers that would otherwise go unnoticed |

## 5. Principles

- **Value over novelty.** Every GenAI feature exists to remove a real, observed friction point — data-entry effort, manual extraction, discovery overhead — not to demonstrate technology.
- **Automation balanced with user control.** Suggestions, tags, and extracted fields are proposed, not silently applied. The user stays the decision-maker and can accept, edit, or ignore what the model produces.
- **Transparency.** GenAI output is clearly marked, including confidence indicators and explicit "AI" / "mock" labeling, so reviewers always know when they are looking at model-generated content rather than verified data.

## 6. Success Metrics

- **Time-to-log.** How quickly a staff member can record a complete, well-tagged check-in — a direct measure of whether smart categorization is reducing entry friction.
- **Tag accuracy.** The rate at which suggested tags are correct and kept, indicating how much trust the categorization feature earns.
- **Document processing days.** The average time a document spends moving through its status workflow, showing whether analysis and suggestions speed up review.
- **Adoption.** The share of the 65–75 procurement staff actively using check-ins and the document workflow, confirming the product replaces the old spreadsheet-and-folder habits.
