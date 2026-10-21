import { z } from "zod";
import {
	arrayParam,
	booleanParam,
	dateParam,
	enumParam,
	numberParam,
	pageParam,
	pageSizeParam,
	resolvedPageSize,
	searchParam,
} from "@/lib/list/params";
import { TEST_CRUD_STATUSES } from "./constants";

/**
 * The URL contract of Test CRUD's pages: search params, path params and the list
 * input they become. Route files import from here, never from ./schema.ts: route
 * options (validateSearch, params, loader) stay in the entry chunk, and the form
 * schemas there pull in rich-text and phone validation (decision 0151).
 */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// Admin list: URL search params == listTestCrud input
// ---------------------------------------------------------------------------

export const TEST_CRUD_SORTS = ["-updated", "updated", "title", "-title", "price", "-price"] as const;
export type TestCrudSort = (typeof TEST_CRUD_SORTS)[number];

export const TEST_CRUD_STATUS_FILTERS = ["all", ...TEST_CRUD_STATUSES] as const;
export type TestCrudStatusFilter = (typeof TEST_CRUD_STATUS_FILTERS)[number];

export const TEST_CRUD_SEARCH_DEFAULTS = {
	q: "",
	status: "all",
	sort: "-updated",
	page: 1,
	tags: [] as string[],
} as const satisfies { q: string; status: TestCrudStatusFilter; sort: TestCrudSort; page: number; tags: string[] };

export const TEST_CRUD_PRICE_MAX = 10_000_000;

/** A tag in a filter: same limits as stored tags. */
const tagValue = z.string().trim().min(1).max(32);

/**
 * /admin/test-crud search params and the list server function input. Invalid
 * values are corrected (.catch) rather than rejected. `pageSize` is optional in
 * the URL; the route falls back to the saved table preference.
 *
 * Filters: status, tags (any of), price range, published date range (calendar
 * days in the app time zone) and has-image.
 */
export const testCrudSearchSchema = z.object({
	q: searchParam(),
	status: enumParam(TEST_CRUD_STATUS_FILTERS, TEST_CRUD_SEARCH_DEFAULTS.status),
	tags: arrayParam(tagValue, { max: 10 }),
	priceMin: numberParam({ max: TEST_CRUD_PRICE_MAX }),
	priceMax: numberParam({ max: TEST_CRUD_PRICE_MAX }),
	from: dateParam(),
	to: dateParam(),
	hasImage: booleanParam(),
	sort: enumParam(TEST_CRUD_SORTS, TEST_CRUD_SEARCH_DEFAULTS.sort),
	page: pageParam(),
	pageSize: pageSizeParam(),
});
export type TestCrudSearch = z.output<typeof testCrudSearchSchema>;

/** The filter keys (what "Clear all" resets; sort and page size are kept). */
export const TEST_CRUD_FILTER_KEYS = ["q", "status", "tags", "priceMin", "priceMax", "from", "to", "hasImage"] as const;

/**
 * The admin list ROUTE's search: the list params plus `edit`, the item open in the
 * edit dialog (a masked route: the address bar shows /admin/test-crud/$id).
 * `edit` is UI state only; it is not part of the server function input.
 */
export const testCrudAdminRouteSearchSchema = testCrudSearchSchema.extend({
	edit: z.uuid().optional().catch(undefined),
});
export type TestCrudAdminRouteSearch = z.output<typeof testCrudAdminRouteSearchSchema>;

/** What the list server function receives: the search with a resolved page size. */
export const testCrudListInputSchema = testCrudSearchSchema.extend({ pageSize: resolvedPageSize() });
export type TestCrudListInput = z.output<typeof testCrudListInputSchema>;

/** Path params of /admin/test-crud/$id (the route doesn't match anything else). */
export const testCrudIdParamSchema = z.object({ id: z.uuid() });

// ---------------------------------------------------------------------------
// Public side (/test-crud)
// ---------------------------------------------------------------------------

export const TEST_CRUD_PUBLIC_PAGE_SIZE = 12;

export const TEST_CRUD_PUBLIC_SEARCH_DEFAULTS = { q: "", page: 1 } as const satisfies { q: string; page: number };

/** /test-crud search params and the public list input. Invalid values are corrected. */
export const testCrudPublicSearchSchema = z.object({ q: searchParam(), page: pageParam() });
export type TestCrudPublicSearch = z.output<typeof testCrudPublicSearchSchema>;

/** The public list ROUTE's search: plus `view`, the item in the quick-view dialog (masked to /test-crud/$slug). */
export const testCrudPublicRouteSearchSchema = testCrudPublicSearchSchema.extend({
	view: z.string().max(80).regex(SLUG_PATTERN).optional().catch(undefined),
});

/** Slug route param; anything that isn't a valid slug can't exist. */
export const testCrudSlugParamSchema = z.object({ slug: z.string().max(80).regex(SLUG_PATTERN) });
