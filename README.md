# Portfolio

A bilingual (English + Nepali), server-rendered portfolio app built on TanStack Start.

The full plan, phases and Definition of Done live in [docs/PLAN.md](docs/PLAN.md). Non-obvious choices are recorded in [docs/decisions.md](docs/decisions.md). This README is completed in Phase 12.

## Requirements

- Node.js 22 or newer
- pnpm 10 (`corepack enable` picks up the version pinned in `package.json`)
- On Windows, clone to a short path of about 90 characters or fewer, such as `C:\dev\portfolio`. pnpm's nested `node_modules/.pnpm` paths add about 170 characters. Past about 260 in total, Node misreads ES modules, and tests and builds fail with `ERR_REQUIRE_CYCLE_MODULE`.

## Getting started

```bash
pnpm install
cp .env.example .env   # then fill in real values
pnpm db:migrate
pnpm dev               # http://localhost:3000
```

`pnpm dev` and `pnpm start` validate the whole environment before serving. `pnpm build` validates only the public `VITE_` variables, because those are baked into the bundle. Each command stops with a message naming every missing or invalid variable. See [.env.example](.env.example) for the full list. Set `VITE_SITE_URL` to the public origin (for example `https://example.com`) in every deployed environment: canonical, hreflang and Open Graph URLs are built from it. Visit `/health` to confirm the database connection.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the Vite dev server with SSR. |
| `pnpm build` | Production build (client, SSR and Nitro server output in `.output/`). |
| `pnpm start` | Run the production build with Node, loading `.env` if present. |
| `pnpm typecheck` | TypeScript in strict mode, no emit. |
| `pnpm check` | Biome lint + format check. Warnings fail the run. |
| `pnpm check:fix` | Apply Biome fixes and formatting. |
| `pnpm test` | Run the Vitest suite once. |
| `pnpm test:watch` | Run Vitest in watch mode. |
| `pnpm db:generate` | Generate a SQL migration in `drizzle/` from schema changes. |
| `pnpm db:migrate` | Apply pending migrations (uses `DATABASE_URL_UNPOOLED` if set). |
| `pnpm db:push` | Push the schema straight to the database, for prototyping only. |
| `pnpm db:studio` | Open Drizzle Studio. |
| `pnpm storybook`, `pnpm build-storybook` | Stubs until Storybook is added in Phase 11. |

## Internationalisation (English + Nepali)

- Messages live in `messages/en.json` and `messages/ne.json`. Both files must have the same keys, and a test enforces it.
- Use them in code with `import { m } from "@/paraglide/messages"`, then `m.some_key()`. Paraglide compiles them into `src/paraglide/` (generated, gitignored) on `dev`, `build`, `test` and `typecheck`.
- English lives at `/`, Nepali under `/ne/`. Define each route once; the router maps `/ne/...` onto it.
- Format dates, numbers, NPR amounts and relative times with `src/lib/intl.ts`, never `Intl` directly. Browsers such as Chrome lack Nepali locale data, so raw `Intl` output differs between server and browser.
- Compiling messages downloads two inlang plugins from jsDelivr, so the first compile needs network access.

## Routing, data and server functions

- **Layout routes:** `_public` (public pages), `_auth` (login and register), `_authed` (signed-in users) and `_admin` (admins). The guards run in each layout's `beforeLoad`.
- **Data loading:** Loaders call `queryClient.ensureQueryData(...)`, and components read with `useSuspenseQuery`. SSR dehydration is handled by `@tanstack/react-router-ssr-query`. See `src/routes/_public/stack.tsx` for the full pattern: search params, loader, pending state and streaming.
- **Server functions:** Use `createServerFn().inputValidator(zodInput(schema))`. Throw `AppError(code)` for expected failures. Anything else reaches the client as `INTERNAL`, with details only in the server log.
- **Guarding server functions:** Add `.middleware([requireUserMiddleware])` or `.middleware([requireAdminMiddleware])` (`src/middleware/auth.ts`). Route guards alone never protect data.

## Forms

Build forms with `useAppForm` from `src/components/forms` and schemas from `src/lib/validation.ts`. The schema helpers return localized messages.

