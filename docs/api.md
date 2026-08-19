# API Reference

Base URL: `http://localhost:4000` (configurable via `PORT`). All endpoints are mounted under `/api`.

## Conventions

### `x-user-id` header (mock auth)

There is **no real authentication**. `server/src/middleware/auth.js` runs on every request and sets `req.userId`:

- If the `x-user-id` request header is a positive integer, `req.userId` is set to that value.
- If the header is absent or invalid, `req.userId` defaults to `1`.

Multi-user behavior is simulated by sending different `x-user-id` values. New check-ins created via `POST /api/checkins` are assigned to `req.userId`.

```
x-user-id: 2
```

### Error envelope

All errors use a JSON body with a single `error` key:

```json
{ "error": "Check-in not found" }
```

Typical statuses: `400` (validation), `404` (not found), `204` (no content on deletes).

### Content type

JSON request bodies use `Content-Type: application/json`. File uploads use `multipart/form-data`. Uploads are handled by `multer` with **in-memory storage**; the server enforces a **5 MB** single-file limit (the multer default) on `POST /api/documents`.

---

## Endpoint table

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/users` | List users |
| GET | `/api/users/me` | Current user (from `x-user-id`) |
| POST | `/api/checkins/parse` | Parse check-in text |
| GET | `/api/checkins` | List/filter/paginate check-ins |
| POST | `/api/checkins` | Create check-in (text or structured) |
| PATCH | `/api/checkins/:id` | Update check-in |
| DELETE | `/api/checkins/:id` | Delete check-in |
| GET | `/api/analytics/time?dimension=` | Aggregate time (tag/date/department/user) |
| GET | `/api/analytics/time/departments` | Department time breakdown |
| GET | `/api/analytics/documents` | Document status counts |
| POST | `/api/documents` | Upload document (multipart) |
| GET | `/api/documents` | List/filter documents |
| GET | `/api/documents/:id` | Document detail + linked check-ins |
| PATCH | `/api/documents/:id` | Update title/type/status |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/documents/:id/analyze` | Mock GenAI field extraction |
| POST | `/api/documents/:id/suggest` | Mock GenAI workflow suggestions |
| GET | `/api/ai/insights` | Time insights (mock) |
| GET | `/api/ai/anomalies` | Anomaly flags (mock) |
| GET | `/api/ai/search?q=` | Natural-language search (mock) |
| GET | `/api/admin/analytics` | Team analytics (admin) |

---

## Endpoint details

### GET `/api/health`
Returns server status.

```json
{ "status": "ok" }
```

### GET `/api/users`
List users. Optional `?department=` filter.

```json
{
  "users": [
    { "id": 1, "name": "Alice", "department": "Procurement", "role": "buyer", "email": "alice@corp.com" }
  ]
}
```

### GET `/api/users/me`
Returns the user identified by the `x-user-id` header.

```json
{ "id": 1, "name": "Alice", "department": "Procurement", "role": "buyer", "email": "alice@corp.com" }
```

### POST `/api/checkins/parse`
Parses free-text check-ins. Body: `{ "text": "<number> [hr|hrs] #<tag> <activities>" }`.
Returns a parsed preview wrapped in `parsed`.

```json
{ "parsed": { "hours": 1.5, "unit": "hr", "tag": "meeting", "activities": "standup", "valid": true, "errors": [] } }
```

For invalid/empty input, `valid` is `false` and `errors` contains messages.

### GET `/api/checkins`
List, filter and paginate check-ins. Query params: `page` (default 1), `pageSize` (default 25, max 100), `tag`, `userId`, `department`, `from`, `to`, `q` (free-text search over activities/tag).

```json
{
  "items": [
    {
      "id": 12, "userId": 1, "userName": "Alice", "department": "Procurement",
      "hours": 2, "date": "2026-08-01T00:00:00.000Z", "tag": "procurement",
      "activities": "vendor negotiation", "documentId": 3, "documentTitle": "PO-4471",
      "createdAt": "2026-08-01T10:00:00.000Z", "updatedAt": "2026-08-01T10:00:00.000Z"
    }
  ],
  "total": 42, "page": 1, "pageSize": 25
}
```

### POST `/api/checkins`
Accepts **either** a parsed-text body or a structured body.

- Text body: `{ "text": "1.5 hrs #meeting standup" }` parsed by `services/parser.js`. Invalid parses return `400 { error }`.
- Structured body: `{ "hours": number, "tag": string, "activities": string, "date": string (optional), "documentId": number (optional) }`.

Optional flag `useSmartTag: true` triggers `mockCategorize` from `services/genai.js` to set the tag when `tag` is omitted. Tags are lowercased; a leading `#` is stripped.

Returns the created check-in (same shape as list items) with status `201`.

