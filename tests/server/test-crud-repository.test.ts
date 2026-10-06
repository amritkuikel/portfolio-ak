import { PGlite } from "@electric-sql/pglite";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { TestCrudInput } from "@/features/test-crud/schema";
import { AppError } from "@/lib/errors";
import * as schema from "@/server/db/schema";
import type { ValidImage } from "@/server/test-crud/image";
import {
	createTestCrud,
	type Db,
	deleteTestCrud,
	getImage,
	getTestCrud,
	listTestCrud,
	setTestCrudStatus,
	updateTestCrud,
} from "@/server/test-crud/repository";

/**
 * Runs the repository against a real (in-process) Postgres with the committed
 * migrations applied, so SQL, constraints and transactions are what production sees.
 */
let client: PGlite;
let db: Db;
const USER_ID = "admin-1";

beforeAll(async () => {
	client = new PGlite();
	const pglite = drizzle({ client, schema, casing: "snake_case" });
	await migrate(pglite, { migrationsFolder: "./drizzle" });
	db = pglite;
	await db.insert(schema.user).values({ id: USER_ID, name: "Admin", email: "admin@example.com", role: "admin" });
});
afterAll(() => client.close());
beforeEach(async () => {
	await db.delete(schema.testCrud);
	await db.delete(schema.testCrudImage);
});

const input = (overrides: Partial<TestCrudInput> = {}): TestCrudInput => ({
	title: "First item",
	slug: "first-item",
	summary: "Short summary",
	body: "<p>Hello</p>",
	status: "draft",
	price: 1250.5,
	phone: "+9779812345678",
	tags: ["nepal", "demo"],
	...overrides,
});
const png = (): ValidImage => ({ mimeType: "image/png", data: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]) });
const imageRows = async () => (await db.select({ total: count() }).from(schema.testCrudImage))[0]?.total;

describe("create and read", () => {
	it("stores every column, sanitizes the body and links the creator and image", async () => {
		const created = await createTestCrud(db, input({ body: '<p onclick="x()">Hi<script>alert(1)</script></p>' }), {
			image: png(),
			userId: USER_ID,
		});
		expect(created).toMatchObject({
			title: "First item",
			slug: "first-item",
			status: "draft",
			price: 1250.5,
			phone: "+9779812345678",
			tags: ["nepal", "demo"],
			body: "<p>Hi</p>",
			publishedAt: null,
		});
		expect(created.imageUrl).toMatch(/^\/api\/images\/[0-9a-f-]{36}$/);
		const [row] = await db.select().from(schema.testCrud).where(eq(schema.testCrud.id, created.id));
		expect(row?.createdBy).toBe(USER_ID);
		expect(row?.body).toBe("<p>Hi</p>");
		const image = await getImage(db, created.imageUrl?.split("/").pop() ?? "");
		expect(image?.mimeType).toBe("image/png");
		expect([...(image?.data ?? [])]).toEqual([...png().data]);
		expect(await getTestCrud(db, created.id)).toEqual(created);
	});

	it("sets published_at when created as published", async () => {
		const now = new Date("2026-10-01T10:00:00Z");
		const created = await createTestCrud(db, input({ status: "published" }), { image: null, userId: USER_ID, now });
		expect(created.publishedAt).toBe(now.toISOString());
	});

	it("rejects a duplicate slug with a CONFLICT field error", async () => {
		await createTestCrud(db, input(), { image: null, userId: USER_ID });
		const error = await createTestCrud(db, input({ title: "Other" }), { image: null, userId: USER_ID }).catch(
			(caught: unknown) => caught,
		);
		expect(error).toBeInstanceOf(AppError);
		expect(error).toMatchObject({ code: "CONFLICT", fieldErrors: { slug: ["Another item already uses this slug."] } });
		// The failed transaction stored no image either.
		expect(await imageRows()).toBe(0);
	});

	it("returns null for unknown ids", async () => {
		expect(await getTestCrud(db, "00000000-0000-4000-8000-000000000000")).toBeNull();
	});
});

