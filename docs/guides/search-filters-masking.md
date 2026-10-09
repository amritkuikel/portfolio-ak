# Search params, filters and route masking

How list pages keep their state in the URL, how to add filters, and how to open
a record in a dialog without leaving the list. Reference implementation:
`src/routes/_admin/admin/test-crud/index.tsx` (all filter types plus the edit
dialog) and `src/routes/_public/test-crud/index.tsx` (search plus quick view).
Decisions 0084 and 0088–0093 explain the choices.

## The URL is the state

A filter URL looks the same whether JavaScript built it or a plain form submitted it:

```
/admin/test-crud?status=draft&tags=food&tags=nepal&priceMin=100&from=2026-01-01&hasImage=true&sort=title
```

| Param kind | Helper | URL | Parsed |
| --- | --- | --- | --- |
| free text | `searchParam()` (list.ts) | `q=momo` | `"momo"` (default `""`) |
| one of a list | `enumParam(values, fallback)` | `status=draft` | `"draft"` |
| page / page size | `pageParam()`, `pageSizeParam()` | `page=2` | `2` |
| several values | `arrayParam(itemSchema, { max })` | `tags=a&tags=b` | `["a", "b"]` (default `[]`) |
| number (range ends) | `numberParam({ min, max })` | `priceMin=100` | `100` or `undefined` |
| calendar date | `dateParam()` | `from=2026-01-01` | `"2026-01-01"` or `undefined` |
| yes / no / any | `booleanParam()` | `hasImage=true` | `true`, `false` or `undefined` |

Every helper is forgiving: an empty form field means "not set", and a bad value
is dropped (`.catch`) rather than failing the page. Arrays are written as repeated
keys by the router's `stringifySearch` (`src/lib/search.ts`, wired in
`src/router.tsx`).

## Adding a filtered list

1. **Schema** (`features/<name>/schema.ts`):

   ```ts
   export const SEARCH_DEFAULTS = { q: "", status: "all", tags: [] as string[], sort: "-updated", page: 1 } as const;
   export const projectSearchSchema = z.object({
   	q: searchParam(),
   	status: enumParam(STATUS_FILTERS, "all"),
   	tags: arrayParam(z.string().max(32), { max: 10 }),
   	budgetMin: numberParam(), budgetMax: numberParam(),
   	from: dateParam(), to: dateParam(),
   	sort: enumParam(SORTS, "-updated"), page: pageParam(), pageSize: pageSizeParam(),
   });
   export const projectListInputSchema = projectSearchSchema.extend({ pageSize: resolvedPageSize() }); // server input
   export const FILTER_KEYS = ["q", "status", "tags", "budgetMin", "budgetMax", "from", "to"] as const; // "Clear all"
   ```

2. **Repository:** turn each param into SQL with the helpers in `src/server/db/list.ts`:

   ```ts
   const where = allOf(
   	input.status === "all" ? undefined : eq(projects.status, input.status),
   	textSearch(input.q, [projects.title]),
   	overlapsAny(projects.tags, input.tags),          // any of (&&); add a GIN index
   	numberRange(projects.budget, input.budgetMin, input.budgetMax),
   	dateRange(projects.startedAt, input.from, input.to), // Nepal calendar days
   );
   ```

   Test every filter on PGlite, as in `tests/server/test-crud-repository.test.ts` ("listTestCrud filters").

3. **Route:**

   ```ts
   validateSearch: projectSearchSchema,
   search: { middlewares: [stripSearchParams(SEARCH_DEFAULTS)] },  // defaults never appear in URLs
   loaderDeps: ({ search: { edit: _edit, ...list } }) => list,    // dialog params don't reload the list
   loader: ({ context, deps, cause }) => loadList(context.queryClient, projectListQueryOptions(deps), cause),
   ```

   In the component: `const { data, busy } = useListQuery(projectListQueryOptions(search))`, then pass `busy` to `<DataTable busy>` (or `aria-busy` on a grid).

4. **Filters UI:** put the controls in `<FilterBar values={search} preserve={["sort", "pageSize"]}>` (see `features/test-crud/filters.tsx`). Build the chips with `chipLabel`/`rangeValue` and render them with `<ActiveFilters chips={…} clearAll={…}>`. Labels are messages, called at render time.

**What you get without extra work:**
- server rendering;
- shareable URLs;
- Back/Forward through filter states;
- debounced typing that keeps focus;
- no pending screen while results load (the old rows dim);
- a working form and chips without JavaScript.

## Route masking: a record in a dialog over its list

The list's URL gets a param (`?edit=<id>`), while the address bar shows the record's own page (`/admin/test-crud/<id>`).

```tsx
// a link (see features/test-crud/components/masked-links.tsx)
<Link
	from="/admin/test-crud/" to="."
	search={(prev) => ({ ...prev, edit: id })}
	mask={{ to: "/admin/test-crud/$id", params: { id }, unmaskOnReload: true }}
/>

// the list route: `edit` in validateSearch (not in loaderDeps), and
{search.edit ? <EditDialog id={search.edit} /> : null}

// the dialog closes with
const close = useCloseOverlay({ edit: undefined }); // Back if possible, else removes the param
```

**Rules:**
- **Always `unmaskOnReload: true`.** The server only sees the masked URL, so after a reload the browser must render the same full page, or hydration fails.
- **The masked target must be a real route** that renders the record by itself. Reload, shared links, new tabs and no-JS clicks land there.
- **Load the dialog's data with `useQuery`** and an inline skeleton. Don't make the list's loader wait for it.
- **Saving closes the dialog** (`onSaved={close}`); invalidating the list queries refreshes the rows underneath.

## Path params

Validate them on the route, not in the loader:

```ts
params: { parse: (raw) => parseParams(z.object({ id: z.uuid() }), raw) },
```

`parseParams` returns `false` for invalid input, so the route doesn't match and the localized 404 is served with status 404. Loaders and components receive typed params.

## Tests to copy

- **`tests/unit/search.test.ts`:** params, serialization, form patches, time-zone day ranges.
- **`tests/components/filters/filter-bar.test.tsx`:** URL updates, debounce, chips, Clear all, the no-JS form.
- **`tests/components/navigation/route-masking.test.tsx`:** href, masked address, Back/Forward, reload, 404 for invalid params.
- **`tests/server/test-crud-repository.test.ts`:** each filter against Postgres.

## Live example

- **Search params + filters:** `/dev/examples/filters` (`src/routes/_public/dev/examples/filters.tsx`), with `pnpm dev`.
- **Route masking:** `/dev/examples/masking` (`src/routes/_public/dev/examples/masking/index.tsx`), with `pnpm dev`.