```tsx
const form = useAppForm({
	defaultValues: { name: "", price: undefined as number | undefined },
	validators: formValidators(z.object({ name: required(), price: currency() })),
	onSubmit: async ({ value }) => save(value),
});

<form.AppForm>
	<form.Form>
		<form.FormErrorSummary />
		<form.AppField name="name">{(field) => <field.TextField label={m.auth_name_label()} />}</form.AppField>
		<form.AppField name="price">{(field) => <field.CurrencyField label="…" />}</form.AppField>
		<form.SubmitButton>{m.account_save()}</form.SubmitButton>
	</form.Form>
</form.AppForm>
```

- **Fields:** `TextField`, `TextareaField`, `EmailField`, `PasswordField`, `NumberField`, `CurrencyField`, `SelectField`, `ComboboxField`, `MultiSelectField`, `RadioGroupField`, `CheckboxField`, `CheckboxGroupField`, `SwitchField`, `UrlField`, `PhoneField`, `OtpField`, `DateField`, `DateRangeField`, `TimeField`, `SliderField`, `TagsInputField`, `ColorField`, `FileField`, `ImageField`, `RichTextField`.
- **Showcase:** run `pnpm dev` and open `/dev/forms` (or `/ne/dev/forms`) to see and try every field. It returns 404 in production builds.
- **Accessibility:** Every field wires label, description, `aria-invalid` and `aria-describedby`.
- **When errors show:** Only after a field is left (blurred) or a submit is attempted.
- **Validation:** `formValidators(schema)` runs the schema on change, blur and submit.
- **Error summary:** `FormErrorSummary` lists every problem after a failed submit and takes focus. Each entry links to its field.
- **Numbers:** `NumberField` and `CurrencyField` accept Devanagari digits and thousands separators.
- **Stored values:** `PhoneField` stores E.164 (`+9779812345678`, Nepal by default). `DateField` stores `"YYYY-MM-DD"`, `DateRangeField` stores `{ from, to }` and `TimeField` stores `"HH:mm"`. `FileField` and `ImageField` store `File[]`. Validate them with `phone()`, `isoDate()`, `dateRange()`, `time()` and `files({ maxBytes, accept })`.
- **Rich text:** `RichTextField` (Tiptap) loads only in the browser, and the server renders a placeholder of the same size. Its HTML is untrusted. On the server, pass it through `sanitizeRichText()` (`src/server/rich-text/sanitize.ts`) before storing it and again before sending it to a page, then display it with `<RichTextContent html={safe} />`. That component only accepts the `SafeHtml` type the sanitizer returns.

## State: Query, DB and Store

Pick the tool by what the state is (full reasoning in `docs/decisions.md` 0064):

- **Server data you read:** TanStack Query, using `queryOptions` plus `ensureQueryData` in loaders. Example: `/stack`.
- **Server data you edit with instant feedback:** a TanStack DB query collection. It is backed by Query, so optimistic changes roll back on failure. Define the collection as in `src/lib/db.ts` and read it with `useLiveQuery`. Test CRUD (Task 11) is the first real collection. `tests/unit/db-collection.test.ts` shows the optimistic-update and rollback behaviour.
- **Client UI preferences:** the TanStack Store in `src/lib/stores`:
  - `useTheme()` gives light, dark or system.
  - `useSidebar()` controls the admin sidebar.
  - `useTablePreferences(id)` stores page size and hidden columns.
  - These are saved in cookies, so the server renders them on the first byte, with no theme flash and no hydration mismatch.
- **Form state:** TanStack Form. **URL state** (filters, page): Zod search params.

## Test CRUD: the template for new features

`/admin/test-crud` is the reference feature. To build a new one, copy its shape:

| Layer | File | What it shows |
| --- | --- | --- |
| Table | `src/server/db/schema/test-crud.ts` | Drizzle table. Then run `pnpm db:generate` and `pnpm db:migrate`. |
| Shared schema | `src/features/test-crud/schema.ts` | One Zod schema for the form and the server, plus list search params and DTOs |
| Data access | `src/server/test-crud/repository.ts` | Plain functions over an injected `db`, tested on PGlite (`tests/server/test-crud-repository.test.ts`) |
| Server functions | `src/functions/test-crud.ts` | `requireAdminMiddleware` on every function, `.validator()` input, and FormData for file uploads |
| Queries + DB | `src/features/test-crud/queries.ts`, `collection.ts` | Loader `ensureQueryData` for SSR, and a TanStack DB collection for optimistic changes with rollback |
| UI | `src/routes/_admin/admin/test-crud/*`, `src/features/test-crud/components/*` | URL-driven table, forms built only from the reusable fields, confirmation dialogs, toasts and the unsaved-changes guard |
| Public pages | `src/routes/_public/test-crud/*`, `src/functions/test-crud-public.ts` | SSR card grid and detail page that work without JavaScript, published items only, localized 404 for drafts, and `seo()` head tags |

