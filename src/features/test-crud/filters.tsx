import { ActiveFilters, chipLabel, type FilterChip, rangeValue } from "@/components/filters/active-filters";
import {
	BooleanFilter,
	DateRangeFilter,
	MultiSelectFilter,
	NumberRangeFilter,
	SearchFilter,
	SelectFilter,
} from "@/components/filters/filters";
import { isoDateInstant } from "@/lib/i18n/date-only";
import { formatCurrency, formatDate } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { STATUS_FILTER_LABELS } from "./labels";
import { TEST_CRUD_FILTER_KEYS, TEST_CRUD_STATUS_FILTERS, type TestCrudSearch } from "./search";

/**
 * The admin list's filters: the controls (inside <FilterBar>) and the chips
 * describing what's applied. Keys match testCrudSearchSchema.
 */
export function TestCrudFilterControls({ search, tags }: { search: TestCrudSearch; tags: ReadonlyArray<string> }) {
	return (
		<>
			<SearchFilter
				label={m.test_crud_search_label()}
				value={search.q}
				placeholder={m.test_crud_search_placeholder()}
			/>
			<SelectFilter
				name="status"
				label={m.test_crud_filter_status()}
				value={search.status}
				options={TEST_CRUD_STATUS_FILTERS.map((status) => ({ value: status, label: STATUS_FILTER_LABELS[status]() }))}
			/>
			<MultiSelectFilter
				name="tags"
				label={m.test_crud_filter_tags()}
				value={search.tags}
				// Keep selected tags listed even if no row uses them any more.
				options={[...new Set([...tags, ...search.tags])].map((tag) => ({ value: tag, label: tag }))}
			/>
			<NumberRangeFilter
				label={m.test_crud_filter_price()}
				names={["priceMin", "priceMax"]}
				value={[search.priceMin, search.priceMax]}
			/>
			<DateRangeFilter label={m.test_crud_filter_published()} names={["from", "to"]} value={[search.from, search.to]} />
			<BooleanFilter
				name="hasImage"
				label={m.test_crud_filter_has_image()}
				value={search.hasImage}
				trueLabel={m.test_crud_filter_with_image()}
				falseLabel={m.test_crud_filter_without_image()}
			/>
		</>
	);
}

const day = (value: string | undefined) =>
	value === undefined ? undefined : formatDate(isoDateInstant(value), { dateStyle: "medium" });
const money = (value: number | undefined) => (value === undefined ? undefined : formatCurrency(value));

/** One chip per applied filter (one per tag), each with the search change that removes it. */
export function testCrudFilterChips(search: TestCrudSearch): FilterChip[] {
	const chips: FilterChip[] = [];
	if (search.q) {
		chips.push({ id: "q", label: chipLabel(m.test_crud_search_label(), `“${search.q}”`), remove: { q: undefined } });
	}
	if (search.status !== "all") {
		chips.push({
			id: "status",
			label: chipLabel(m.test_crud_filter_status(), STATUS_FILTER_LABELS[search.status]()),
			remove: { status: undefined },
		});
	}
	for (const tag of search.tags) {
		chips.push({
			id: `tag:${tag}`,
			label: chipLabel(m.test_crud_filter_tags(), tag),
			remove: { tags: search.tags.filter((other) => other !== tag) },
		});
	}
	const price = rangeValue(money(search.priceMin), money(search.priceMax));
	if (price) {
		chips.push({
			id: "price",
			label: chipLabel(m.test_crud_filter_price(), price),
			remove: { priceMin: undefined, priceMax: undefined },
		});
	}
	const published = rangeValue(day(search.from), day(search.to));
	if (published) {
		chips.push({
			id: "published",
			label: chipLabel(m.test_crud_filter_published(), published),
			remove: { from: undefined, to: undefined },
		});
	}
	if (search.hasImage !== undefined) {
		chips.push({
			id: "hasImage",
			label: search.hasImage ? m.test_crud_filter_with_image() : m.test_crud_filter_without_image(),
			remove: { hasImage: undefined },
		});
	}
	return chips;
}

/** "Clear all": every filter back to its default (sort and page size stay). */
export const TEST_CRUD_CLEAR_FILTERS = Object.fromEntries(TEST_CRUD_FILTER_KEYS.map((key) => [key, undefined]));

export function TestCrudActiveFilters({ search }: { search: TestCrudSearch }) {
	return <ActiveFilters chips={testCrudFilterChips(search)} clearAll={TEST_CRUD_CLEAR_FILTERS} />;
}