describe("listTestCrud", () => {
	beforeEach(async () => {
		const items: Array<[string, TestCrudInput["status"], number]> = [
			["Alpha apples", "published", 300],
			["Beta bananas", "draft", 100],
			["Gamma grapes 100%", "published", 200],
			["Delta dates", "draft", 50],
			["Epsilon eggplant", "published", 400],
		];
		for (const [index, [title, status, price]] of items.entries()) {
			await createTestCrud(db, input({ title, slug: `item-${index}`, status, price, summary: "" }), {
				image: null,
				userId: USER_ID,
				now: new Date(Date.UTC(2026, 0, index + 1)),
			});
		}
	});
	const list = (overrides: Partial<Parameters<typeof listTestCrud>[1]> = {}) =>
		listTestCrud(db, { q: "", status: "all", sort: "title", page: 1, pageSize: 10, ...overrides });

	it("paginates with totals and clamps out-of-range pages", async () => {
		const first = await list({ pageSize: 2 });
		expect(first).toMatchObject({ total: 5, page: 1, pageCount: 3 });
		expect(first.items.map((item) => item.title)).toEqual(["Alpha apples", "Beta bananas"]);
		const clamped = await list({ pageSize: 2, page: 99 });
		expect(clamped.page).toBe(3);
		expect(clamped.items.map((item) => item.title)).toEqual(["Gamma grapes 100%"]);
	});

	it("sorts by title, price and update time in both directions", async () => {
		expect((await list({ sort: "-title" })).items[0]?.title).toBe("Gamma grapes 100%");
		expect((await list({ sort: "price" })).items.map((item) => item.price)).toEqual([50, 100, 200, 300, 400]);
		expect((await list({ sort: "-price" })).items[0]?.price).toBe(400);
	});

	it("filters by status and searches case-insensitively, treating % and _ literally", async () => {
		expect((await list({ status: "draft" })).items.map((item) => item.title)).toEqual(["Beta bananas", "Delta dates"]);
		expect((await list({ q: "GRAPES" })).items.map((item) => item.title)).toEqual(["Gamma grapes 100%"]);
		expect((await list({ q: "100%" })).total).toBe(1);
		expect((await list({ q: "%" })).total).toBe(1);
		expect((await list({ q: "item-3" })).items.map((item) => item.title)).toEqual(["Delta dates"]);
		expect((await list({ q: "zzz" })).total).toBe(0);
	});
});

describe("update, status and delete", () => {
	it("updates fields and replaces the image, deleting the old one", async () => {
		const created = await createTestCrud(db, input(), { image: png(), userId: USER_ID });
		const updated = await updateTestCrud(db, created.id, input({ title: "Renamed", tags: [] }), {
			image: { kind: "replace", image: { mimeType: "image/webp", data: new Uint8Array([1]) } },
		});
		expect(updated).toMatchObject({ title: "Renamed", tags: [] });
		expect(updated.imageUrl).not.toBe(created.imageUrl);
		expect(await imageRows()).toBe(1);
		const removed = await updateTestCrud(db, created.id, input(), { image: { kind: "remove" } });
		expect(removed.imageUrl).toBeNull();
		expect(await imageRows()).toBe(0);
	});

	it("keeps the first publish date while published and clears it on unpublish", async () => {
		const created = await createTestCrud(db, input(), { image: null, userId: USER_ID });
		const first = new Date("2026-02-01T00:00:00Z");
		expect((await setTestCrudStatus(db, created.id, "published", first)).publishedAt).toBe(first.toISOString());
		const edited = await updateTestCrud(db, created.id, input({ status: "published" }), {
			image: { kind: "keep" },
			now: new Date("2026-03-01T00:00:00Z"),
		});
		expect(edited.publishedAt).toBe(first.toISOString());
		expect((await setTestCrudStatus(db, created.id, "draft")).publishedAt).toBeNull();
	});

	it("reports NOT_FOUND for unknown ids", async () => {
		const missing = "00000000-0000-4000-8000-000000000000";
		await expect(setTestCrudStatus(db, missing, "published")).rejects.toMatchObject({ code: "NOT_FOUND" });
		await expect(updateTestCrud(db, missing, input(), { image: { kind: "keep" } })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("deletes one or many rows with their images and reports the count", async () => {
		const a = await createTestCrud(db, input({ slug: "a" }), { image: png(), userId: USER_ID });
		const b = await createTestCrud(db, input({ slug: "b" }), { image: png(), userId: USER_ID });
		const c = await createTestCrud(db, input({ slug: "c" }), { image: null, userId: USER_ID });
		expect(await deleteTestCrud(db, [a.id, b.id, "00000000-0000-4000-8000-000000000000"])).toBe(2);
		expect(await imageRows()).toBe(0);
		expect(await getTestCrud(db, c.id)).not.toBeNull();
	});
});
