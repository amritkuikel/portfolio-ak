# Security

What protects the app, and the rules that keep it that way. Most of it is enforced by tests or the build, not by convention.

## Headers and CSP

- **Every response** (Nitro `routeRules`, `STATIC_SECURITY_HEADERS` in `src/lib/csp.ts`):
  - `Strict-Transport-Security`;
  - `X-Content-Type-Options: nosniff`;
  - `Referrer-Policy: strict-origin-when-cross-origin`;
  - `Permissions-Policy` (camera, microphone, geolocation, payment, usb and topics off);
  - `X-Frame-Options: DENY`;
  - `Cross-Origin-Opener-Policy: same-origin`.
- **HTML pages in production** also get a Content-Security-Policy with a fresh nonce per request (`src/middleware/security-headers.ts`, 0081):
  - scripts only with the nonce, plus `'strict-dynamic'` for their own chunks;
  - no `eval`;
  - `connect-src` and `img-src` limited to the same origin plus Sentry, PostHog and Cloudinary when they're configured;
  - `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`.
- **Dev has no CSP,** because Vite and the devtools inject inline scripts. Check CSP on a production build.
- **Zod** probes `eval` when a schema is created, so the app imports `"zod"`, which resolves to `src/lib/zod.ts` (jitless). Never import `zod/v4` in app code (0086).

## Server functions and routes

- **Authorization on the server:** every protected function runs `requirePermission("<resource>:<action>")`, resolved from the database on every call; a test lists each one ([rbac.md](rbac.md)). Route guards and hidden buttons are conveniences, never the protection.
- **Input:** every function validates with its Zod schema before the handler runs (`validator(zodInput(schema))`).
- **Escalation:** users can't grant permissions they don't hold or lock out the last admin (`src/server/rbac/service.ts`, 0096).
- **CSRF:** server functions reject cross-site calls (Sec-Fetch-Site, then Origin, then Referer; `src/middleware/csrf.ts`).
- **Errors** never leak details: anything unexpected becomes `INTERNAL` with a request id ([routing-data.md](routing-data.md)).
- **Server-only code** can't reach the browser: import protection fails the build, and `env-boundary.test.ts` scans imports. Only `VITE_` variables are public.
- **Dev-only pages and functions** answer 404 in production (`/dev` layout, `devOnlyMiddleware`).

## Auth (Better Auth)

- **Sessions:** signed cookies (`BETTER_AUTH_SECRET`).
- **Email:** sign-up requires a verified email. An email change sends a notice to the old address.
- **Rate limits:** stored in the database (they hold across serverless instances) and keyed by a trusted client IP (`src/server/auth/client-ip.ts`). Sign-in is limited to 5 a minute. Behind a proxy other than Vercel, set its trusted header there.
- **Redirects:** the sign-in `?redirect=` target must be a same-site path (`src/lib/redirect.ts`).
- **Expired sessions:** any server function that answers UNAUTHORIZED in the browser sends the user to `/login?redirect=…` (`src/middleware/session-expiry.ts`, 0113). Client route guards read a session at most a minute old (0111); server functions always check it themselves.
- **Admin plugin endpoints are off:** `/api/auth/admin/*` answers 404 (`src/server/auth/disabled-paths.ts`, 0112), so nothing skips the RBAC rules in `src/server/rbac/service.ts`.
- **Session tokens stay on the server:** the account page lists sessions by id and revokes them with `revokeMySession` (0114).

## Content

- **Rich text:** sanitized on the server before storing and again before sending (`sanitizeRichText`). Pages render it only through `RichTextContent`, which accepts only the sanitizer's `SafeHtml` type.
- **Images:**
  - **Uploads:** they go to Cloudinary with a signature the server makes. The signature fixes where the file goes and which formats are allowed.
  - **Verification:** the server checks each asset's format and size through Cloudinary's Admin API before recording it.
  - **Linking:** only your own pending uploads can be linked to a record ([attachments.md](attachments.md)).
- **JSON-LD** is escaped (`<`, `>` and `&`), so content can't close the script tag.
- **Forms** handled in JavaScript use `method="post"`, so a submit before hydration never puts values (passwords) in the URL (0104).

## Secrets

- **Where:** `.env` holds real secrets and is gitignored. `.env.example` lists names only.
- **Validation:** the server validates its environment at boot and refuses to start with anything missing or malformed. Production also refuses the console email provider.
- **Cron endpoints** need `Authorization: Bearer $CRON_SECRET` (constant-time compare); without the variable they answer 404.
