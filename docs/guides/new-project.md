# Starting a new project from the template

From a fresh clone to your own app with its first feature, every gate green. Decisions 0141 and 0163.

## 1. Clone and install

- [ ] Clone to a short path (Windows: about 90 characters at most, 0029), then `pnpm install` (Node ≥ 22.18; `.nvmrc` says 24).
- [ ] `pnpm setup:local` (0156): creates `.env` from `.env.example` with a generated `BETTER_AUTH_SECRET`, compiles the messages and creates a local database in `.data/pglite` with an admin and demo data. Then `pnpm dev:local` runs the app on it, with no Neon project needed yet.
- [ ] In `.env`, set `VITE_APP_TITLE` and `VITE_SITE_URL`, and `DATABASE_URL` once you have a Neon branch (or any Postgres) for `pnpm dev` and deploys (README, "Environment variables"). Leave Sentry, PostHog, Cloudinary, Turnstile and Google empty until you need them.
- [ ] `pnpm diagnose` whenever something doesn't start: it checks Node, `.env`, the database and its migrations, and ports, and prints the fix.

## 2. Remove what you don't need

- [ ] `pnpm strip-demo` removes the template's removable **layers**, each whole:
  - **portfolio:** the portfolio at `/` (routes, data, styles, fonts, messages, sitemap entries, tests and its guide). A neutral landing page takes its place (`src/routes/_public/index.tsx`, from `scripts/templates/landing`).
  - **apps:** the showcase apps under `/apps` (from Task 41 on).

  Keep one with `--keep-portfolio` or `--keep-apps`. The **core** always stays: auth, admin, RBAC, audit, attachments, i18n, SEO, **Test CRUD** and everything under **`/dev`** (the demo home, `/dev/stack`, the public Test CRUD pages and `/dev/examples`: references to copy, which exist only in development). It removes dependencies nothing imports any more (knip), turns dropped tables into a migration, ends with a build (which regenerates `src/routeTree.gen.ts`; `--no-build` skips it), and deletes itself, with CI's template job, once no layer is left.
- [ ] Commit the result on its own, so the removal is one reviewable change.

How it works: each layer's files, package scripts, crons, knip entries and tables are lists at the top of `scripts/strip-demo.ts`. Its code in shared files sits between `portfolio:start` / `portfolio:end` (or `apps:…`) comment lines, or on lines ending in `// @portfolio` (an HTML comment in Markdown); `scripts/lib/strip-markers.ts` has the rules and `tests/unit/strip-markers.test.ts` checks they balance. Messages nothing uses any more are dropped by the same rule as `tests/i18n/message-usage.test.ts`. A layer's piece you add to a shared file needs a marker, or strip-demo leaves it behind.

## 3. Make it yours

- [ ] **Name:** `name` in `package.json`, the README title and intro, `VITE_APP_TITLE`, `site_description` and the landing page's `landing_*` messages in `messages/en.json` and `messages/ne.json`, and the landing page itself.
- [ ] **Icons and social image:** replace the files in `public/` (same names and sizes: `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `og-default.png`). The manifest reads the app title from env.
- [ ] **Theme:** the colour tokens in `src/styles/app.css` (`:root` and `.dark`), and `THEME_COLORS` in `src/routes/__root.tsx` to match `--background`.
- [ ] **Uploads folder:** `CLOUDINARY_FOLDER` (it defaults to `portfolio`).
- [ ] **CLAUDE.md:** the first paragraph ("What this is") and the plan status line describe the template; rewrite them for your app. Keep the golden rules and pitfalls.
- [ ] **License:** `LICENSE` and the README's license section.

## 4. Database and first admin

- [ ] `pnpm db:migrate`, then `pnpm db:seed-admin --email you@example.com --password "…" --name "You"`.
- [ ] Optional: `pnpm db:seed-demo` for roles, users and 30 Test CRUD items to click through.

## 5. Your first feature

- [ ] `pnpm new:feature <name>` (kebab-case, e.g. `projects`), with `--title "Projects"` and `--title-ne "परियोजनाहरू"` for the section's names. Without `--title-ne` the Nepali name is the English one plus "(अनुवाद गर्नुहोस्)" ("translate"), so it can't ship unnoticed.
- [ ] It generates the Test CRUD shape for an admin section: table and migration, shared schema, repository and service with a PGlite test, permissions (`<name>:read|create|update|delete`, with labels), guarded server functions and their guarded-functions entry, queries, thin admin routes (list, new, edit) with the UI in `src/features/<name>/components`, messages in both languages, a sidebar link and dashboard card, the audit action for deletes, stories and their server-function mocks, and the browser-review entries. It runs the migration generator, Biome and a build.
- [ ] `pnpm db:migrate`, then grant the new permissions to roles in `/admin/roles/permissions` (admins hold them already).
- [ ] Add your columns: the table (`src/server/db/schema/<name>.ts`, then `pnpm db:generate`), the input schema and DTOs, the repository's mapping, the form fields, the columns and their messages. The edit page (`/admin/<name>/$id`) is listed in `NOT_REVIEWED` until a seeded row exists; seed one and review it like `/admin/test-crud/$id`.
- [ ] Public pages, filters beyond search, optimistic edits, attachments: copy them from Test CRUD (`docs/guides/conventions.md`, "Building a list page"). Its public pages are a dev reference under `/dev/test-crud`; yours go under `src/routes/_public/` with `seo()`/`listSeo()` and a sitemap entry.

## 6. Gates

- [ ] `pnpm typecheck && pnpm check && pnpm knip && pnpm test && pnpm test:storybook && pnpm test:e2e && pnpm build && pnpm build-storybook`. CI runs the same on every PR.
- [ ] Deploy: [deployment.md](deployment.md).
