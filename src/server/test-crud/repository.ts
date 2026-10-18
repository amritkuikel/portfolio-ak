import "@tanstack/react-start/server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import type { ImageAsset } from "@/features/attachments/schema";
import type {
	PublicTestCrudCard,
	PublicTestCrudDetail,
	PublicTestCrudPage,
	TestCrudDetail,
	TestCrudInput,
	TestCrudListInput,
	TestCrudListItem,
	TestCrudPage,
	TestCrudStatus,
} from "@/features/test-crud/schema";
import { staleError } from "@/lib/concurrency";
import { AppError, ruleError } from "@/lib/errors";
import { m } from "@/paraglide/messages";
import type { ImageStore } from "@/server/attachments/cloudinary";
import { toImageAsset } from "@/server/attachments/images";
import {
	AttachmentLinkError,
	listForEntities,
	removeForEntities,
	syncEntityAttachments,
} from "@/server/attachments/repository";
import { sameVersion } from "@/server/db/concurrency";
import {
	allOf,
	countRows,
	dateRange,
	numberRange,
	orderBySort,
	overlapsAny,
	paginate,
	textSearch,
} from "@/server/db/list";
import { type AttachmentRow, attachment, testCrud } from "@/server/db/schema";
import type { Db } from "@/server/db/types";
import { sanitizeRichText } from "@/server/rich-text/sanitize";

/**
 * Test CRUD data access. Plain functions over an injected Drizzle database so the
 * same code runs against Neon (node-postgres) in the app and PGlite in tests.
 * Images are attachments (src/server/attachments): `store` builds their URLs;
 * without one (Cloudinary not configured) items simply have no images.
 */
export type { Db } from "@/server/db/types";

/** The attachments' entity type for Test CRUD items. */
export const ENTITY = "test-crud";

/** Sortable fields of the admin list (TEST_CRUD_SORTS); the id breaks ties so pages never overlap. */
const SORT_COLUMNS = { updated: testCrud.updatedAt, title: testCrud.title, price: testCrud.price };

type Row = typeof testCrud.$inferSelect;

/** The live images of these items, in order (empty without a store). */
async function imagesFor(db: Db, store: ImageStore | null, ids: ReadonlyArray<string>) {
	const images = new Map<string, ImageAsset[]>();
	if (!store || ids.length === 0) return images;
	for (const [id, rows] of await listForEntities(db, ENTITY, ids)) {
		images.set(
			id,
			rows.map((row) => toImageAsset(store, row)),
		);
	}
	return images;
}

const toListItem = (row: Row, images: ReadonlyArray<ImageAsset>): TestCrudListItem => ({
	id: row.id,
	slug: row.slug,
	title: row.title,
	status: row.status,
	price: row.price,
	tags: row.tags,
	image: images[0] ?? null,
	publishedAt: row.publishedAt?.toISOString() ?? null,
	updatedAt: row.updatedAt.toISOString(),
});

const toDetail = (row: Row, images: ReadonlyArray<ImageAsset>): TestCrudDetail => ({
	...toListItem(row, images),
	images: [...images],
	summary: row.summary,
	// Sanitized again on the way out: defence in depth for rows not written by this code.
	body: sanitizeRichText(row.body),
	phone: row.phone,
	createdAt: row.createdAt.toISOString(),
});

/** Maps a page of rows to items with their images (one query for the whole page). */
async function withImages<T>(
	db: Db,
	store: ImageStore | null,
	rows: ReadonlyArray<Row>,
	map: (row: Row, images: ReadonlyArray<ImageAsset>) => T,
): Promise<T[]> {
	const images = await imagesFor(
		db,
		store,
		rows.map((row) => row.id),
	);
	return rows.map((row) => map(row, images.get(row.id) ?? []));
}

/** Items with (or without) at least one live image. */
const hasImages = sql`exists (select 1 from ${attachment} where ${attachment.entityType} = ${ENTITY} and ${attachment.entityId} = ${testCrud.id}::text and ${attachment.deletedAt} is null)`;

