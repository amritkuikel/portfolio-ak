# Conventions: file structure and building blocks

How code is organised and which shared pieces a page is built from. When a pattern shows up twice, it becomes a shared component or helper here. Feature code then only supplies what is specific to the feature.

## Where code lives

```
src/
  routes/                 File routes (TanStack Router). Thin: loader, head, staticData, and a page that composes components.
    _public/ _auth/ _authed/ _admin/   Layouts by audience. A folder's route.tsx is a section layout (names its breadcrumb).
  components/             Generic UI, no feature knowledge.
    ui/                   shadcn primitives (Button, Table, Dialog…). Generated; adjust sparingly.
    page/                 Page, PageHeader, Breadcrumbs, EmptyState, PageHeaderSkeleton, ListSkeleton
    data-table/           DataTable, DataTableColumnsMenu, DataTableSkeleton
    navigation/           Pagination, SearchLink, useCloseOverlay (masked dialogs)
    filters/              FilterBar + Search/Select/MultiSelect/Boolean/NumberRange/DateRange filters, ActiveFilters chips
    dialogs/              ConfirmDialog
    forms/                useAppForm + the field library (see the forms showcase at /dev/forms)
    layout/               Site header/footer, admin sidebar, theme, consent banner
    errors/               Error, not-found and pending pages
  features/rbac/          Permission catalog + labels, useCan/<Can>/assertRoutePermission, users and roles UI
  features/admin/         Admin sections (sidebar + dashboard, each with its permission)
  features/dev/examples/  The /dev/examples pages' registry, page frame, schema and in-memory data (development only)
  features/<name>/        Everything specific to one feature, shared by client and server:
    search.ts             The URL contract: search and path param schemas, list input (src/lib/list/params.ts). Route files import this
    schema.ts             Zod input schemas and DTO types (src/lib/validation.ts); never imported by route options (0151)
    constants.ts labels.ts  Enum values and their localized labels
    queries.ts            Query keys + queryOptions
    collection.ts         TanStack DB collection (optimistic list edits)
    filters.tsx           The list's filter controls + chips (features/test-crud/filters.tsx)
    components/           Feature components: columns (admin-columns.tsx), form, cards, masked links, dialogs
  functions/<name>.ts     Server functions: middleware + validator + a one-line call into src/server
  server/                 SERVER-ONLY (import protection + tests enforce it)
    db/                   client, schema/, types.ts (Db, Tx), list.ts (SQL list helpers)
    <name>/               repository.ts (Drizzle over an injected Db) and service.ts (logic, I/O)
  middleware/             Start middleware (security headers, CSRF, auth, logging, errors)
  hooks/                  React hooks: useListPage, useListQuery
  lib/                    Isomorphic helpers, grouped by area (0158):
    list/                 params.ts (URL params), paging.ts (Paged, page maths), url.ts (search serialization)
    env/ i18n/ http/      client env schema; intl, Nepali digits, calendar days; CSP, cache-control, redirects
    observability/        Sentry (sentry-client.ts in the browser), PostHog, Web Vitals, log lines
    start/                Needs the Start runtime: routes and server code only, never components (Biome enforces it)
    *.ts                  query (loadList, ensureQuery), seo, breadcrumbs, validation, phone, errors, tanstack-db, zod, utils
```

**Naming:** files are kebab-case and components PascalCase. Server-only modules live under `src/server/` or are named `*.server.ts`. Stories sit next to their component as `*.stories.tsx`. Tests live in `tests/`:
- `unit/` for pure logic
- `server/` for code that touches the database or server, on PGlite
- `components/` for jsdom tests
- `i18n/` for the message checks

## Building a list page

A list page is assembled from the shared pieces. The feature supplies its columns, filters and actions. See `src/routes/_admin/admin/test-crud/index.tsx`.

```tsx
// features/<name>/schema.ts: the URL is the source of truth, and the same schema is the server function's input.
export const projectSearchSchema = z.object({
	q: searchParam(),
	status: enumParam(PROJECT_STATUS_FILTERS, "all"),
	sort: enumParam(PROJECT_SORTS, "-updated"),   // "field" ascending, "-field" descending
	page: pageParam(),
	pageSize: pageSizeParam(),                     // optional: falls back to the saved table preference
});
export type ProjectPage = Paged<ProjectListItem>;

// features/<name>/components/admin-columns.tsx
export const projectColumns: ReadonlyArray<DataTableColumn<ProjectListItem>> = [
	{ id: "title", header: m.project_col_title, sort: "title", cell: (row) => <Link …>{row.title}</Link> },
	{ id: "updated", header: m.project_col_updated, sort: "updated", hideable: true, cell: (row) => formatDateTime(row.updatedAt) },
];

// routes/_admin/admin/projects/index.tsx
// loader: loadList(context.queryClient, projectListQueryOptions(tableListInput(deps, context.preferences.state, PROJECT_TABLE_ID)), cause)
const { page, busy, pagination } = useListPage({ tableId: PROJECT_TABLE_ID, search, query: projectListQueryOptions });

<Page width="admin">
	<PageHeader title={m.projects_title()} description={…} actions={<NewProjectButton />} />
	<FilterBar values={search} preserve={["sort", "pageSize"]}>{/* filter controls */}</FilterBar>
	<ActiveFilters chips={projectFilterChips(search)} clearAll={CLEAR_FILTERS} />
	<DataTableColumnsMenu tableId={PROJECT_TABLE_ID} columns={projectColumns} />
	<DataTable
		tableId={PROJECT_TABLE_ID} rows={rows} columns={projectColumns}
		getRowId={(row) => row.id} getRowLabel={(row) => row.title} sort={search.sort}
		bulkActions={({ ids, clear }) => …} rowActions={(row) => <DropdownMenuItem …/>}
		busy={busy}
		empty={<EmptyState description={…} action={filtered ? <ClearFiltersButton clearAll={CLEAR_FILTERS} /> : <NewProjectButton />} />}
	/>
	<Pagination {...pagination} />   {/* render both only once `page` and `pagination` exist; DataTableSkeleton before */}
	<ConfirmDialog open={…} destructive title={…} description={…} onConfirm={…} onCancel={…} />
</Page>
```

