# Deployment (Vercel + Neon)

`pnpm build` produces Vercel output through Nitro (`vercel.json`: framework `tanstack-start`). The server validates its environment on boot and refuses to start if something is missing.

## First deploy

1. **Database:** create a Neon project. Use the pooled connection string as `DATABASE_URL` and the direct one as `DATABASE_URL_UNPOOLED` (used for migrations).
2. **Environment** (Vercel project settings; full table in the README):
   - Required: `VITE_APP_TITLE`, `VITE_SITE_URL` (your domain, no trailing slash), `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `EMAIL_FROM`, `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`.
   - Optional: Cloudinary (all three), `CRON_SECRET`, Sentry, PostHog, Google sign-in, Turnstile (both keys), `AUTH_REQUIRE_ADMIN_2FA=true` once every admin has set up two-factor.
   - `VITE_` variables are baked in at build time. Changing one needs a rebuild.
3. **Migrate and seed:** from CI or locally against production, run `pnpm db:migrate` (it uses `DATABASE_URL_UNPOOLED`), then `pnpm db:seed-admin --email … --password … --name …`.
4. **Deploy.** Then open `/health` (database status; point your uptime monitor at `/api/health`, which answers 503 when the database is down), `/robots.txt`, `/sitemap.xml` (absolute URLs on your domain) and sign in at `/login`.

## Scheduled jobs

`vercel.json` runs `/api/cron/attachments` daily (03:17 UTC). It deletes removed images and day-old unlinked uploads from Cloudinary. Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; without `CRON_SECRET` the route answers 404.

## Every release

- **Gates:** CI runs `typecheck`, `check`, `knip`, `test`, `test:storybook`, `build` and `build-storybook` on every PR and on `main`. Deploy only a green commit.
- **Schema changes:** run `pnpm db:generate`, commit the SQL in `drizzle/` (CI fails if the schema and migrations disagree), and run `pnpm db:migrate` before (or with) the deploy. Keep a migration compatible with the version still running (add columns and tables first; drop them in a later release).
- **CSP reporting check (once per project, and after changing the CSP):** on a preview deploy with a Sentry DSN, open the browser console on any page and run `document.body.append(Object.assign(new Image(), { src: "https://csp-check.invalid/x.png" }))`. Within a minute or two Sentry shows a warning `CSP violation: img-src blocked https://csp-check.invalid/x.png`, and the function logs have a `csp violation` line (0139).
- **One-off scripts:** `pnpm attachments:import-legacy` moved Part 1 images from Postgres to Cloudinary. Once it has run everywhere, a migration can drop the legacy `test_crud.image` column and `test_crud_image` table.

## Running a production build locally

```bash
pnpm build
EMAIL_PROVIDER=resend RESEND_API_KEY=re_placeholder BETTER_AUTH_URL=http://localhost:3000 pnpm start
```

- **Email:** production refuses the console email provider. Any `re_…` value works as long as no email is sent.
- **Checks:** run CSP, layout-shift and SEO checks here, not in dev.

## Other hosts

Nitro can target other presets (Node, Netlify, Cloudflare). Three things change:
- **Client IP:** set your proxy's trusted client-IP header in `src/server/auth/client-ip.ts` (rate limits depend on it).
- **Cron:** replace the Vercel Cron schedule.
- **Neon driver:** check that the host's runtime supports it.

## Pitfalls already solved

Moved here from CLAUDE.md, which keeps only the ones that apply everywhere. Don't reintroduce them.

- **Running production locally** needs `EMAIL_PROVIDER=resend` and a `RESEND_API_KEY` (any `re_…` placeholder works when emails aren't sent). Production refuses the console email provider.
- **Raw SQL inserts into Better Auth tables** (seeds, scripts) must set `updated_at` on `account` and `session`: those columns have no database default.