export async function listTestCrud(db: Db, input: TestCrudListInput, store: ImageStore | null): Promise<TestCrudPage> {
	const where = allOf(
		input.status === "all" ? undefined : eq(testCrud.status, input.status),
		textSearch(input.q, [testCrud.title, testCrud.slug, testCrud.summary]),
		overlapsAny(testCrud.tags, input.tags),
		numberRange(testCrud.price, input.priceMin, input.priceMax),
		dateRange(testCrud.publishedAt, input.from, input.to),
		input.hasImage === undefined ? undefined : input.hasImage ? hasImages : sql`not ${hasImages}`,
	);
	const order = orderBySort(input.sort, SORT_COLUMNS, { tiebreaker: testCrud.id, fallback: "updated" });
	// Out-of-range pages are clamped (e.g. after deleting the last row of the last page).
	const page = await paginate(
		input,
		{
			count: () => countRows(db, testCrud, where),
			rows: ({ limit, offset }) =>
				db
					.select()
					.from(testCrud)
					.where(where)
					.orderBy(...order)
					.limit(limit)
					.offset(offset),
		},
		(row) => row,
	);
	return { ...page, items: await withImages(db, store, page.items, toListItem) };
}

/** Every tag in use, alphabetical (options for the tag filter). */
export async function listTestCrudTags(db: Db): Promise<string[]> {
	const rows = await db
		.selectDistinct({ tag: sql<string>`unnest(${testCrud.tags})` })
		.from(testCrud)
		.orderBy(sql`1`)
		.limit(200);
	return rows.map((row) => row.tag);
}

