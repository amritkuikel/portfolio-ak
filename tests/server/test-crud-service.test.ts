import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { TestCrudInput } from "@/features/test-crud/schema";
import { confirmUpload } from "@/server/attachments/service";
import * as schema from "@/server/db/schema";
import {
	createItem,
	deleteItems,
	getItemOrThrow,
	getPublishedOrThrow,
	setItemStatus,
	updateItem,
} from "@/server/test-crud/service";
import { createFakeCloudinary } from "../utils/fake-cloudinary";
import { createTestDb } from "../utils/test-db";

/**
 * The Test CRUD server functions' work (src/server/test-crud/service.ts) against
 * a real Postgres (PGlite) and the real Cloudinary client over a fake API. Auth
 * is the middleware's job (auth-middleware.test.ts) and every function is checked
 * to use it (guarded-functions.test.ts).
 */
const captureServerEvent = vi.hoisted(() => vi.fn(async () => {}));
vi.mock("@/server/analytics/posthog", () => ({ captureServerEvent }));

let testDb: Awaited<ReturnType<typeof createTestDb>>;
let cloud: ReturnType<typeof createFakeCloudinary>;
beforeAll(async () => {
	testDb = await createTestDb();
}, 60_000);
afterAll(() => testDb.close());
beforeEach(async () => {
	await testDb.reset();
	cloud = createFakeCloudinary();
	captureServerEvent.mockClear();
});

const input = (overrides: Partial<TestCrudInput> = {}): TestCrudInput => ({
	title: "Momo Kitchen",
	slug: "momo-kitchen",
	summary: "",
	body: "<p>Hi</p>",
	status: "draft",
	price: 100,
	phone: "",
	tags: [],
	images: [],
	...overrides,
});
/** The whole upload: sign, the browser's upload (fake), confirm. */
const upload = async () => {
	const ticket = cloud.store.signUpload("test-crud");
	cloud.put(ticket.publicId);
	const image = await confirmUpload(
		testDb.db,
		cloud.store,
		{ publicId: ticket.publicId, scope: "test-crud" },
		testDb.adminId,
	);
	return { id: image.id, alt: "", publicId: ticket.publicId };
};
const MISSING = "00000000-0000-4000-8000-000000000000";

describe("create", () => {
	it("saves the item with its uploaded images and records the event", async () => {
		const image = await upload();
		const created = await createItem(testDb.db, cloud.store, input({ images: [image] }), testDb.adminId);
		expect(created.images.map((item) => item.id)).toEqual([image.id]);
		expect(captureServerEvent).toHaveBeenCalledWith("test_crud_created", testDb.adminId, {
			item_id: created.id,
			status: "draft",
		});
	});

	it("reports NOT_FOUND for unknown items", async () => {
		await expect(getItemOrThrow(testDb.db, cloud.store, MISSING)).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});

describe("update", () => {
	it("updates fields, and deletes the assets of images it dropped from Cloudinary at once", async () => {
		const [kept, dropped] = [await upload(), await upload()];
		const created = await createItem(testDb.db, cloud.store, input({ images: [kept, dropped] }), testDb.adminId);
		const updated = await updateItem(
			testDb.db,
			cloud.store,
			{ ...input({ title: "Renamed", images: [kept] }), id: created.id },
			testDb.adminId,
		);
		expect(updated).toMatchObject({ title: "Renamed" });
		expect(updated.images.map((image) => image.id)).toEqual([kept.id]);
		expect(cloud.destroyed).toEqual([dropped.publicId]);
		// The row is gone too, once the asset is.
		expect(await testDb.db.select().from(schema.attachment).where(eq(schema.attachment.id, dropped.id))).toEqual([]);
		expect(captureServerEvent).toHaveBeenLastCalledWith("test_crud_updated", testDb.adminId, {
			item_id: created.id,
			change: "edit",
		});
	});

	it("keeps the removed row for the scheduled cleanup when Cloudinary is unreachable", async () => {
		const image = await upload();
		const created = await createItem(testDb.db, cloud.store, input({ images: [image] }), testDb.adminId);
		cloud.failDestroy();
		await updateItem(testDb.db, cloud.store, { ...input(), id: created.id }, testDb.adminId);
		const [row] = await testDb.db.select().from(schema.attachment).where(eq(schema.attachment.id, image.id));
		expect(row?.deletedAt).toBeInstanceOf(Date);
	});

	it("reports NOT_FOUND for an unknown id and records nothing", async () => {
		await expect(updateItem(testDb.db, cloud.store, { ...input(), id: MISSING }, testDb.adminId)).rejects.toMatchObject(
			{
				code: "NOT_FOUND",
			},
		);
		expect(captureServerEvent).not.toHaveBeenCalled();
	});
});

describe("status, delete and reads", () => {
	it("publishes, records the status change and makes the item public", async () => {
		const created = await createItem(testDb.db, cloud.store, input(), testDb.adminId);
		await expect(getPublishedOrThrow(testDb.db, cloud.store, "momo-kitchen")).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
		const published = await setItemStatus(
			testDb.db,
			cloud.store,
			{ id: created.id, status: "published" },
			testDb.adminId,
		);
		expect(published.status).toBe("published");
		expect(captureServerEvent).toHaveBeenLastCalledWith("test_crud_updated", testDb.adminId, {
			item_id: created.id,
			change: "status",
			status: "published",
		});
		expect((await getPublishedOrThrow(testDb.db, cloud.store, "momo-kitchen")).title).toBe("Momo Kitchen");
		expect((await getItemOrThrow(testDb.db, cloud.store, created.id)).status).toBe("published");
	});

	it("deletes items with their images' assets, records the count, and stays silent when nothing matched", async () => {
		const image = await upload();
		const a = await createItem(testDb.db, cloud.store, input({ slug: "a", images: [image] }), testDb.adminId);
		const b = await createItem(testDb.db, cloud.store, input({ slug: "b" }), testDb.adminId);
		captureServerEvent.mockClear();
		expect(await deleteItems(testDb.db, cloud.store, [a.id, b.id, MISSING], testDb.adminId)).toEqual({ deleted: 2 });
		expect(cloud.destroyed).toEqual([image.publicId]);
		expect(captureServerEvent).toHaveBeenCalledWith("test_crud_deleted", testDb.adminId, { count: 2 });
		captureServerEvent.mockClear();
		expect(await deleteItems(testDb.db, cloud.store, [MISSING], testDb.adminId)).toEqual({ deleted: 0 });
		expect(captureServerEvent).not.toHaveBeenCalled();
	});
});
