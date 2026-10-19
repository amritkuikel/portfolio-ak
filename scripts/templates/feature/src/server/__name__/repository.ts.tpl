import "@tanstack/react-start/server-only";
import { eq, inArray } from "drizzle-orm";
import type {
	__Pascal__Detail,
	__Pascal__Input,
	__Pascal__ListInput,
	__Pascal__ListItem,
	__Pascal__Page,
} from "@/features/__name__/schema";
import { staleError } from "@/lib/concurrency";
import { AppError } from "@/lib/errors";
import { sameVersion } from "@/server/db/concurrency";
import { allOf, countRows, orderBySort, paginate, textSearch } from "@/server/db/list";
import { __camel__ } from "@/server/db/schema";
import type { Db } from "@/server/db/types";

/**
 * __Title__ data access: plain functions over an injected Drizzle database, so
 * the same code runs against Neon in the app and PGlite in tests.
 */

type Row = typeof __camel__.$inferSelect;

/** Sortable fields (__UPPER___SORTS); the id breaks ties so pages never overlap. */
const SORT_COLUMNS = { updated: __camel__.updatedAt, title: __camel__.title };

const toListItem = (row: Row): __Pascal__ListItem => ({
	id: row.id,
	title: row.title,
	updatedAt: row.updatedAt.toISOString(),
});

const toDetail = (row: Row): __Pascal__Detail => ({
	...toListItem(row),
	notes: row.notes,
	createdAt: row.createdAt.toISOString(),
});

const notFound = () => new AppError("NOT_FOUND", "__Title__ row not found");

export async function list__Pascal__(db: Db, input: __Pascal__ListInput): Promise<__Pascal__Page> {
	const where = allOf(textSearch(input.q, [__camel__.title, __camel__.notes]));
	const order = orderBySort(input.sort, SORT_COLUMNS, { tiebreaker: __camel__.id, fallback: "updated" });
	return paginate(
		input,
		{
			count: () => countRows(db, __camel__, where),
			rows: ({ limit, offset }) =>
				db
					.select()
					.from(__camel__)
					.where(where)
					.orderBy(...order)
					.limit(limit)
					.offset(offset),
		},
		toListItem,
	);
}

export async function get__Pascal__(db: Db, id: string): Promise<__Pascal__Detail | null> {
	const [row] = await db.select().from(__camel__).where(eq(__camel__.id, id));
	return row ? toDetail(row) : null;
}

export async function create__Pascal__(db: Db, input: __Pascal__Input, userId: string): Promise<__Pascal__Detail> {
	const [row] = await db
		.insert(__camel__)
		.values({ ...input, createdBy: userId })
		.returning();
	if (!row) throw new AppError("INTERNAL", "Insert returned no row");
	return toDetail(row);
}

/**
 * Saves the row if it still has the version (`updatedAt`) the edit started
 * from; otherwise a stale CONFLICT and nothing is written. The row is locked
 * while it's checked, so two saves of the same version can't both pass.
 */
export async function update__Pascal__(
	db: Db,
	id: string,
	input: __Pascal__Input,
	version: string,
): Promise<__Pascal__Detail> {
	return db.transaction(async (tx) => {
		const [current] = await tx
			.select({ current: sameVersion(__camel__.updatedAt, version) })
			.from(__camel__)
			.where(eq(__camel__.id, id))
			.for("update");
		if (!current) throw notFound();
		if (!current.current) throw staleError("__Title__ row");
		const [row] = await tx.update(__camel__).set(input).where(eq(__camel__.id, id)).returning();
		if (!row) throw notFound();
		return toDetail(row);
	});
}

/** Deletes rows (missing ids are ignored); returns the rows deleted, for the audit log. */
export async function delete__Pascal__(
	db: Db,
	ids: ReadonlyArray<string>,
): Promise<Array<{ id: string; title: string }>> {
	return db
		.delete(__camel__)
		.where(inArray(__camel__.id, [...ids]))
		.returning({ id: __camel__.id, title: __camel__.title });
}