export async function getTestCrud(db: Db, id: string, store: ImageStore | null): Promise<TestCrudDetail | null> {
	const [row] = await db.select().from(testCrud).where(eq(testCrud.id, id));
	if (!row) return null;
	const [detail] = await withImages(db, store, [row], toDetail);
	return detail ?? null;
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

/** Known save failures become user-facing errors; anything else propagates. */
const saveError = (error: unknown) => {
	if (isSlugConflict(error)) return slugTaken();
	if (error instanceof AttachmentLinkError) {
		return ruleError("BAD_REQUEST", error.message, m.attachments_error_link());
	}
	return error;
};

const publishedAtFor = (status: TestCrudStatus, current: Date | null, now: Date) =>
	status === "published" ? (current ?? now) : null;

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

/** Creates an item and links its images (the creator's pending uploads) in one transaction. */
export async function createTestCrud(
	db: Db,
	input: TestCrudInput,
	options: { userId: string; store: ImageStore | null; now?: Date },
): Promise<TestCrudDetail> {
	const now = options.now ?? new Date();
	try {
		const row = await db.transaction(async (tx) => {
			const [created] = await tx
				.insert(testCrud)
				.values({ ...fields(input), createdBy: options.userId, publishedAt: publishedAtFor(input.status, null, now) })
				.returning();
			if (!created) throw new AppError("INTERNAL", "Insert returned no row");
			await syncEntityAttachments(
				tx,
				{ entityType: ENTITY, entityId: created.id, ownerId: options.userId },
				input.images,
			);
			return created;
		});
		const [detail] = await withImages(db, options.store, [row], toDetail);
		if (!detail) throw notFound();
		return detail;
	} catch (error) {
		throw saveError(error);
	}
}

/**
 * Updates an item and its images in one transaction. Returns the images it no
 * longer has (marked removed) so the caller can delete the assets.
 *
 * `version` is the `updatedAt` the edit started from: if the row changed since
 * (another save, a publish from the list), nothing is written and it throws a
 * stale CONFLICT. The row is locked while it's checked, so two saves of the
 * same version can't both pass.
 */
export async function updateTestCrud(
	db: Db,
	id: string,
	input: TestCrudInput,
	options: { userId: string; store: ImageStore | null; version: string; now?: Date },
): Promise<{ item: TestCrudDetail; removed: AttachmentRow[] }> {
	const now = options.now ?? new Date();
	try {
		const { row, removed } = await db.transaction(async (tx) => {
			const [current] = await tx
				.select({ publishedAt: testCrud.publishedAt, current: sameVersion(testCrud.updatedAt, options.version) })
				.from(testCrud)
				.where(eq(testCrud.id, id))
				.for("update");
			if (!current) throw notFound();
			if (!current.current) throw staleError("Test CRUD item");
			const [updated] = await tx
				.update(testCrud)
				.set({ ...fields(input), publishedAt: publishedAtFor(input.status, current.publishedAt, now) })
				.where(eq(testCrud.id, id))
				.returning();
			if (!updated) throw notFound();
			const dropped = await syncEntityAttachments(
				tx,
				{ entityType: ENTITY, entityId: id, ownerId: options.userId },
				input.images,
				now,
			);
			return { row: updated, removed: dropped };
		});
		const [item] = await withImages(db, options.store, [row], toDetail);
		if (!item) throw notFound();
		return { item, removed };
	} catch (error) {
		throw saveError(error);
	}
}

/** Publish / unpublish from the list (optimistic in the UI). */
export async function setTestCrudStatus(
	db: Db,
	id: string,
	status: TestCrudStatus,
	store: ImageStore | null,
	now = new Date(),
): Promise<TestCrudListItem> {
	const updated = await db.transaction(async (tx) => {
		const [current] = await tx
			.select({ publishedAt: testCrud.publishedAt })
			.from(testCrud)
			.where(eq(testCrud.id, id))
			.for("update");
		if (!current) throw notFound();
		const [row] = await tx
			.update(testCrud)
			.set({ status, publishedAt: publishedAtFor(status, current.publishedAt, now) })
			.where(eq(testCrud.id, id))
			.returning();
		if (!row) throw notFound();
		return row;
	});
	const [item] = await withImages(db, store, [updated], toListItem);
	if (!item) throw notFound();
	return item;
}

/** Deletes rows; their images are marked removed (returned, for asset deletion). */
export async function deleteTestCrud(
	db: Db,
	ids: ReadonlyArray<string>,
): Promise<{ deleted: number; removed: AttachmentRow[] }> {
	return db.transaction(async (tx) => {
		const deleted = await tx
			.delete(testCrud)
			.where(inArray(testCrud.id, [...ids]))
			.returning({ id: testCrud.id });
		const removed = await removeForEntities(
			tx,
			ENTITY,
			deleted.map((row) => row.id),
		);
		return { deleted: deleted.length, removed };
	});
}

// ---------------------------------------------------------------------------
// Public queries: ONLY published rows ever leave these functions.
// ---------------------------------------------------------------------------

const isPublished = eq(testCrud.status, "published");

const toPublicCard = (row: Row, images: ReadonlyArray<ImageAsset>): PublicTestCrudCard => ({
	slug: row.slug,
	title: row.title,
	summary: row.summary,
	price: row.price,
	tags: row.tags,
	image: images[0] ?? null,
	// Published rows always have a date; fall back defensively for hand-edited data.
	publishedAt: (row.publishedAt ?? row.updatedAt).toISOString(),
});

export async function listPublishedTestCrud(
	db: Db,
	input: { q: string; page: number },
	pageSize: number,
	store: ImageStore | null,
): Promise<PublicTestCrudPage> {
	const where = allOf(isPublished, textSearch(input.q, [testCrud.title, testCrud.summary]));
	const page = await paginate(
		{ page: input.page, pageSize },
		{
			count: () => countRows(db, testCrud, where),
			rows: ({ limit, offset }) =>
				db
					.select()
					.from(testCrud)
					.where(where)
					.orderBy(desc(testCrud.publishedAt), asc(testCrud.id))
					.limit(limit)
					.offset(offset),
		},
		(row) => row,
	);
	return { ...page, items: await withImages(db, store, page.items, toPublicCard) };
}

/** A published item by slug, or null (missing and draft look the same to the public). */
export async function getPublishedTestCrud(
	db: Db,
	slug: string,
	store: ImageStore | null,
): Promise<PublicTestCrudDetail | null> {
	const [row] = await db
		.select()
		.from(testCrud)
		.where(and(eq(testCrud.slug, slug), isPublished));
	if (!row) return null;
	const [detail] = await withImages(db, store, [row], (item, images) => ({
		...toPublicCard(item, images),
		images: [...images],
		body: sanitizeRichText(item.body),
		phone: item.phone,
	}));
	return detail ?? null;
}

/** Every published item's slug and last change, newest first (the sitemap). */
export async function listPublishedTestCrudForSitemap(db: Db): Promise<Array<{ slug: string; updatedAt: Date }>> {
	return db
		.select({ slug: testCrud.slug, updatedAt: testCrud.updatedAt })
		.from(testCrud)
		.where(isPublished)
		.orderBy(desc(testCrud.updatedAt), asc(testCrud.id));
}