On the server, the repository uses the same contract:

```ts
// server/<name>/repository.ts
const SORT_COLUMNS = { title: projects.title, updated: projects.updatedAt };
export async function listProjects(db: Db, input: ProjectListInput): Promise<ProjectPage> {
	const where = allOf(
		input.status === "all" ? undefined : eq(projects.status, input.status),
		textSearch(input.q, [projects.title, projects.summary]),
	);
	const order = orderBySort(input.sort, SORT_COLUMNS, { tiebreaker: projects.id, fallback: "updated" });
	return paginate(input, {
		count: () => countRows(db, projects, where),
		rows: ({ limit, offset }) => db.select().from(projects).where(where).orderBy(...order).limit(limit).offset(offset),
	}, toListItem);
}
```

Filters, the loader (`loadList` + `useListQuery`) and record dialogs (route masking) are covered step by step in [search-filters-masking.md](search-filters-masking.md).

Public lists use `<Page width="wide">`, `<PageHeader size="display" breadcrumbsJsonLd>`, a card grid, `<EmptyState>` and `<Pagination layout="center" hideWhenSingle />`. Pending states use `PageHeaderSkeleton` with `ListSkeleton` or `DataTableSkeleton`, matching the page's footprint.

## Breadcrumbs

Declare them on routes, never in pages:

```ts
// routes/_admin/admin/projects/route.tsx: a section layout (no component; renders its child)
export const Route = createFileRoute("/_admin/admin/projects")({
	staticData: { breadcrumb: staticCrumb(m.projects_title) },
});
// a detail route: the loader returns { title }, and the crumb reads it
staticData: { breadcrumb: loaderTitleCrumb },
loader: async (…) => { const item = await ensureQuery(queryClient, …); return { title: item.title }; },
```

`<PageHeader>` renders the trail. Pass `breadcrumbsJsonLd` on indexable public pages. A detail page without a `PageHeader` renders `<Breadcrumbs jsonLd />` itself.

## Rules

- **Everything renders on the server.** Loaders `await ensureQuery(queryClient, …)` (`src/lib/query.ts`) and components read the data with `useSuspenseQuery`. Never fetch first-paint data in an effect.
- **Lists keep their results while a new search loads:** `loadList` in the loader, `useListQuery` in the page (never a pending screen for a filter change).
- **The URL is the state** for search, filters, sort and page. Change it with `<SearchLink patch>`, `<Link search>` or `navigate({ search })`, never with local state. Defaults are stripped with `stripSearchParams`.
- **Read messages at render time.** Never put `m.foo()` (or JSX containing it) in a module-level constant. On the server it would freeze the first request's locale. Use a component or a function, or pass the message function itself (`header: m.foo`).
- **Return little from loaders.** Data already travels in the Query cache; return only what `head` or `staticData` need.
- **Server functions are thin.** Middleware (auth), `.validator(zodInput(schema))`, one call. Logic goes in `src/server/<name>/` over an injected `Db`, so it can be tested on PGlite.
- **Edits carry their version.** An update sends the record's `updatedAt` (`versionSchema()`), the repository checks it with `sameVersion` and throws `staleError()`, and the form shows `StaleVersionAlert` ([forms.md](forms.md), 0122). Whole-record edits only: single-field toggles and deletes don't need it.
- **Import Zod as `zod`.** It resolves to `src/lib/zod.ts` (jitless, CSP-safe). Never import `zod/v4` directly in app code.
- **Every string goes through Paraglide** in en and ne. Delete keys when their UI goes away; `tests/i18n/message-usage.test.ts` enforces it.
- **No layout shift:** fixed image aspect boxes, skeletons with the page's footprint, and preferences read from cookies on the server.
- **Every page has one `<main>` that is the skip link's target.** Use `Page` (it spreads `MAIN_CONTENT`), or spread `MAIN_CONTENT` from `components/layout/skip-link.tsx` on a hand-written `<main>`. The browser review fails a page whose first tab stop isn't a skip link to a `<main>` (0137).
- **Motion respects the user.** `app.css` finishes every animation and transition at once under `prefers-reduced-motion: reduce`; don't add motion that only works with `!important` of its own (0137).
- **Let the React Compiler memoize** (0136). Don't add `useMemo`/`useCallback`/`memo` for performance; keep `useMemo` only where identity is the point (creating a collection, a resource). A component the compiler skips (see the decision for how to list them) is still correct, just not memoized.

