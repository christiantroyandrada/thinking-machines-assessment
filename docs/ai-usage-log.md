# WorkSmart AI-assisted development log

The exam allows AI tools but asks candidates to document how they were used. This is the durable record for this submission.

## Tools used

- **opencode** helped turn the exam brief into a 36-task implementation plan, then assisted with the first working version of the code, tests, Docker setup, and documentation.
- **OpenAI Codex Desktop** reviewed the finished build on 20 August 2026. It was used for debugging, UI and accessibility improvements, architecture cleanup, test isolation, documentation checks, and final verification.
- The application itself does not call OpenAI, Anthropic, or another hosted model. Its six GenAI features are deterministic mocks in `server/src/services/genai.js`.

No web search or external reference material was used for the implementation review. The exam PDF and the repository were the sources of truth.

## How the tools were used

| Date | Tool | Request | Result kept in the submission | Human check or correction |
| --- | --- | --- | --- | --- |
| 18 Aug 2026 | opencode | Read the exam and identify the required deliverables. | A clean requirements summary and the initial build plan. | The exam text remains gitignored so the brief is not published with the answer. |
| 18-19 Aug 2026 | opencode | Build WorkSmart from the 36-task plan. | The initial React app, Express API, Prisma schema, mock GenAI features, tests, Docker files, and documentation. | Plan mistakes were reconciled against the real code, including the API filename, Zustand usage, and analytics return shape. |
| 20 Aug 2026 | Codex | Critique and improve the completed build, especially its UI, React component structure, and Node layering. | Atomic Design folders, thinner routes, repository and service boundaries, responsive tables, clearer errors, safer forms, and accessibility improvements. | Changes were checked against the original plan and exam rather than accepted blindly. |
| 20 Aug 2026 | Codex with adversarial critics | Look for failure modes a normal review could miss. | Safer seed behaviour, disposable per-run test databases, stricter request validation, non-destructive document deletion, and smaller document-list payloads. | A critic found that the first test setup could erase the Docker development database. The final setup was changed and then proven with two concurrent test runs. |
| 20 Aug 2026 | Codex | Review the final documentation and AI disclosure, remove local review artifacts, create focused commits, and push. | Corrected test counts, architecture wording, AI disclosure, and repository hygiene. | Unsupported claims about screenshots and completed deployment were removed. |

## Representative working prompts and results

The private opencode and Codex sessions do not have a portable public chat URL. The short extracts below preserve the actual requests and the outputs that were adopted. The repository history and test suite are the corresponding output record.

### 1. Exam review in opencode

**Prompt**

> can you properly convert the pdf to exam.txt so I can know the deliverables needed by the examiner

**Adopted result**

opencode extracted the working application, documentation, roadmap, presentation, privacy, collaborator, and AI-process requirements. That requirements summary became the basis of the implementation plan.

### 2. Initial implementation in opencode

**Prompt**

> Build WorkSmart per the 36-task plan for the Thinking Machines exam.

**Adopted result**

opencode executed the plan in small tasks with implementation and review passes. It produced the first full-stack build and the initial documentation set. Where the plan disagreed with the repository, the code was corrected to match the real API and data shapes.

### 3. Final engineering review in Codex

**Prompt extract**

> The outputs/walkthroughs are at the /output folder. What I want is for your higher intelligence than free models to critique and improve my code especially UI/UX for submission today.

The same request specified React Atomic Design and a Node flow of routes/controllers to services or use cases, then repositories.

**Adopted result**

Codex reviewed the exam, plan, code, running UI, screenshots, and walkthroughs. It reorganized reusable React components, moved database work behind repositories, tightened validation, improved mobile and keyboard UX, and added regression tests.

### 4. Scope confirmation in Codex

**Prompt**

> go ahead no need to create implementation plan as this was the source of truth in the implementation

**Adopted result**

Codex used `docs/superpowers/plans/2026-08-18-worksmart-full-build.md` as the implementation reference and did not replace it with a new plan.

### 5. Adversarial review result

The strongest finding was test isolation. Server tests originally shared `server/prisma/dev.db` with Docker and could clear the demo data. The fix now gives every test invocation its own disposable SQLite file. Two full server suites were run at the same time and both passed 75 tests without touching the development database.

Other adopted findings included malformed IDs and dates returning 500 responses, incomplete mobile table labels, document status updates without failure feedback, and document list responses carrying unnecessary full text. Each was fixed and covered by tests or browser checks.

## Final verification

- Server tests: 75 passed. Two complete server suites also passed concurrently.
- Client tests: 34 passed.
- Playwright: 10 browser and API flows passed against the public HTTPS deployment.
- Production client build: passed.
- Responsive audit: four pages checked at 390 px with no horizontal overflow.
- Seed data after testing: 100 users, 7,535 hours, and 9 documents remained intact.

## What remained a human decision

- The product scope stays intentionally demo-grade: mock identity, deterministic GenAI, and seeded assessment data.
- The public deployment runs at https://worksmart.ctaprojects.xyz. VPS access, DNS changes, certificate issuance, and the shared nginx gateway remained owner-authorized actions.
- The owner remains responsible for reviewing the code, accepting the trade-offs, sending the final submission email, and explaining the work during evaluation.

## Product AI versus development tooling

The AI tools above helped create and review the submission. They are separate from the mock GenAI features demonstrated in WorkSmart. Product behaviour, mock rules, confidence labels, fallbacks, and the path to a real model are documented in `docs/genai-approach.md`.