Images are stored in Postgres and served from `/api/images/:id` (see decision 0067).

For a public page's head, use `seo({ title, description, path, image })` from `src/lib/seo.ts`. It returns the title, description, canonical URL, `hreflang` alternates for every locale plus `x-default`, and Open Graph and Twitter tags.

## Observability: Sentry and PostHog

Both are optional. If their variables are unset they are off completely: nothing is initialised or downloaded, no consent banner is shown, and no network calls are made.

- **Sentry** (`VITE_SENTRY_DSN`): errors and traces in the browser (`src/instrument.client.ts`) and on the server (`src/instrument.server.ts`).
  - Unexpected server-function errors are reported once, with the original stack and the `requestId` the user sees.
  - Expected `AppError`s (4xx) are not reported.
  - Only the user id is attached: no email, and the IP address is stripped.
  - Source maps are uploaded on `pnpm build` when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT` are all set.
- **PostHog** (`VITE_POSTHOG_KEY`, optional `VITE_POSTHOG_HOST`): opt-in only. A consent banner (with a footer link to change the choice later) stores the choice in a cookie.
  - Before consent `posthog-js` isn't loaded and the server sends no events.
  - After consent: pageviews on navigation, `identify` on login, `reset` on logout, and the Test CRUD events `test_crud_created`, `test_crud_updated` and `test_crud_deleted` (server) and `test_crud_viewed` (browser).
- **Feature flags** are evaluated on the server (`src/functions/feature-flags.ts`) and SSR'd through the Query cache, so server and client render the same thing.
  - Example: create a boolean flag `home-items-cta` in PostHog to show a call to action on the home page.
  - Before consent, flags are evaluated with a shared anonymous id and never record `$feature_flag_called`.

## Authentication

Better Auth (`src/server/auth/auth.ts`) provides:
- email and password sign-up with required email verification;
- email-code (OTP) sign-in;
- password reset;
- email change, with a security notice to the old address;
- password change and session management;
- optional Google sign-in, which appears only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set;
- `user` and `admin` roles.

```bash
pnpm db:migrate                       # creates the auth tables
pnpm db:seed-admin --email you@example.com --password "at-least-12-chars" --name "You"
```

- **Seeding an admin:** `db:seed-admin` also reads `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` from `.env`. Add `--force` if other users already exist.
- **Protecting data:** Use `.middleware([requireUserMiddleware])` or `.middleware([requireAdminMiddleware])` on server functions. The `_authed` and `_admin` layouts guard navigation, and `_admin` re-checks the role on the server on every visit.
- **Rate limits:** They are stored in the database and keyed by a trusted client IP (`src/server/auth/client-ip.ts`). Behind a reverse proxy other than Vercel, set that proxy's trusted header there.
- **Schema changes:** After changing auth plugins, regenerate the schema with `pnpm auth:schema`, then run `pnpm db:generate` and `pnpm db:migrate`.

## Email

- **Sending:** Call `sendEmail({ to, template, data, locale })` from server code (`src/server/email/send.ts`). Pass the recipient's language, not the current page's.
- **Templates:** They live in `src/server/email/templates/` and are registered in `index.ts` with a subject and sample data.
- **Preview:** In development, open `/dev/emails` to see every template in English and Nepali, as HTML and plain text. The preview only exists on the dev server.
- **Delivery in development:** Emails are printed to the terminal (console provider) unless `RESEND_API_KEY` is set.
- **Production:** Resend is required. A production server refuses to start with the console provider or without `RESEND_API_KEY`. To smoke-test a production build locally, set `RESEND_API_KEY` (and clear `EMAIL_PROVIDER`) for that run.

## Adding shadcn/ui components

```bash
pnpm dlx shadcn@latest add <component>
```

The shadcn CLI (4.21.0) currently writes `import { cn } from "cn"`. Replace it with `import { cn } from "@/lib/utils"` after adding a component. `pnpm typecheck` fails until you do.
