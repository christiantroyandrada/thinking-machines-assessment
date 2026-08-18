# WorkSmart — Architecture System Diagram

> Same Mermaid system diagram as in `docs/architecture.md`, rendered standalone.

```mermaid
flowchart LR
  Browser[Browser SPA\nReact + Vite] -->|HTTPS / REST + x-user-id| API[Express API\nNode.js]
  API --> DB[(Prisma ORM)]
  DB --> SQLite[(SQLite\nlocal dev)]
  DB --> PG[(PostgreSQL\nRender / prod)]
  API --> GENAI[Mock GenAI Service\n services/genai.js]
  GENAI -.->|future| LLM[(Real LLM\nOpenAI / Anthropic)]
  Browser -->|static build| Vercel[Vercel]
  API -->|deploy| Render[Render]
```

## Layers

- **Browser SPA** — React 18 + Vite (JavaScript), React component-local state (no global store). Communicates over HTTPS/REST, sending `x-user-id` for mock identity.
- **Express API** — Node.js service exposing REST routes; Prisma ORM; multer uploads (5MB cap); centralized error middleware; CORS enabled.
- **Prisma → SQLite/Postgres** — SQLite for local dev, PostgreSQL (Render) for production; provider swapped via a single config line.
- **Mock GenAI Service** — `server/src/services/genai.js` pure-function boundary; swap path to a real LLM provider later without touching routes or UI.
- **Deploy** — client static build on Vercel; API + Postgres on Render.
