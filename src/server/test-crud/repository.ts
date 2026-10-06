import "@tanstack/react-start/server-only";
import { and, asc, count, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import {
	imageUrl,
	type TestCrudDetail,
	type TestCrudInput,
	type TestCrudListInput,
	type TestCrudListItem,
	type TestCrudPage,
	type TestCrudSort,
	type TestCrudStatus,
} from "@/features/test-crud/schema";
import { AppError } from "@/lib/errors";
import { m } from "@/paraglide/messages";
import type * as schema from "@/server/db/schema";
import { testCrud, testCrudImage } from "@/server/db/schema";
import { sanitizeRichText } from "@/server/rich-text/sanitize";
import type { ValidImage } from "./image";

/**
 * Test CRUD data access. Plain functions over an injected Drizzle database so the
 * same code runs against Neon (node-postgres) in the app and PGlite in tests.
 * Server functions (src/functions/test-crud.ts) add auth, validation and I/O.
 */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** What to do with the stored image on update. */
export type ImageChange = { kind: "keep" } | { kind: "remove" } | { kind: "replace"; image: ValidImage };

const SORTS: Readonly<Record<TestCrudSort, SQL[]>> = {
	"-updated": [desc(testCrud.updatedAt), asc(testCrud.id)],
	updated: [asc(testCrud.updatedAt), asc(testCrud.id)],
	title: [asc(testCrud.title), asc(testCrud.id)],
	"-title": [desc(testCrud.title), asc(testCrud.id)],
	price: [asc(testCrud.price), asc(testCrud.id)],
	"-price": [desc(testCrud.price), asc(testCrud.id)],
};

/** Escapes LIKE wildcards so a search for "100%" means the literal text. */
const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;

type Row = typeof testCrud.$inferSelect;

const toListItem = (row: Row): TestCrudListItem => ({
	id: row.id,
	slug: row.slug,
	title: row.title,
	status: row.status,
	price: row.price,
	tags: row.tags,
	imageUrl: imageUrl(row.image),
	publishedAt: row.publishedAt?.toISOString() ?? null,
	updatedAt: row.updatedAt.toISOString(),
});

const toDetail = (row: Row): TestCrudDetail => ({
	...toListItem(row),
	summary: row.summary,
	// Sanitized again on the way out: defence in depth for rows not written by this code.
	body: sanitizeRichText(row.body),
	phone: row.phone,
	createdAt: row.createdAt.toISOString(),
});

export async function listTestCrud(db: Db, input: TestCrudListInput): Promise<TestCrudPage> {
	const filters: SQL[] = [];
	if (input.status !== "all") filters.push(eq(testCrud.status, input.status));
	if (input.q) {
		const pattern = likePattern(input.q);
		const match = or(ilike(testCrud.title, pattern), ilike(testCrud.slug, pattern), ilike(testCrud.summary, pattern));
		if (match) filters.push(match);
	}
	const where = filters.length > 0 ? and(...filters) : undefined;

	const [totals] = await db.select({ total: count() }).from(testCrud).where(where);
	const total = totals?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / input.pageSize));
	// Out-of-range pages are clamped (e.g. after deleting the last row of the last page).
	const page = Math.min(input.page, pageCount);
	const rows = await db
		.select()
		.from(testCrud)
		.where(where)
		.orderBy(...SORTS[input.sort])
		.limit(input.pageSize)
		.offset((page - 1) * input.pageSize);
	return { items: rows.map(toListItem), total, page, pageCount };
}

export async function getTestCrud(db: Db, id: string): Promise<TestCrudDetail | null> {
	const [row] = await db.select().from(testCrud).where(eq(testCrud.id, id));
	return row ? toDetail(row) : null;
}

const notFound = () => new AppError("NOT_FOUND", "Test CRUD item not found");

/** Unique-violation on the slug becomes a field error the form can show. */
const isSlugConflict = (error: unknown): boolean => {
	for (let current: unknown = error; current; current = (current as { cause?: unknown }).cause) {
		const pg = current as { code?: unknown; constraint?: unknown };
		if (pg.code === "23505" && pg.constraint === "test_crud_slug_unique") return true;
		if (typeof current !== "object") break;
	}
	return false;
};
const slugTaken = () =>
	new AppError("CONFLICT", "Slug already in use", { fieldErrors: { slug: [m.validation_slug_taken()] } });

