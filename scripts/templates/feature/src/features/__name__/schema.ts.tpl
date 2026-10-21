import { z } from "zod";
import { versionSchema } from "@/lib/concurrency";
import { bulkIdsSchema, type Paged } from "@/lib/list/paging";
import { enumParam, pageParam, pageSizeParam, resolvedPageSize, searchParam } from "@/lib/list/params";
import { optionalText, required } from "@/lib/validation";

/** preferences table id (page size, hidden columns) of the admin list. */
export const __UPPER___TABLE_ID = "__name__";

// ---------------------------------------------------------------------------
// Create / update: ONE schema shared by the form (client) and the server functions
// ---------------------------------------------------------------------------

export const __camel__InputSchema = z.object({
	title: required({ max: 120 }),
	notes: optionalText({ max: 2000 }),
});
export type __Pascal__Input = z.output<typeof __camel__InputSchema>;
export type __Pascal__FormValues = z.input<typeof __camel__InputSchema>;

/** Update: the same fields plus which row and the version the edit started from (its `updatedAt`). */
export const __camel__UpdateSchema = __camel__InputSchema.extend({ id: z.uuid(), updatedAt: versionSchema() });

// ---------------------------------------------------------------------------
// Admin list: URL search params == the list server function's input
// ---------------------------------------------------------------------------

export const __UPPER___SORTS = ["-updated", "updated", "title", "-title"] as const;

export const __UPPER___SEARCH_DEFAULTS = { q: "", sort: "-updated", page: 1 } as const satisfies {
	q: string;
	sort: (typeof __UPPER___SORTS)[number];
	page: number;
};

/** /admin/__name__ search params. Invalid values are corrected (.catch) rather than rejected. */
export const __camel__SearchSchema = z.object({
	q: searchParam(),
	sort: enumParam(__UPPER___SORTS, __UPPER___SEARCH_DEFAULTS.sort),
	page: pageParam(),
	pageSize: pageSizeParam(),
});
export type __Pascal__Search = z.output<typeof __camel__SearchSchema>;

/** What the list server function receives: the search with a resolved page size. */
export const __camel__ListInputSchema = __camel__SearchSchema.extend({ pageSize: resolvedPageSize() });
export type __Pascal__ListInput = z.output<typeof __camel__ListInputSchema>;

export const __camel__IdSchema = z.object({ id: z.uuid() });
export const __camel__IdsSchema = bulkIdsSchema(100);

// ---------------------------------------------------------------------------
// DTOs (what crosses the wire; dates as ISO strings)
// ---------------------------------------------------------------------------

export type __Pascal__ListItem = { id: string; title: string; updatedAt: string };
export type __Pascal__Page = Paged<__Pascal__ListItem>;
export type __Pascal__Detail = __Pascal__ListItem & { notes: string; createdAt: string };
