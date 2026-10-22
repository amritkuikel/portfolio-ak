# State: Query, DB, Store, Form and the URL

Pick the tool by what the state is (decision 0064). Examples: `/dev/examples/loader-query`, `/dev/examples/optimistic`, `/dev/examples/preferences`, `/dev/examples/filters`.

| State | Tool | Example |
| --- | --- | --- |
| Server data you read | **TanStack Query**: `queryOptions` in `features/<name>/queries.ts`, `ensureQuery` in loaders, `useSuspenseQuery` in components | `/dev/stack`, the session (`sessionQueryOptions`) |
| Server data you edit in the admin | **Query mutations** through `useCrudMutation` (crud.md): optimistic on every cached page, rolled back on refusal | Test CRUD's publish and delete, the permission matrix |
| Client-first app state with live queries | **TanStack DB** collections (decision 0174) | `/dev/examples/optimistic`; the apps (Kanban, Habits, Notes) |
| UI preferences that persist | **TanStack Store** (`src/lib/stores`), saved in cookies | Theme, admin sidebar, table page size and hidden columns, analytics consent |
| Values being typed | **TanStack Form** ([forms.md](forms.md)) | Every form |
| Shareable view state | **URL search params** ([search-filters-masking.md](search-filters-masking.md)) | Filters, sort, page, an open dialog (`?edit=…`) |
| One component's local state | `useState` | A popover, password visibility |

Rules of thumb:
- Never copy server data into a Store. Query or DB own it.
- Read-only pages don't need DB.
- If a link should reproduce the view, keep the state in the URL.

## Query

- **Keys:** one keys object per feature from `createCrudKeys(name)` (`.all`, `.lists()`, `.list(input)`, `.details()`, `.detail(id)`), so one `invalidateQueries({ queryKey: thingKeys.all })` refreshes everything the feature shows.
- **Writes:** `mutationOptions` in `queries.ts` (a key and the server function), run with `useCrudMutation(options, { invalidate, optimistic })` or by a form's `useCrudForm` ([crud.md](crud.md), "Writes").
- **Defaults** (`src/lib/query.ts`): `staleTime` 60 s (no refetch after hydration); app errors aren't retried.
- **Per request:** one QueryClient per request on the server, dehydrated into the HTML by `@tanstack/react-router-ssr-query`.

## DB (client-first apps)

Admin CRUD doesn't use it (0174): its lists are server pages, and `useCrudMutation` patches them in the Query cache. DB is for state the client owns and queries live (the apps). The pattern:

```ts
export const thingsCollection = (input) => collectionOptions(id, (client) =>
	queryCollectionOptions({
		queryKey: thingKeys.list(input),             // same key as the loader: SSR'd rows are the initial state
		queryFn: () => listThings({ data: input }),
		select: (page) => page.items,
		queryClient: queryClientOf(client),
		getKey: (row) => row.id,
		onUpdate: async ({ transaction }) => { await saveThings(transaction.mutations); },  // throw => rollback
	}));
```

- **In the component:**
  - `const collection = useMemo(() => dbClient.collection(thingsCollection(input)), …)`;
  - `useLiveQuery((q) => q.from({ row: collection }))`;
  - `collection.update(id, (draft) => { draft.status = … })`;
  - `tx.isPersisted.promise` resolves or rejects, so show a toast either way.
- **Until the collection is ready** (SSR, first paint), render the Query rows so hydration matches. See `src/routes/dev/examples/optimistic.tsx` and `src/features/dev/examples/collection.ts`.
- **Per-call data** (like the example's "make the server refuse") travels as `collection.update(id, { metadata }, …)`.
- **Per request:** one DbClient per router (`src/lib/tanstack-db.ts`), so server requests never share rows.

## Store (preferences)

- **Hooks:** `useTheme()`, `useSidebar()`, `useTablePreferences(tableId, { pageSize })`, `usePreferences(selector)`.
- **Actions** update the store and the cookie together.
- **The server reads the cookies** on every request, so the first byte already has the user's theme, sidebar and page size: no flash, no hydration mismatch (0065).
- **Cookie values are untrusted:** they're parsed with Zod, and invalid ones fall back to the defaults.