const publishedAtFor = (status: TestCrudStatus, current: Date | null, now: Date) =>
	status === "published" ? (current ?? now) : null;

const insertImage = async (tx: Tx, image: ValidImage) => {
	const [stored] = await tx
		.insert(testCrudImage)
		.values({ mimeType: image.mimeType, byteSize: image.data.byteLength, data: image.data })
		.returning({ id: testCrudImage.id });
	if (!stored) throw new AppError("INTERNAL", "Image insert returned no row");
	return stored.id;
};

const deleteImages = async (tx: Tx, ids: ReadonlyArray<string | null>) => {
	const existing = ids.filter((id): id is string => id !== null);
	if (existing.length > 0) await tx.delete(testCrudImage).where(inArray(testCrudImage.id, existing));
};

const fields = (input: TestCrudInput) => ({
	title: input.title,
	slug: input.slug,
	summary: input.summary,
	body: sanitizeRichText(input.body),
	status: input.status,
	price: input.price,
	phone: input.phone || null,
	tags: input.tags,
});

export async function createTestCrud(
	db: Db,
	input: TestCrudInput,
	options: { image: ValidImage | null; userId: string; now?: Date },
): Promise<TestCrudDetail> {
	const now = options.now ?? new Date();
	try {
		const row = await db.transaction(async (tx) => {
			const image = options.image ? await insertImage(tx, options.image) : null;
			const [created] = await tx
				.insert(testCrud)
				.values({
					...fields(input),
					image,
					createdBy: options.userId,
					publishedAt: publishedAtFor(input.status, null, now),
				})
				.returning();
			return created;
		});
		if (!row) throw new AppError("INTERNAL", "Insert returned no row");
		return toDetail(row);
	} catch (error) {
		throw isSlugConflict(error) ? slugTaken() : error;
	}
}

export async function updateTestCrud(
	db: Db,
	id: string,
	input: TestCrudInput,
	options: { image: ImageChange; now?: Date },
): Promise<TestCrudDetail> {
	const now = options.now ?? new Date();
	try {
		const row = await db.transaction(async (tx) => {
			const [current] = await tx
				.select({ image: testCrud.image, publishedAt: testCrud.publishedAt })
				.from(testCrud)
				.where(eq(testCrud.id, id))
				.for("update");
			if (!current) throw notFound();

			let image = current.image;
			if (options.image.kind !== "keep") {
				image = options.image.kind === "replace" ? await insertImage(tx, options.image.image) : null;
			}
			const [updated] = await tx
				.update(testCrud)
				.set({ ...fields(input), image, publishedAt: publishedAtFor(input.status, current.publishedAt, now) })
				.where(eq(testCrud.id, id))
				.returning();
			// The old image is unreachable now; drop it in the same transaction.
			if (image !== current.image) await deleteImages(tx, [current.image]);
			return updated;
		});
		if (!row) throw notFound();
		return toDetail(row);
	} catch (error) {
		throw isSlugConflict(error) ? slugTaken() : error;
	}
}

/** Publish / unpublish from the list (optimistic in the UI). */
export async function setTestCrudStatus(
	db: Db,
	id: string,
	status: TestCrudStatus,
	now = new Date(),
): Promise<TestCrudListItem> {
	return db.transaction(async (tx) => {
		const [current] = await tx
			.select({ publishedAt: testCrud.publishedAt })
			.from(testCrud)
			.where(eq(testCrud.id, id))
			.for("update");
		if (!current) throw notFound();
		const [updated] = await tx
			.update(testCrud)
			.set({ status, publishedAt: publishedAtFor(status, current.publishedAt, now) })
			.where(eq(testCrud.id, id))
			.returning();
		if (!updated) throw notFound();
		return toListItem(updated);
	});
}

/** Deletes rows (and their images). Returns how many rows existed. */
export async function deleteTestCrud(db: Db, ids: ReadonlyArray<string>): Promise<number> {
	return db.transaction(async (tx) => {
		const deleted = await tx
			.delete(testCrud)
			.where(inArray(testCrud.id, [...ids]))
			.returning({ image: testCrud.image });
		await deleteImages(
			tx,
			deleted.map((row) => row.image),
		);
		return deleted.length;
	});
}

export async function getImage(db: Db, id: string) {
	const [image] = await db
		.select({ mimeType: testCrudImage.mimeType, data: testCrudImage.data })
		.from(testCrudImage)
		.where(eq(testCrudImage.id, id));
	return image ?? null;
}
