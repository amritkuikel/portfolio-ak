import { z } from "zod";
import { PAGE_SIZES } from "./stores/preferences";

/**
 * The list contract shared by routes, components and the server.
 *
 * A list page's URL search schema is built from these params, the same schema
 * validates the server function's input, and the server answers with a
 * `Paged<T>`. The frontend pieces (<DataTable sort>, <Pagination>, <SearchLink>)
 * read and write exactly these params: `q`, `sort`, `page`, `pageSize`.
 *
 * Every param is forgiving (`.catch`): a hand-edited or stale URL is corrected
 * to the default instead of failing the page.
 */

/** One page of results. `page` is the page actually returned (out-of-range requests are clamped). */
export type Paged<T> = { items: T[]; total: number; page: number; pageCount: number };

/** `?q=` free-text search (trimmed, at most `max` characters, "" when absent). */
export const searchParam = (max = 80) => z.string().trim().max(max).default("").catch("");

/** `?page=` 1-based page number. */
export const pageParam = (max = 10_000) => z.coerce.number().int().min(1).max(max).default(1).catch(1);

/** `?pageSize=` one of PAGE_SIZES; optional, so the route can fall back to the saved table preference. */
export const pageSizeParam = () =>
	z.coerce
		.number()
		.refine((value) => (PAGE_SIZES as ReadonlyArray<number>).includes(value))
		.optional()
		.catch(undefined);

/** A page size the server accepts (the resolved value sent to list server functions). */
export const resolvedPageSize = () =>
	z.coerce.number().refine((value) => (PAGE_SIZES as ReadonlyArray<number>).includes(value));

/**
 * `?sort=` or any enum param: one of `values`, `fallback` when absent or invalid.
 * Sort values are a field name for ascending and `-field` for descending
 * (what <DataTable> columns' `sort` produce).
 */
export const enumParam = <const T extends readonly [string, ...string[]]>(values: T, fallback: T[number]) =>
	z.enum(values).default(fallback).catch(fallback);

/** "-price" -> { field: "price", direction: "desc" }. */
export const parseSort = (sort: string): { field: string; direction: "asc" | "desc" } =>
	sort.startsWith("-") ? { field: sort.slice(1), direction: "desc" } : { field: sort, direction: "asc" };

/**
 * Page maths for any list: clamps the requested page into range (e.g. after the
 * last row of the last page was deleted) and gives the offset to read from.
 */
export function pageWindow({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
	const pageCount = Math.max(1, Math.ceil(total / pageSize));
	const current = Math.min(Math.max(1, page), pageCount);
	return { page: current, pageCount, offset: (current - 1) * pageSize, limit: pageSize };
}

/** Paginates an in-memory array (static data, small lookups). */
export function paginateArray<T>(items: ReadonlyArray<T>, page: number, pageSize: number): Paged<T> {
	const window = pageWindow({ page, pageSize, total: items.length });
	return {
		items: items.slice(window.offset, window.offset + window.limit),
		total: items.length,
		page: window.page,
		pageCount: window.pageCount,
	};
}

/** Input of bulk actions (delete selected, publish selected…): 1–`max` UUIDs. */
export const bulkIdsSchema = (max = 100) => z.object({ ids: z.array(z.uuid()).min(1).max(max) });