```json
{
  "id": 13, "userId": 1, "userName": "Alice", "department": "Procurement",
  "hours": 1.5, "date": "2026-08-18T00:00:00.000Z", "tag": "meeting",
  "activities": "standup", "documentId": null, "documentTitle": null,
  "createdAt": "2026-08-18T10:00:00.000Z", "updatedAt": "2026-08-18T10:00:00.000Z"
}
```

### PATCH `/api/checkins/:id`
Partial update. Body fields (all optional): `hours` (positive number), `tag`, `activities`, `date`, `documentId`. Returns the updated check-in. `404` if not found.

### DELETE `/api/checkins/:id`
Deletes the check-in. Returns `204 No Content`. `404` if not found.

### GET `/api/analytics/time?dimension=tag|date|department|user`
Aggregates logged hours. Default dimension is `tag`. Unknown dimensions return `400`. Each `series` entry has `key` (the dimension value), `hours` (summed) and `count`. `totalHours` is the sum.

```json
{
  "totalHours": 29.5,
  "series": [
    { "key": "procurement", "hours": 21.5, "count": 3 },
    { "key": "meeting", "hours": 8, "count": 2 }
  ]
}
```

### GET `/api/analytics/time/departments`
Per-department breakdown.

```json
{
  "departments": [
    { "department": "Procurement", "totalHours": 45.5, "users": 4, "avgHoursPerUser": 11.38 }
  ]
}
```

### GET `/api/analytics/documents`
Document status counts.

```json
{
  "totalDocuments": 9,
  "byStatus": { "pending": 3, "approved": 2, "in-review": 2, "rejected": 2 }
}
```

### POST `/api/documents` (multipart/form-data)
Upload a document. Fields: `file` (binary, max 5 MB, required), `title` (optional, defaults to filename), `type` (optional, defaults to `OTHER`, one of `PO`, `QUOTE`, `REQ`, `OTHER`).

Returns the created document record (including `id`, `title`, `type`, `status`, `mimeType`, `sizeBytes`, `contentText`, `createdAt`, `updatedAt`).

```json
{
  "id": 3, "title": "PO-4471", "type": "PO", "filename": "po-4471.txt",
  "status": "pending", "mimeType": "text/plain", "sizeBytes": 1024,
  "contentText": "vendor Acme total 1500.00 ...", "createdAt": "2026-08-18T10:00:00.000Z",
  "updatedAt": "2026-08-18T10:00:00.000Z"
}
```

### GET `/api/documents`
List/filter documents, paginated. Optional `?q=` (search title), `?status=` and `?type=` filters. Each item is the full document plus `checkInCount` (count of linked check-ins) and `totalTimeSpent` (summed hours of linked check-ins).

```json
{
  "items": [
    {
      "id": 3, "title": "PO-4471", "type": "PO", "status": "approved",
      "filename": "po-4471.txt", "mimeType": "text/plain", "sizeBytes": 1024,
      "contentText": "vendor Acme total 1500.00 ...", "analysis": null,
      "createdAt": "2026-08-18T10:00:00.000Z", "updatedAt": "2026-08-18T10:00:00.000Z",
      "checkInCount": 5, "totalTimeSpent": 12.5
    }
  ],
  "total": 1, "page": 1, "pageSize": 25
}
```

### GET `/api/documents/:id`
Document detail with its linked check-ins. Returns the full document (including `totalTimeSpent`) and a `checkIns` array. Each check-in carries `hours`, `activities`, `date`, `tag`, and `user` (the full user record, including `name`).

```json
{
  "id": 3, "title": "PO-4471", "type": "PO", "status": "approved", "analysis": null,
  "totalTimeSpent": 12.5,
  "checkIns": [
    {
      "hours": 2, "activities": "vendor negotiation", "date": "2026-08-01T00:00:00.000Z",
      "tag": "procurement", "user": { "id": 1, "name": "Alice", "department": "Procurement", "role": "buyer", "email": "alice@corp.com" }
    }
  ]
}
```

### PATCH `/api/documents/:id`
Update `title`, `type`, `status`, or `contentText`. `status` must be one of `pending`, `in-review`, `approved`, `rejected`. Returns the updated document. `404` if not found.

### DELETE `/api/documents/:id`
Deletes the document. Returns `204 No Content`. `404` if not found.

### POST `/api/documents/:id/analyze`
Runs mock GenAI field extraction (`mockAnalyzeDocument`) and persists the result to `document.analysis`. Returns `{ analysis }`.

```json
{
  "analysis": {
    "fields": { "vendor": "acme", "amount": "$ 1500.00", "documentType": "PO" },
    "confidence": 0.85, "source": "mock-extraction-rule"
  }
}
```

### POST `/api/documents/:id/suggest`
Returns mock workflow suggestions (`mockSuggestWorkflow`). Requires an existing analysis (it is computed on demand if absent). Returns `{ suggestions }`.

