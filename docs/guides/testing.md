# Testing

Vitest for logic, server code and components; Storybook for every component in a real browser; scripted browser reviews for pages. A task is done when `typecheck`, `check`, `test`, `test:storybook`, `build` and `build-storybook` are green with no warnings.

## The suites

| Command | What runs | Environment |
| --- | --- | --- |
| `pnpm test` | `tests/**/*.test.{ts,tsx}` (Vitest project `unit`) | Node; files starting with `// @vitest-environment jsdom` get a DOM |
| `pnpm test:storybook` | Every story, twice: en/light, then ne/dark. Play functions run, and any a11y violation fails the story. | Headless Chrome (the installed one) |
| `pnpm test:coverage` | The unit project with v8 coverage, then a per-area table (`scripts/coverage-report.mjs`) | `coverage/index.html` |

| Folder | For |
| --- | --- |
| `tests/unit/` | Pure logic: schemas, list and search helpers, SEO and route-wide head rules, CSP, env, errors, intl |
| `tests/server/` | Code with a database or server: repositories and services on PGlite, middleware, guards, permissions, attachments, sitemap |
| `tests/components/` | jsdom tests of fields, filters, breadcrumbs, masking, preferences UI, permissions UI, the attachments editor |
| `tests/i18n/` | Message parity, translation, unused keys, locale routing |
| `tests/email/` | Every template in both languages |

## Patterns

- **Database:** `createTestDb()` (`tests/utils/test-db.ts`) is an in-process Postgres (PGlite) with the committed migrations and one admin user. Repositories and services take a `db`, so tests call them directly.
- **Server functions** run only inside Start. Test the functions they call, and the wiring with static checks: `tests/server/test-crud-functions.test.ts` asserts each function's `requirePermission`, and `env-boundary.test.ts` asserts no client code imports `src/server`.
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

## Browser review (pages)

The scripts behind each task's review live outside the repo (they drive Chrome with puppeteer and axe-core). The method:
- **Pages:** every page, in en/ne × light/dark × 390/768/1280.
- **Checks:** axe (WCAG 2.2 AA + best practices), horizontal overflow, console errors and warnings, CSP violations, and CLS ≤ 0.01.
- **Where to measure:** on a production build. Dev serves unbundled modules and skips font preloads, so its layout-shift numbers aren't meaningful, and scripts must wait for hydration before clicking.
