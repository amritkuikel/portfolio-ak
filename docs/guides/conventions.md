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
    schema.ts             Zod input + URL search schemas, DTO types (built from src/lib/list.ts and src/lib/validation.ts)
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
  lib/                    Isomorphic helpers: list contract (list.ts), filter params + URL serialization (search.ts),
                          loadList/useListQuery, breadcrumbs, seo, intl, date-only, validation, errors, stores, zod
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
- **Import Zod as `zod`.** It resolves to `src/lib/zod.ts` (jitless, CSP-safe). Never import `zod/v4` directly in app code.
- **Every string goes through Paraglide** in en and ne. Delete keys when their UI goes away; `tests/i18n/message-usage.test.ts` enforces it.
- **No layout shift:** fixed image aspect boxes, skeletons with the page's footprint, and preferences read from cookies on the server.

## Live examples

Run `pnpm dev` and open `/dev/examples` (or `/ne/dev/examples`): one small, real page per module, each naming its source and guide. They answer 404 in production builds. The patterns from this guide:

| Pattern | Page | Source |
| --- | --- | --- |
| Loader + Query (SSR, no refetch while hydrating) | `/dev/examples/loader-query` | `src/routes/_public/dev/examples/loader-query.tsx` |
| Streaming a slow part with `Await` | `/dev/examples/streaming` | `src/routes/_public/dev/examples/streaming.tsx` |
| Forms: client validation; server field errors | `/dev/examples/forms` | `src/routes/_public/dev/examples/forms.tsx` |
| DataTable with columns, sorting, bulk and row actions | `/dev/examples/data-table` | `src/routes/_public/dev/examples/data-table.tsx` |
| TanStack DB optimistic update and rollback | `/dev/examples/optimistic` | `src/routes/_public/dev/examples/optimistic.tsx` |
| Store preferences (cookies, SSR) | `/dev/examples/preferences` | `src/routes/_public/dev/examples/preferences.tsx` |
| i18n messages and Intl formatting | `/dev/examples/i18n` | `src/routes/_public/dev/examples/i18n.tsx` |
| Errors, not found and HTTP status | `/dev/examples/errors` | `src/routes/_public/dev/examples/errors.tsx` |

The others are linked from their guides: filters and masking ([search-filters-masking.md](search-filters-masking.md)), permissions ([rbac.md](rbac.md)), attachments ([attachments.md](attachments.md)), SEO ([seo.md](seo.md)), analytics and flags ([observability.md](observability.md)). Tables and filters in depth: [tables-filters.md](tables-filters.md); forms: [forms.md](forms.md); state: [state.md](state.md); i18n: [i18n.md](i18n.md).

**Adding an example:** a route under `src/routes/_public/dev/examples/` built with `ExamplePage` and `Demo`, an entry in `features/dev/examples/registry.ts` (a test checks the two match), `privateHead()` and a breadcrumb, server functions with `devOnlyMiddleware`, and a link from the guide.