```json
{
  "suggestions": [
    { "action": "Confirm vendor/supplier name", "reason": "Required for PO matching", "priority": "high" }
  ]
}
```

### GET `/api/ai/insights`
Mock time insights from all check-ins. Returns `{ insights: [{ title, body, type }] }`.

```json
{
  "insights": [
    { "title": "Total logged time", "body": "29.5 hrs across 12 check-in(s).", "type": "summary" },
    { "title": "Top activity", "body": "procurement accounts for the most time at 21.5 hrs.", "type": "pattern" }
  ]
}
```

### GET `/api/ai/anomalies`
Mock anomaly detection over check-ins and documents. Returns `{ anomalies: [{ entity, type, detail, severity }] }`.

```json
{
  "anomalies": [
    { "entity": "Check-in #9", "type": "long-entry", "detail": "16 hrs logged in a single entry", "severity": "high" },
    { "entity": "Doc #3", "type": "stale-review", "detail": "PO-4471 has been in review for 20 days", "severity": "high" }
  ]
}
```

### GET `/api/ai/search?q=`
Mock natural-language search over check-ins and documents. `q` is the query. Returns `{ intent, answer, results }`. `results` for check-in matches include `{ id, hours, tag, activities, userName, date }`; for document matches the raw document objects.

```json
{
  "intent": "time-total",
  "answer": "Total logged time on procurement: 21.5 hrs across 5 check-in(s).",
  "results": [
    { "id": 12, "hours": 2, "tag": "procurement", "activities": "vendor negotiation", "userName": "Alice", "date": "2026-08-01T00:00:00.000Z" }
  ]
}
```

### GET `/api/admin/analytics`
Team analytics. Returns totals and breakdowns.

```json
{
  "totalUsers": 8,
  "totalHours": 320.5,
  "activeUsers": 6,
  "departmentBreakdown": [
    { "department": "Procurement", "hours": 145.5, "users": 3 }
  ],
  "topTags": [
    { "tag": "procurement", "hours": 80 }
  ]
}
```

---

## Examples

### (a) Check-ins list with pagination

```http
GET /api/checkins?page=1&pageSize=2&tag=procurement HTTP/1.1
Host: localhost:4000
x-user-id: 1
```

```json
{
  "items": [
    {
      "id": 12, "userId": 1, "userName": "Alice", "department": "Procurement",
      "hours": 2, "date": "2026-08-01T00:00:00.000Z", "tag": "procurement",
      "activities": "vendor negotiation", "documentId": 3, "documentTitle": "PO-4471",
      "createdAt": "2026-08-01T10:00:00.000Z", "updatedAt": "2026-08-01T10:00:00.000Z"
    },
    {
      "id": 11, "userId": 1, "userName": "Alice", "department": "Procurement",
      "hours": 1, "date": "2026-07-30T00:00:00.000Z", "tag": "procurement",
      "activities": "quote review", "documentId": null, "documentTitle": null,
      "createdAt": "2026-07-30T09:00:00.000Z", "updatedAt": "2026-07-30T09:00:00.000Z"
    }
  ],
  "total": 7, "page": 1, "pageSize": 2
}
```

### (b) Document upload (multipart/form-data)

```http
POST /api/documents HTTP/1.1
Host: localhost:4000
Content-Type: multipart/form-data; boundary=----boundary
x-user-id: 1

------boundary
Content-Disposition: form-data; name="file"; filename="po-4471.txt"
Content-Type: text/plain

vendor Acme total 1500.00 po-4471 date 2026-08-01
------boundary
Content-Disposition: form-data; name="title"

PO-4471
------boundary
Content-Disposition: form-data; name="type"

PO
------boundary--
```

```json
{
  "id": 3, "title": "PO-4471", "type": "PO", "filename": "po-4471.txt",
  "status": "pending", "mimeType": "text/plain", "sizeBytes": 46,
  "contentText": "vendor Acme total 1500.00 po-4471 date 2026-08-01",
  "createdAt": "2026-08-18T10:00:00.000Z", "updatedAt": "2026-08-18T10:00:00.000Z"
}
```

### (c) AI search

```http
GET /api/ai/search?q=how%20many%20hours%20on%20procurement HTTP/1.1
Host: localhost:4000
x-user-id: 1
```

```json
{
  "intent": "time-total",
  "answer": "Total logged time on procurement: 21.5 hrs across 5 check-in(s).",
  "results": [
    { "id": 12, "hours": 2, "tag": "procurement", "activities": "vendor negotiation", "userName": "Alice", "date": "2026-08-01T00:00:00.000Z" }
  ]
}
```

---

## Notes

- The SQLite → Postgres production swap is documented in `docs/architecture.md` (Task 29), not here.
