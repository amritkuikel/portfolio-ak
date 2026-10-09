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
    navigation/           Pagination, SearchLink
    dialogs/              ConfirmDialog
    forms/                useAppForm + the field library (see the forms showcase at /dev/forms)
    layout/               Site header/footer, admin sidebar, theme, consent banner
    errors/               Error, not-found and pending pages
  features/<name>/        Everything specific to one feature, shared by client and server:
    schema.ts             Zod input + URL search schemas, DTO types (built from src/lib/list.ts and src/lib/validation.ts)
    constants.ts labels.ts  Enum values and their localized labels
    queries.ts            Query keys + queryOptions
    collection.ts         TanStack DB collection (optimistic list edits)
    components/           Feature components: columns (admin-columns.tsx), form, cards
  functions/<name>.ts     Server functions: middleware + validator + a one-line call into src/server
  server/                 SERVER-ONLY (import protection + tests enforce it)
    db/                   client, schema/, types.ts (Db, Tx), list.ts (SQL list helpers)
    <name>/               repository.ts (Drizzle over an injected Db) and service.ts (logic, I/O)
  middleware/             Start middleware (security headers, CSRF, auth, logging, errors)
  lib/                    Isomorphic helpers: list contract, breadcrumbs, seo, intl, validation, errors, stores, zod
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
<Page width="admin">
	<PageHeader title={m.projects_title()} description={…} actions={<NewProjectButton />} />
	{/* filters (Task 19: FilterBar) */}
	<DataTableColumnsMenu tableId={PROJECT_TABLE_ID} columns={projectColumns} />
	<DataTable
		tableId={PROJECT_TABLE_ID} rows={rows} columns={projectColumns}
		getRowId={(row) => row.id} getRowLabel={(row) => row.title} sort={search.sort}
		bulkActions={({ ids, clear }) => …} rowActions={(row) => <DropdownMenuItem …/>}
		empty={<EmptyState description={…} action={…} />}
	/>
	<Pagination page={page.page} pageCount={page.pageCount} total={page.total} pageSize={…} />
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
loader: async (…) => { const item = await queryClient.ensureQueryData(…); return { title: item.title }; },
```

`<PageHeader>` renders the trail. Pass `breadcrumbsJsonLd` on indexable public pages. A detail page without a `PageHeader` renders `<Breadcrumbs jsonLd />` itself.

## Rules

- **Everything renders on the server.** Loaders `await queryClient.ensureQueryData(...)` and components read the data with `useSuspenseQuery`. Never fetch first-paint data in an effect.
- **The URL is the state** for search, filters, sort and page. Change it with `<SearchLink patch>`, `<Link search>` or `navigate({ search })`, never with local state. Defaults are stripped with `stripSearchParams`.
- **Read messages at render time.** Never put `m.foo()` (or JSX containing it) in a module-level constant. On the server it would freeze the first request's locale. Use a component or a function, or pass the message function itself (`header: m.foo`).
- **Return little from loaders.** Data already travels in the Query cache; return only what `head` or `staticData` need.
- **Server functions are thin.** Middleware (auth), `.validator(zodInput(schema))`, one call. Logic goes in `src/server/<name>/` over an injected `Db`, so it can be tested on PGlite.
- **Import Zod as `zod`.** It resolves to `src/lib/zod.ts` (jitless, CSP-safe). Never import `zod/v4` directly in app code.
- **Every string goes through Paraglide** in en and ne. Delete keys when their UI goes away; `tests/i18n/message-usage.test.ts` enforces it.
- **No layout shift:** fixed image aspect boxes, skeletons with the page's footprint, and preferences read from cookies on the server.
