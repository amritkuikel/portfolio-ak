# Testing

Vitest for logic, server code and components; Storybook for every component in a real browser; Playwright for flows and the browser review of every page, against a production build. A task is done when `typecheck`, `check`, `knip`, `test`, `test:storybook`, `test:e2e`, `build` and `build-storybook` are green with no warnings. CI (`.github/workflows/ci.yml`) runs all of them on every pull request and push to `main`; story tests and e2e tests there use the runner's installed Chrome.

## The suites

| Command | What runs | Environment |
| --- | --- | --- |
| `pnpm test` | `tests/**/*.test.{ts,tsx}` (Vitest project `unit`) | Node; files starting with `// @vitest-environment jsdom` get a DOM |
| `pnpm test:storybook` | Every story, twice: en/light, then ne/dark. Play functions run, and any a11y violation fails the story. | Headless Chrome (the installed one) |
| `pnpm test:e2e` | `e2e/`: flows and the browser review (Playwright), against a production server the harness builds and starts | Installed Chrome; in-memory PGlite (CI: Postgres) |
| `pnpm test:coverage` | The unit project with v8 coverage, then a per-area table (`scripts/coverage-report.mjs`) | `coverage/index.html` |

| Folder | For |
| --- | --- |
| `tests/unit/` | Pure logic: schemas, list and search helpers, SEO and route-wide head rules, CSP, env, errors, intl |
| `tests/server/` | Code with a database or server: repositories and services on PGlite, middleware, guards, permissions, attachments, sitemap |
| `tests/components/` | jsdom tests of fields, filters, breadcrumbs, masking, preferences UI, permissions UI, the attachments editor |
| `tests/i18n/` | Message parity, translation, unused keys, locale routing |
| `tests/email/` | Every template in both languages |
| `e2e/` | Playwright: `review.spec.ts` (every page), `flows/` (auth, Test CRUD, edit conflicts, permissions, no-JS lists, health), `harness/` (the server it runs against), `support/` (fixtures, page list, checks) |

## Patterns

- **Database:** `createTestDb()` (`tests/utils/test-db.ts`) is an in-process Postgres (PGlite) with the committed migrations and one admin user. Repositories and services take a `db`, so tests call them directly.
- **Server functions** run only inside Start. Test the functions they call, and the wiring with static checks: `tests/server/guarded-functions.test.ts` asserts each function's `requirePermission` and that every file in `src/functions` is declared, and `env-boundary.test.ts` asserts no client code imports `src/server`.
- **Routes:**
  - `createRouter({ routeTree, context: {} as RouterContext })` resolves real route ids (see `route-seo.test.ts`, `dev-examples.test.ts`);
  - `createMemoryHistory` plus a test route tree renders components that need a router (`breadcrumbs.test.tsx`, `route-masking.test.tsx`).
- **Cloudinary:** `tests/utils/fake-cloudinary.ts` runs the real client over a fake `fetch` that behaves like Cloudinary's API.
- **Locale:** `overwriteGetLocale(() => "ne")` and reset it in `afterEach`.
- **Env:** `tests/setup/env.ts` sets a valid baseline; override with `vi.stubEnv` (including `DEV`).
- **Radix menus** open on pointer events: use `userEvent`, not `element.click()`.
- **Timeouts:** unit tests have 15 s (jsdom interaction tests are slow on a busy machine). Import heavy modules at the top of a test file, not inside a test: module loading doesn't count against the timeout there.
- **Guards as tests:**
  - every route's head rules (`route-seo.test.ts`);
  - every `<form>`'s method (`form-method.test.ts`);
  - the example registry against the routes;
  - unused messages.

## Storybook

- **Where:** stories sit next to their components (`*.stories.tsx`).
- **Providers:** `.storybook/app-providers.tsx` wraps each story in the app's router (memory history), Query, DB and preferences store. Set the session, preferences and URL with `parameters.app`.
- **No server:** server functions and the auth client are mocked (`.storybook/mocks/`).
- **Fields:** wrap them in `FieldStory` (`src/components/forms/story-harness.tsx`) and add a `play` function for anything interactive.
- **What not to import:** components must not import Start runtime helpers (`createIsomorphicFn`); Storybook has no Start plugin.

## E2E and the browser review (`pnpm test:e2e`)

