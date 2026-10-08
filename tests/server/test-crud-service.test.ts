import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { SaveInput } from "@/features/test-crud/form-data";
import type { TestCrudInput } from "@/features/test-crud/schema";
import {
	createItem,
	deleteItems,
	getItemOrThrow,
	getPublishedOrThrow,
	imageChangeFor,
	setItemStatus,
	updateItem,
} from "@/server/test-crud/service";
import { createTestDb, pngFile } from "../utils/test-db";

/**
 * The Test CRUD server functions' work (src/server/test-crud/service.ts) against
 * a real Postgres (PGlite). Auth is the middleware's job (auth-middleware.test.ts)
 * and every Test CRUD function is checked to use it (test-crud-functions.test.ts).
 */
const captureServerEvent = vi.hoisted(() => vi.fn(async () => {}));
vi.mock("@/server/analytics/posthog", () => ({ captureServerEvent }));

let testDb: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => {
	testDb = await createTestDb();
}, 60_000);
afterAll(() => testDb.close());
beforeEach(async () => {
	await testDb.reset();
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
	...overrides,
});
const save = (overrides: Partial<SaveInput> = {}): SaveInput => ({
	input: input(),
	image: null,
	removeImage: false,
	...overrides,
});
const MISSING = "00000000-0000-4000-8000-000000000000";

describe("create", () => {
	it("validates and stores the image, saves the item and records the event", async () => {
		const created = await createItem(testDb.db, save({ image: pngFile() }), testDb.adminId);
		expect(created.imageUrl).toMatch(/^\/api\/images\//);
		expect(captureServerEvent).toHaveBeenCalledWith("test_crud_created", testDb.adminId, {
			item_id: created.id,
			status: "draft",
		});
	});

	it("rejects a disguised file before anything is stored", async () => {
		const fake = new File(["<html>"], "cat.png", { type: "image/png" });
		await expect(createItem(testDb.db, save({ image: fake }), testDb.adminId)).rejects.toMatchObject({
			code: "BAD_REQUEST",
			fieldErrors: { image: ["cat.png isn't an accepted file type."] },
		});
		await expect(getItemOrThrow(testDb.db, MISSING)).rejects.toMatchObject({ code: "NOT_FOUND" });
		expect(captureServerEvent).not.toHaveBeenCalled();
	});
});

describe("update", () => {
	it("chooses replace, remove or keep for the image", async () => {
		expect((await imageChangeFor(save({ image: pngFile() }))).kind).toBe("replace");
		expect((await imageChangeFor(save({ removeImage: true }))).kind).toBe("remove");
		// A new file wins over the remove flag.
		expect((await imageChangeFor(save({ image: pngFile(), removeImage: true }))).kind).toBe("replace");
		expect((await imageChangeFor(save())).kind).toBe("keep");
	});

	it("updates fields and image, and records the edit", async () => {
		const created = await createItem(testDb.db, save({ image: pngFile() }), testDb.adminId);
		const updated = await updateItem(
			testDb.db,
			{ ...save({ input: input({ title: "Renamed" }), removeImage: true }), id: created.id },
			testDb.adminId,
		);
		expect(updated).toMatchObject({ title: "Renamed", imageUrl: null });
		expect(captureServerEvent).toHaveBeenLastCalledWith("test_crud_updated", testDb.adminId, {
			item_id: created.id,
			change: "edit",
		});
	});

	it("reports NOT_FOUND for an unknown id and records nothing", async () => {
		await expect(updateItem(testDb.db, { ...save(), id: MISSING }, testDb.adminId)).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
		expect(captureServerEvent).not.toHaveBeenCalled();
	});
});

describe("status, delete and reads", () => {
	it("publishes, records the status change and makes the item public", async () => {
		const created = await createItem(testDb.db, save(), testDb.adminId);
		await expect(getPublishedOrThrow(testDb.db, "momo-kitchen")).rejects.toMatchObject({ code: "NOT_FOUND" });
		const published = await setItemStatus(testDb.db, { id: created.id, status: "published" }, testDb.adminId);
		expect(published.status).toBe("published");
		expect(captureServerEvent).toHaveBeenLastCalledWith("test_crud_updated", testDb.adminId, {
			item_id: created.id,
			change: "status",
			status: "published",
		});
		expect((await getPublishedOrThrow(testDb.db, "momo-kitchen")).title).toBe("Momo Kitchen");
		expect((await getItemOrThrow(testDb.db, created.id)).status).toBe("published");
	});

	it("deletes, records the count, and stays silent when nothing matched", async () => {
		const a = await createItem(testDb.db, save({ input: input({ slug: "a" }) }), testDb.adminId);
		const b = await createItem(testDb.db, save({ input: input({ slug: "b" }) }), testDb.adminId);
		captureServerEvent.mockClear();
		expect(await deleteItems(testDb.db, [a.id, b.id, MISSING], testDb.adminId)).toEqual({ deleted: 2 });
		expect(captureServerEvent).toHaveBeenCalledWith("test_crud_deleted", testDb.adminId, { count: 2 });
		captureServerEvent.mockClear();
		expect(await deleteItems(testDb.db, [MISSING], testDb.adminId)).toEqual({ deleted: 0 });
		expect(captureServerEvent).not.toHaveBeenCalled();
	});
});
