# The showcase apps

Small, complete apps under `/apps/<slug>` that visitors try without an account (decisions 0185–0189). Kanban is the first and the reference; Notes, Links, Expenses, Habits and Forms follow it (PLAN.md, Tasks 42–44). The whole folder is the `apps` layer of `pnpm strip-demo`; guest sessions stay with the core.

## How a visit goes

1. `/apps` lists the apps; `/apps/kanban` is Kanban's landing: what it does, **Try it now** and **Sign in**. Both pages are indexable and in the sitemap.
2. **Try it now** calls `authClient.signIn.anonymous()`. Better Auth creates a guest (a user row with `is_anonymous`, the name "Guest", a `…@anonymous.placeholder.invalid` address) and a session; an after hook gives the guest every app's sample rows in the page's language and the signed `guest_claim` cookie (0186). The landing re-renders as the app.
3. A banner on every app page says the guest's data is deleted after 7 days and links to sign-up. Account pages send a guest to `/upgrade`.
4. Signing up (and verifying) or signing in moves the guest's rows to the account: the anonymous plugin's `onLinkAccount` when the browser still holds the guest's session, otherwise `claimGuestData` with the cookie (after a two-factor sign-in, or on the verify-email landing). Both are one transaction, and idempotent.
5. Guests nobody claimed are deleted by `GET /api/cron/guests` (daily), with their rows (foreign keys cascade) and uploads (through the attachments service).

## What a guest can't do (0185)

Nothing in the admin area (no permissions, not even the baseline role's), no account change (Better Auth `GUEST_REFUSED_PATHS`, `requireUserMiddleware`), no email (`sendEmail` refuses `.invalid` addresses), no analytics identity, and nothing public: an app checks `context.user.isGuest` before publishing a short link, a form or a shared note. Guests are left out of `/admin/users`, the role counts and the dashboard.

## The shape of an app

| Piece | Where | Kanban |
| --- | --- | --- |
| Client registry entry | `src/features/apps/registry.ts` (`APP_SLUGS`, `APPS`) | name, tagline, description, icon, usage labels |
| Server registry entry | `src/server/apps/registry.ts` (`APP_SERVERS`) | `seedGuestData`, `claim`, `usage` |
| Tables | `src/server/db/schema/apps/<app>.ts`, exported from the schema index with `// @apps` | `kanban_board`, `kanban_column`, `kanban_card` |
| Feature code | `src/features/apps/<app>/` | `types.ts`, `schema.ts`, `search.ts`, `queries.ts`, `collections.ts`, `moves.ts`, `components/` |
| Repository and service | `src/server/apps/<app>/` | every query takes the owner (`ownedBy`); quotas in the service |
| Server functions | `src/functions/apps/<app>.ts` | `.middleware([requireAppUser, withAppServices])`, then one service call |
| Routes | `src/routes/_apps/apps/<app>/` | `index.tsx` (landing or boards), `$boardId.tsx` (private) |
| Admin usage | `usage(db)` on the server entry | accounts and guests with boards, boards and cards |

**Ownership (0187):** every table has `owner_id text not null references user(id) on delete cascade`. A repository function takes the owner and adds `ownedBy(table, ownerId)` to every query, so someone else's row is simply not found. There is no permission on app functions; the guard test checks that every function in `src/functions/apps/` runs `requireAppUser` then `withAppServices`.

**Not audited:** app rows are their users' own data, not admin actions (0186).

## Adding an app

1. Add the slug to `APP_SLUGS` and an entry to `APPS` (messages in both languages), and an entry to `APP_SERVERS` with its `seedGuestData`, `claim` (one `update … set owner_id = to where owner_id = from` per table, children first) and `usage`.
2. Tables in `src/server/db/schema/apps/<app>.ts` with `owner_id` as above; export them from the schema index with a `// @apps` line; `pnpm db:generate`.
3. Repository and service in `src/server/apps/<app>/`, tested on PGlite: ownership isolation first (user A can't read or change user B's rows), then quotas, the seed and the claim.
4. Functions in `src/functions/apps/<app>.ts` and their names in the guard test's `APP_FUNCTIONS`.
5. Routes under `src/routes/_apps/apps/<app>/`: the landing at `index.tsx` with `seo()` (add it to `INDEXABLE` in `tests/unit/route-seo.test.ts`), inner pages private; every route in `e2e/support/pages.ts`. The sitemap and the gallery pick the app up from the registry.
6. Add the new paths to the `apps` layer in `scripts/strip-demo.ts`.
7. A flow in `e2e/flows/` that a guest can use it and keeps it on sign-up.

## TanStack DB in the apps (0189)

The `_apps` layout mounts `<DbScope>`, so DB is available to every app page and to no other page. A loader fills the Query cache (`ensureQuery`); the collections read that query (`select`); the page uses `useLiveSuspenseQuery`, which renders on the server and hydrates from the same cache. Handlers save, then `await collection.utils.refetch()` and return `{ refetch: false }`. See [state.md](state.md).

## Kanban (0188)

- Positions are fractional order keys (`src/lib/fractional-index.ts`): a move writes one row. They compare by code unit (`collate "C"` in SQL).
- The board (`components/board.tsx`) only reports moves; the page applies them to the collections. Moves come from dnd-kit (pointer, or Space/arrows/Space) or Alt + arrows on a handle, all computed by `moves.ts` and announced.
- Quotas: 20 boards, 500 cards per user, 12 columns per board.

## Turning guest sessions off

Remove `anonymous(…)` from `src/server/auth/auth.ts` and `anonymousClient()` from `src/lib/auth-client.ts`, and the "Try it" buttons. The guards can stay: they never match without guests.

## Pitfalls already solved

- **A scroll region needs `relative`:** an `sr-only` label inside a sideways-scrolling board is absolutely positioned and escapes the region, widening the page on phones (the review's overflow check). The board's region is `relative`.
- **Route files never import a collection module:** a loader's import is in every page's JavaScript (0151), and a collection brings TanStack DB with it. Constants a loader needs live in `queries.ts`.
- **Handlers refetch explicitly:** a query collection's automatic refetch after a handler logs a deprecation warning, which fails the browser review.
- **A two-factor sign-in loses the guest's session:** the password step clears the session cookie before the anonymous plugin's hook runs; the `guest_claim` cookie and `claimGuestData` after sign-in are what keep the data.
