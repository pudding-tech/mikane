# Mikane — Frontend

Angular 21 frontend for [Mikane](../../README.md). For project overview, installation, and backend setup, see the [root README](../../README.md).

## Stack

- Angular 21 (standalone components, signals where present, `provideZonelessChangeDetection`)
- Angular Material
- RxJS, SCSS
- [MSW](https://mswjs.io/) for local mock backend
- Vitest (via `@angular/build:unit-test`) + jsdom for unit tests
- ESLint (flat config)

## Scripts

Run all commands from `app/mikane/`.

| Command            | What it does                                                                 |
| ------------------ | ---------------------------------------------------------------------------- |
| `npm run dev`      | Dev server against the real backend (expects `server/` running on `:3002`). |
| `npm run dev:mock` | Dev server against in-process MSW mocks — no backend or DB required.         |
| `npm run build`    | Production build into `dist/mikane/`.                                        |
| `npm run build:test` | Production build using the `test` environment file.                        |
| `npm run watch`    | Development build in watch mode.                                             |
| `npm run test`     | Run all unit tests once.                                                     |
| `npm run test:dev` | Run unit tests in watch mode, no coverage.                                   |
| `npm run lint`     | ESLint over `src/**/*.{ts,html}`.                                            |

The dev server defaults to `http://localhost:4200`.

## Environments

`src/environments/`:

- `environment.ts` — local development (points at `http://localhost:3002/api/`).
- `environment.mock.ts` — MSW-backed dev, used by `dev:mock` via Angular's file replacement.
- `environment.test.ts` — staging / test backend.
- `environment.prod.ts` — production backend.

Selection is driven by the `--configuration` flag in [angular.json](angular.json).

## Mock backend (MSW)

`npm run dev:mock` boots the app with MSW intercepting all `/api/*` requests via the service worker in [public/mockServiceWorker.js](public/mockServiceWorker.js). Handlers and JSON fixtures live under [src/mocks/](src/mocks/):

```
src/mocks/
  browser.ts          # setupWorker entry, dynamically imported from main.ts
  db.ts               # in-memory store + CURRENT_USER mock
  fixtures/           # JSON snapshots used as seed data
  handlers/           # one file per API resource (events, expenses, …)
```

**When to use it:** isolated UI work, design iteration, demoing without infra.

**When *not* to use it:** anything that touches the FE/BE contract (new endpoints, response-shape changes, auth/CSRF behavior, persistence semantics). The mocks won't catch drift — run the real backend instead.

If you add a new endpoint or change a response shape, update the matching handler under `src/mocks/handlers/` to keep the mock layer honest.

## Project layout

```
src/app/
  pages/        # routed views
  features/     # feature-scoped components, dialogs, etc.
  services/     # HTTP services + interceptors (auth, csrf)
  shared/       # reusable components, directives, pipes
  helpers/      # framework-agnostic utilities, async form validators
  types/        # cross-cutting types
```
