# WorkSmart — Architecture System Diagram

> Same Mermaid system diagram as in `docs/architecture.md`, rendered standalone.

```mermaid
flowchart LR
  Browser[Web browser] -->|HTTPS| Gateway[nginx on VPS]
  Gateway -->|/ static files| Client[React + Vite SPA]
  Gateway -->|/api + x-user-id| API[Express API\nNode.js]
  API --> DB[(Prisma ORM)]
  DB --> SQLite[(SQLite\npersistent Docker volume)]
  API --> GENAI[Mock GenAI Service\n services/genai.js]
  GENAI -.->|future| LLM[(Real LLM\nOpenAI / Anthropic)]
```

## Layers

- **Browser SPA.** React 18 + Vite (JavaScript), Zustand store for shared identity and theme, local useState for page data. Communicates over HTTPS/REST, sending `x-user-id` for mock identity.
- **Express API.** Node.js service exposing REST routes; Prisma ORM; multer uploads (5MB cap); centralized error middleware; CORS enabled.
- **Prisma to persistent SQLite.** Local Docker and the VPS use the same tested schema; deployed storage lives in the `worksmart_data` volume.
- **Mock GenAI Service.** `server/src/services/genai.js` keeps response contracts in one place. A real provider can retain the route and UI shapes after the server boundary is made asynchronous.
- **Deploy.** An isolated Docker Compose project shares only the VPS nginx gateway network. nginx terminates HTTPS and routes the SPA and `/api` to separate containers.
