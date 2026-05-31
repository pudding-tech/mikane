# CLAUDE.md

Behavioral guidelines for working in the Mikane (PuddingDebt) repo. Reduce common LLM coding mistakes; layer on project-specific context.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## Project Context

Mikane is a shared-expense settlement tool. Two deployables in one repo:

- **Frontend** — `app/mikane/` — Angular 21 (standalone components, signals where present), Angular Material, RxJS, SCSS. Tests via `ng test` (Vitest under the hood).
- **Backend** — `server/` — Express 5 on Node 24, PostgreSQL (via `pg`), session auth (`express-session` + `csrf-sync`). Tests via Vitest + Supertest against a Dockerized test DB.

Layout cheatsheet:

- `app/mikane/src/app/{pages,features,services,shared,helpers,types}` — UI surfaces, feature modules, HTTP services, shared utilities (incl. async form validators).
- `app/mikane/src/mocks/` — MSW handlers + JSON fixtures used by the `dev:mock` config. Only active when the build's environment file sets `mock: true` (see `environment.mock.ts`); the service worker file lives at `app/mikane/public/mockServiceWorker.js`.
- `server/src/{api,db,middlewares,parsers,email-services,session-store,types,utils}` — route handlers per resource (`api/events.ts`, `api/expenses.ts`, …), DB access, Express middleware.
- `server/db_scripts/` — SQL functions; `server/test_db/` — Dockerized Postgres for tests.

Common commands (run from the matching directory):

| Task              | Frontend (`app/mikane`)       | Backend (`server`)                  |
| ----------------- | ----------------------------- | ----------------------------------- |
| Dev server        | `npm run dev`                 | `npm run dev`                       |
| Dev server (mock) | `npm run dev:mock`            | —                                   |
| Build             | `npm run build`               | `npm run build`                     |
| Lint              | `npm run lint`                | `npm run lint`                      |
| Tests             | `npm run test`                | `npm run db` then `npm run test`    |
| Typecheck         | (covered by `ng build`)       | `npm run typecheck`                 |

`npm run dev:mock` runs the FE against MSW handlers in `src/mocks/` — no backend or DB needed. Use it for pure UI work; spin up the real backend when you need to exercise real auth, CSRF, persistence, or any API contract change (the mocks won't catch drift).

Backend integration tests need the test DB up (`npm run db`). Don't mock the DB to avoid that — use the real one.

**Branches:** `develop` is the main development branch — base feature branches off it and open PRs against it. `main` only gets updated when a release is built, so don't target it for day-to-day work.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.
- For changes that cross the FE/BE boundary (API shape, auth, CSRF, session), call that out before editing — both sides must stay in sync.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios — trust internal boundaries; validate only at HTTP/DB edges and user input.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style (tab indentation in the FE, current Angular control-flow / standalone patterns, Express handler shape on the BE), even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass" (FE: `*.spec.ts` with `TestBed`; BE: Vitest + Supertest hitting the test DB).
- "Fix the bug" → "Write a test that reproduces it, then make it pass."
- "Refactor X" → "Ensure `npm run lint` + `npm run test` pass before and after."

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Default verification ladder before reporting done:

1. Typecheck / build clean (`ng build` or `npm run typecheck`).
2. Lint clean (`npm run lint`).
3. Tests pass (`npm run test` — backend needs `npm run db` first).
4. For UI changes you can't run in a browser, say so explicitly rather than claiming success.

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
