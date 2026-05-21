# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Mikane is a shared-expense settlement app split into two npm projects in one repo:

- `server/` — Express 5 + TypeScript API backed by PostgreSQL 15. Most domain logic lives in PG stored functions in `server/db_scripts/` and is invoked from thin `server/src/db/*.ts` wrappers.
- `app/mikane/` — Angular 21 PWA (standalone components, Angular Material, service worker). Routes are lazy-loaded per page module from `app/mikane/src/app/pages/`.
- `.github/workflows/` — CI runs build + test for both projects on PRs into `develop`; releases tag and deploy from `main`. Default working branch is `develop`.

The two projects do not share code or tooling — they have independent `package.json`, eslint, TS config, and Node-only deps.

## Common commands

All commands run from the respective project directory.

### Backend (`server/`)
- `npm run dev` — Watch mode via `tsx` + `tsc --noEmit` in parallel. Requires a populated `.env`.
- `npm run db` — Start the dockerized **test** Postgres on port `37000` (used by the test suite, not by `npm run dev`).
- `npm test` — `vitest run --coverage`. **Requires `npm run db` first**; tests hit a real DB and run with `maxWorkers: 1`, `isolate: false` (shared DB state between files; `resetDatabase()` runs once in `afterAll`).
- Run a single test file: `npx vitest run tests/events.test.ts`
- Run a single test: `npx vitest run tests/events.test.ts -t "creates event"`
- `npm run lint` / `npm run typecheck` / `npm run build`
- `npm run esbuild` — Alternate bundled build via `esbuild.config.js`.
- Local dev DB (option B from README): `docker compose up` from `server/` runs both API and PG with volumes from `pg_db_data/`.

### Frontend (`app/mikane/`)
- `npm run dev` — `ng serve --host=0.0.0.0` (use `npm start` for localhost-only). Serves on `http://localhost:4200`, expects API at `http://localhost:3002`.
- `npm test` — Angular unit tests via `@angular/build:unit-test` (Vitest runner), no watch. `npm run test:dev` for watch mode without coverage.
- Single test: `npx ng test --include='src/app/pages/events/**/*.spec.ts'`
- `npm run build` defaults to the **production** configuration; use `npm run build:test` for the test backend or `npm run watch` for a development build with sourcemaps.
- `npm run lint` runs `@angular-eslint` over TS + HTML templates.

## Architecture notes

### Backend request flow
`src/server.ts` wires the Express app: Helmet → CORS → Swagger UI at `/` (served from `src/api.json`) → `express-session` backed by the custom `SessionStore` (a PG-backed store in `src/session-store/`) → `requestContext` AsyncLocalStorage middleware (for log correlation) → route mounts under `/api` → `errorHandler`.

Routes live in `src/api/*.ts` and follow a strict middleware order: `useRateLimit()` → `authCheck` or `authKeyCheck` → `csrfCheck` → handler. The `authKeyCheck` variant accepts either a logged-in session or an `X-Api-Key` header; `masterKeyCheck` requires a master API key.

Handlers throw `ErrorExt(ec.PUDxxx)` from `src/types/errorCodes.ts` instead of building responses inline — `errorHandler` translates these into `{ code, message }` JSON with the right status. **When adding a new error condition, define a new `PUDxxx` constant rather than reusing a generic one or returning ad-hoc strings.**

### Database layer
Business logic is implemented as PG stored procedures in `server/db_scripts/*.sql`; `src/db/db*.ts` modules are thin wrappers that call `SELECT * FROM <function>(...)` and translate PG error codes (e.g. `P0006`, `P0008`) back to `PUDxxx` `ErrorExt`s. Schema lives in `db_scripts/schema/db_schema.sql` with versioned migration scripts (`2.x-2.y_migrations.sql`) alongside it. When changing data model:
1. Edit `db_schema.sql` and add a matching `db_scripts/schema/<from>-<to>_migrations.sql`.
2. Update or add the relevant `db_scripts/*.sql` function(s).
3. Update the `src/db/db*.ts` wrapper and any error-code translation.

`bash_scripts/db_init.sh` is what loads schema + all functions into a fresh container (used by both `docker-compose.yml` and `test_db/docker-compose-test-db.yml`); the test DB additionally seeds a master API key from `test_db/master_api_key.sql`.

### Settlement algorithm
`src/calculations.ts` is the only pure-domain module. `calculateBalance` computes per-user net position using per-category weights; `calculatePayments` runs a greedy largest-debtor/largest-lender match. It minimizes transactions heuristically — not provably optimal. Keep this file dependency-free apart from the logger and types.

### Frontend structure
- `src/app/pages/` — One folder per top-level route, each with its own `*.routes.ts` lazy-loaded from `app-routing.module.ts`.
- `src/app/services/` — One folder per domain (auth, event, expense, user, etc.); services are the only thing that should talk to the API.
- `src/app/features/` — Cross-page UI building blocks (menu, footer, dialogs, mobile shell).
- `src/app/shared/`, `src/app/helpers/`, `src/app/types/` — Reusable bits.
- Environment switching uses Angular's `fileReplacements` for `production`/`test` build configurations; the `test` configuration points at `environment.test.ts` and is what `build:test` ships.

### Tests
Backend tests in `server/tests/*.test.ts` use Supertest against the in-process app and require the dockerized test DB on port `37000`. CSRF and Postmark are mocked via `tests/mocks/` (loaded by `tests/setup.ts`). Since tests share DB state, ordering and cleanup within a `describe` matter — prefer self-contained setup per test rather than relying on data from earlier files.

## Conventions worth knowing
- **TS imports keep the `.ts` extension** (`import x from "./foo.ts"`). The backend `tsconfig` uses `Node16` resolution with `rewriteRelativeImportExtensions`; do not drop the extension when adding imports.
- Backend style enforced by ESLint: **double quotes, semicolons required, 2-space indent**.
- Frontend formatting follows the repo's Prettier config (tabs, see `.vscode/settings.json`); ESLint enforces `app`-prefixed component/directive selectors and the standalone-component preference.
- Versions are bumped via `bump.yml` workflow; manual `version` field edits in `package.json` are usually unnecessary.
- `develop` is the integration branch — PRs target it, not `main`.
