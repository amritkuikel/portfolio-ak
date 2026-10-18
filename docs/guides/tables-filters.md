# Tables, filters and pagination

The shared list UI: `DataTable`, `FilterBar` with filter controls and chips, and `Pagination`. Feature code supplies only columns, filters and actions. Examples: `/dev/examples/data-table`, `/dev/examples/filters`; the full admin version is `src/routes/_admin/admin/test-crud/index.tsx`. The URL contract behind them is in [search-filters-masking.md](search-filters-masking.md).

## DataTable

```tsx
const columns = (): DataTableColumn<Thing>[] => [            // built at render time (locale)
	{ id: "title", header: m.things_title, sort: "title", cell: (row) => row.title },
	{ id: "updated", header: m.things_updated, sort: "updated", hideable: true, cell: (row) => formatDate(row.updatedAt) },
];

<DataTableColumnsMenu tableId="things" columns={columns()} />
<DataTable
	tableId="things"                       // key for saved preferences (hidden columns, page size)
	rows={page.items}
	columns={columns()}
	getRowId={(row) => row.id}
	getRowLabel={(row) => row.title}       // "Select …", "Actions for …"
	sort={search.sort}                     // sort headers are links: ?sort=title / -title, page reset
	busy={busy}                            // dims the rows while a new page loads
	bulkActions={({ ids, clear }) => <Button onClick={() => remove(ids, clear)}>{m.delete()}</Button>}
	rowActions={(row) => <DropdownMenuItem onSelect={() => edit(row)}>{m.edit()}</DropdownMenuItem>}
	empty={<EmptyState description={m.things_empty()} action={filtered ? <ClearFiltersButton clearAll={CLEAR} /> : null} />}
/>
<Pagination {...pagination} />   // from useListPage: summary, rows-per-page picker (saved per table), prev/next
```

`page`, `busy` and `pagination` come from `useListPage({ tableId: "things", search, query: thingListQueryOptions })`; the loader uses `tableListInput` so both agree on the page size ([search-filters-masking.md](search-filters-masking.md)).

- **Server-rendered:** rows come from the loader, sorting and paging are links, and the whole table is in the HTML.
- **Selection** is local to the page; the bulk bar appears when rows are selected. Return `null` from `rowActions` for a row with no actions.
- **Destructive actions** confirm with `ConfirmDialog` (focus starts on Cancel).
- **Writes:** plain mutations followed by invalidating the list queries, or a TanStack DB collection for instant feedback with rollback ([state.md](state.md)).
- **Columns in a feature file:** `features/<name>/components/admin-columns.tsx`. Don't build cells inline in the route.
- **Loading:** `DataTableSkeleton` for the pending component, `busy` for a new search.

## Filters

```tsx
<FilterBar values={search} preserve={["sort", "pageSize"]}>
	<SearchFilter label={m.things_search()} value={search.q} />
	<SelectFilter name="status" label={m.things_status()} value={search.status} options={statusOptions} />
	<MultiSelectFilter name="tags" label={m.things_tags()} value={search.tags} options={tagOptions} />
	<NumberRangeFilter label={m.things_price()} names={["priceMin", "priceMax"]} value={[search.priceMin, search.priceMax]} />
	<DateRangeFilter label={m.things_published()} names={["from", "to"]} value={[search.from, search.to]} />
	<BooleanFilter name="hasImage" label={m.things_image()} value={search.hasImage} />
</FilterBar>
<ActiveFilters chips={thingFilterChips(search)} clearAll={{ q: undefined, status: undefined, … }} />
```

- **`FilterBar` is a GET form of native controls:** without JavaScript it submits to the URL. With JavaScript it updates the URL as you type (debounced) or change a control, resets the page, and keeps the params in `preserve`.
- **Chips:** one per applied filter, each with the search change that removes it. Write them next to the controls (`features/<name>/filters.tsx`).
- **Every filter value** is a search param parsed by the route's schema; invalid values are corrected, never errors.

## Pagination

`Pagination` builds page links from the URL, so it works without JavaScript. Disabled steps are plain text. `hideWhenSingle` hides it for one page, and `pageSize` adds a rows-per-page picker saved in the table's preferences. The server clamps the page to the last one.

## Public lists

Use the same pieces with `PageHeader size="display"`, a card grid and `Pagination layout="center"`, plus `listSeo()` in `head` ([seo.md](seo.md)). `/test-crud` and `/stack` are the examples.