## Live examples

Run `pnpm dev` and open `/dev/examples` (or `/ne/dev/examples`): one small, real page per module, each naming its source and guide. They answer 404 in production builds. The patterns from this guide:

| Pattern | Page | Source |
| --- | --- | --- |
| Loader + Query (SSR, no refetch while hydrating) | `/dev/examples/loader-query` | `src/routes/dev/examples/loader-query.tsx` |
| Streaming a slow part with `Await` | `/dev/examples/streaming` | `src/routes/dev/examples/streaming.tsx` |
| Forms: client validation; server field errors | `/dev/examples/forms` | `src/routes/dev/examples/forms.tsx` |
| DataTable with columns, sorting, bulk and row actions | `/dev/examples/data-table` | `src/routes/dev/examples/data-table.tsx` |
| TanStack DB optimistic update and rollback | `/dev/examples/optimistic` | `src/routes/dev/examples/optimistic.tsx` |
| Store preferences (cookies, SSR) | `/dev/examples/preferences` | `src/routes/dev/examples/preferences.tsx` |
| i18n messages and Intl formatting | `/dev/examples/i18n` | `src/routes/dev/examples/i18n.tsx` |
| Errors, not found and HTTP status | `/dev/examples/errors` | `src/routes/dev/examples/errors.tsx` |
| Recipe: admin command palette with view transitions | `/dev/examples/command-palette` | `src/routes/dev/examples/command-palette.tsx` |

The others are linked from their guides: filters and masking ([search-filters-masking.md](search-filters-masking.md)), permissions ([rbac.md](rbac.md)), attachments ([attachments.md](attachments.md)), SEO ([seo.md](seo.md)), analytics and flags ([observability.md](observability.md)). Tables and filters in depth: [tables-filters.md](tables-filters.md); forms: [forms.md](forms.md); state: [state.md](state.md); i18n: [i18n.md](i18n.md).

## Generating a feature

`pnpm new:feature <name>` (decision 0141) writes the admin half of the Test CRUD shape from `scripts/templates/feature/` and adds the entries shared lists need at their `// @new-feature:<slot>` lines. The generated routes are thin (`index.tsx` loads the list and renders `<Name>AdminList` from `features/<name>/components/admin-list.tsx`), like Test CRUD's own (`TestCrudAdminList`, `AccountPage`). Change the templates when a convention changes, so new features follow it. Full checklist: [new-project.md](new-project.md).

## Import boundaries

Biome fails `pnpm check` on imports that would break at runtime (0158):

- `zod/v4` or `zod/mini` anywhere: import `"zod"`, which resolves to `src/lib/zod.ts` (0086).
- `@/server/**` or `@/lib/start/**` from `src/components/**`, `src/features/**/components/**` or `src/hooks/**`: components run in the browser and in Storybook. Call a server function, or move the Start-runtime code into a route.

When moving files, update imports with your editor's "move file" refactor (TypeScript follows the `@/` alias), keep `src/lib/zod.ts` where it is (the Zod alias in `vite/zod-alias.ts` points at it) and update `knip.json` entries that name a moved file.

## Recipe: command palette and view transitions

`/dev/examples/command-palette` (decision 0140) is a `cmdk` palette (`components/ui/command.tsx`) opened with Ctrl/⌘ K:

- **Permission-filtered:** it lists `ADMIN_SECTIONS` the user holds the permission for, like the sidebar. It only hides; routes and server functions check on their own.
- **To ship it:** move `AdminCommandPalette` into `src/components/layout/` and render it in `AdminLayout` with its own `open` state. Add other commands as more `CommandGroup`s (each item's `onSelect` navigates or calls a mutation).
- **View transitions:** `navigate({ to, viewTransition: true })` (or `<Link viewTransition>`) cross-fades the old and new page where the browser supports it. For every navigation, set `defaultViewTransition: true` in `src/router.tsx`. Name elements with `view-transition-name` to animate them between pages (the portfolio does, 0109). Reduced motion removes the animation (`app.css`).

**Adding an example:** a route under `src/routes/dev/examples/` built with `ExamplePage` and `Demo`, an entry in `features/dev/examples/registry.ts` (a test checks the two match), `privateHead()` and a breadcrumb, server functions with `devOnlyMiddleware`, and a link from the guide.

## Pitfalls already solved

Moved here from CLAUDE.md, which keeps only the ones that apply everywhere. Don't reintroduce them.

- **shadcn's `from "cn"` import:** the CLI writes it; fix it to `@/lib/utils`. Never install the `cn` package (an unrelated library) to silence typecheck (0118).
- **One header per section:** the root renders no header; each layout renders its own (`<SiteHeader links={…} />`, or the portfolio's), so a new layout must too (0161, which replaced 0105's `chrome: "bare"` opt-out). Don't hide headers with CSS or path checks.