One command, locally and in CI. Playwright runs `node e2e/harness/server.ts` (its `webServer`), which:
1. **builds** the app (`vite build`) with fixed public settings and Sentry/PostHog off, whatever `.env` says;
2. **starts a database:** in-memory PGlite served over TCP (`e2e/harness/pglite-server.ts`), or the Postgres in `E2E_DATABASE_URL` (CI; its name must contain `e2e` or `test`, because it's emptied first);
3. **migrates and seeds** it: an admin and the `db:seed-demo` data, every user with the password in `e2e/harness/config.ts`;
4. **starts the harness** on port 3101: a fake Resend API that keeps every email, plus test controls (read emails, reset rate limits, look up seeded rows);
5. **starts the production server** on port 3100 with `EMAIL_PROVIDER=resend` and `RESEND_BASE_URL` pointing at the harness, so emails go through the real provider code. No other env reaches it.

| Command | Use |
| --- | --- |
| `pnpm test:e2e` | Everything (about 6 minutes; CI splits it into 3 shards) |
| `pnpm test:e2e e2e/flows` / `--project=review -g "/admin"` | A folder, or tests whose title matches |
| `node e2e/harness/server.ts` in another terminal | Keeps a server up: `pnpm test:e2e` reuses it locally (restart it after changing app code) |
| `E2E_SKIP_BUILD=1` | Reuse the last e2e build in `.output` |
| `pnpm test:e2e --ui` | UI mode: pick, watch and debug tests (see below) |
| `pnpm exec playwright show-report` | The HTML report; CI uploads it when a shard fails (traces are recorded on the retry) |

Ports: the app on `E2E_PORT` (3100), the harness on `E2E_HARNESS_PORT` (3101); PGlite takes any free port (`E2E_PGLITE_PORT` to fix it). The harness stops before building when 3100 or 3101 is taken.

### UI mode (`pnpm test:e2e --ui`)

- **Start-up takes about a minute:** UI mode starts the harness, which builds first. The test list shows "Loading…" until the server is up. UI mode restarts the server when the window reconnects (a reload), so it builds again; `E2E_SKIP_BUILD=1 pnpm test:e2e --ui` reuses the last e2e build when the app code hasn't changed.
- **Projects:** only `flows` is ticked at first (UI mode selects the first project). Tick `review` under "Projects" for the browser review.
- **"Playwright browsers are missing"** can be ignored: the suite runs in the installed Chrome (`channel: "chrome"`), not Playwright's bundled browsers, so there's nothing to install.
- **Closing it** stops the harness and the server. If the UI process is killed instead, the harness notices within a few seconds and exits, so no stale server is left on port 3100.

### The browser review (`e2e/review.spec.ts`)

- **Pages:** `REVIEWED_PAGES` in `e2e/support/pages.ts`, each with who visits it (`as`), how a `$param` gets a value (from `/sitemap.xml`, or a seeded row), and an expected status (the 403 and 404 pages). `tests/unit/e2e-pages.test.ts` compares the list with `src/routeTree.gen.ts`, so **a new route fails `pnpm test` until it's reviewed** or listed in `NOT_REVIEWED` with a reason. `/dev/*` is skipped (404 in builds).
- **Matrix:** en/ne × light/dark × 390/768/1280, one test each.
- **Checks** (`e2e/support/review.ts`):
  - the HTTP status;
  - horizontal overflow, naming the elements that stick out;
  - CLS ≤ 0.01 from a `layout-shift` `PerformanceObserver`, naming what moved;
  - axe: WCAG 2.2 AA plus best practices.
- **Always on** (the `guard` fixture in `e2e/support/fixtures.ts`, for flows too): any console error or warning (hydration mismatches included), uncaught error, or CSP violation (`securitypolicyviolation`) fails the test. A test that expects one calls `guard.allow(pattern)`, e.g. `RESOURCE_STATUS(403)` for the browser's own line on a refused page.
- **Retries:** each test gets one retry (locally too). A test that passes only on the retry is listed as flaky in the summary and the report, with a trace; treat a page that keeps showing up there as a real problem.
- **Warm-up load:** each page is loaded once before the measured load, so the fonts are cached. Cold, on a busy CPU, Chrome can paint the fallback faces before the preloaded fonts arrive, and CLS would depend on machine load (decision 0121).

### Flows (`e2e/flows/`)

- **Auth:** sign up → verify → log in; refused log-in while unverified; log-in code; password reset. Links and codes come from the captured emails (`harness.nextEmail(to, template)`).
- **Test CRUD:** create, edit, publish (the public page appears) and delete (it 404s), as admin.
- **Conflicts:** two tabs edit the same item; the second save is refused with the "changed by someone else" notice, its response carries an `x-request-id` that matches the error, and reloading then saving keeps both changes.
- **Permissions:** a 403 page for a missing permission; actions a role lacks aren't offered; granting and revoking in the matrix takes effect on the next request.
- **No JavaScript:** search and pagination on the public and admin lists.
- **Health:** `GET`/`HEAD /api/health` answer 200 JSON, never cached; every response has its own `x-request-id`.

### Writing a test

- Import `test`/`expect` from `e2e/support/fixtures.ts`, not `@playwright/test`, so the guard runs.
- Sign in with `test.use(signedIn("admin"))`. The first test that needs a user signs in through the API and saves the state under `e2e/.auth/`, keyed by the harness run (each run has a new database); `signInState(user)` gives the file for a context you create yourself. Flows that change a user create one (`createVerifiedUser`), so seeded users stay as they are.
- Wait for hydration before using a form handled in JavaScript: `page.goto(path, { waitUntil: "networkidle" })`.
- Auth endpoints are rate limited per IP and every test is 127.0.0.1: call `harness.resetRateLimits()` before tests that sign in.
- Use roles and labels from `messages/en.json`; give an exact name when one label contains another ("Edit" vs "Quick edit").
- A new page needs nothing beyond its `REVIEWED_PAGES` entry.
