import "@tanstack/react-start/server-only";
import { type AnyColumn, and, arrayOverlaps, asc, count, desc, gte, ilike, lt, lte, or, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { dayRangeInZone } from "@/lib/date-only";
import { APP_TIME_ZONE } from "@/lib/intl";
import { type Paged, pageWindow, parseSort } from "@/lib/list";
import type { Db } from "./types";

/**
 * Server half of the list contract (src/lib/list.ts): Drizzle helpers that turn
 * the shared `q` / `sort` / `page` / `pageSize` params into SQL and a Paged<T>.
 * Every repository list function is built from these, so all lists search,
 * sort and paginate the same way.
 */

/** Escapes LIKE wildcards so a search for "100%" means the literal text. */
export const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;

/** Case-insensitive "contains" over any of `columns`; undefined (no filter) for an empty search. */
export function textSearch(q: string, columns: ReadonlyArray<AnyColumn>): SQL | undefined {
	if (!q || columns.length === 0) return undefined;
	const pattern = likePattern(q);
	return or(...columns.map((column) => ilike(column, pattern)));
}

/** AND of the given filters, skipping the absent ones; undefined when there are none. */
export const allOf = (...filters: ReadonlyArray<SQL | undefined>): SQL | undefined => {
	const present = filters.filter((filter): filter is SQL => filter !== undefined);
	return present.length > 0 ? and(...present) : undefined;
};

/** `min <= column <= max`, either side optional; undefined when both are absent. */
export const numberRange = (column: AnyColumn, min: number | undefined, max: number | undefined) =>
	allOf(min === undefined ? undefined : gte(column, min), max === undefined ? undefined : lte(column, max));

/**
 * Calendar days `from`..`to` (inclusive, "YYYY-MM-DD") on a timestamp column, in the
 * app's time zone. Compared as instants, so an index on the column still applies.
 */
export const dateRange = (
	column: AnyColumn,
	from: string | undefined,
	to: string | undefined,
	timeZone = APP_TIME_ZONE,
) => {
	const { start, end } = dayRangeInZone(from, to, timeZone);
	return allOf(start ? gte(column, start) : undefined, end ? lt(column, end) : undefined);
};

/** An array column sharing at least one value with `values` (`&&`, GIN-indexable); undefined for []. */
export const overlapsAny = (column: AnyColumn, values: ReadonlyArray<string>) =>
	values.length === 0 ? undefined : arrayOverlaps(column, [...values]);

/**
 * ORDER BY for a sort value ("price" or "-price") over a whitelist of sortable
 * columns, always ending with a unique tiebreaker so pages never overlap.
 * Unknown fields fall back to `fallback` (the URL schema already rejects them).
 */
export function orderBySort<Field extends string>(
	sort: string,
	columns: Readonly<Record<Field, AnyColumn>>,
	options: { tiebreaker: AnyColumn; fallback: NoInfer<Field> },
): SQL[] {
	const { field, direction } = parseSort(sort);
	const isField = (key: string): key is Field => Object.hasOwn(columns, key);
	const column = columns[isField(field) ? field : options.fallback];
	return [direction === "desc" ? desc(column) : asc(column), asc(options.tiebreaker)];
}

/** Rows in `table` matching `where`. */
export async function countRows(db: Db, table: PgTable, where: SQL | undefined): Promise<number> {
	const [result] = await db.select({ total: count() }).from(table).where(where);
	return result?.total ?? 0;
}

/**
 * Runs a paginated query: counts first, clamps the page, then reads that page.
 *
 *   return paginate({ page, pageSize }, {
 *     count: () => countRows(db, items, where),
 *     rows: ({ limit, offset }) => db.select().from(items).where(where).orderBy(...order).limit(limit).offset(offset),
 *   }, toListItem);
 */
export async function paginate<Row, Item>(
	request: { page: number; pageSize: number },
	query: { count: () => Promise<number>; rows: (window: { limit: number; offset: number }) => Promise<Row[]> },
	map: (row: Row) => Item,
): Promise<Paged<Item>> {
	const total = await query.count();
	const window = pageWindow({ page: request.page, pageSize: request.pageSize, total });
	const rows = total === 0 ? [] : await query.rows({ limit: window.limit, offset: window.offset });
	return { items: rows.map(map), total, page: window.page, pageCount: window.pageCount };
}
