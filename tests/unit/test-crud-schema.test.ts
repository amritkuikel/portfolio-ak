import { afterEach, describe, expect, it } from "vitest";
import {
	imageUrl,
	slugify,
	TEST_CRUD_SEARCH_DEFAULTS,
	testCrudFormSchema,
	testCrudInputSchema,
	testCrudListInputSchema,
	testCrudSearchSchema,
} from "@/features/test-crud/schema";
import { overwriteGetLocale } from "@/paraglide/runtime";

afterEach(() => {
	overwriteGetLocale(() => "en");
});

const valid = {
	title: "Momo Kitchen",
	slug: "momo-kitchen",
	summary: "",
	body: "<p>Hi</p>",
	status: "draft",
	price: 100,
	phone: "",
	tags: [],
} as const;

const messages = (result: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }) =>
	Object.fromEntries((result.error?.issues ?? []).map((issue) => [issue.path.join("."), issue.message]));

describe("slugify", () => {
	it("makes lowercase ASCII slugs from Latin titles", () => {
		expect(slugify("Hello, World!")).toBe("hello-world");
		expect(slugify("  Café  Déjà vu -- 2026 ")).toBe("cafe-deja-vu-2026");
		expect(slugify("a".repeat(100))).toHaveLength(80);
	});

	it("returns an empty slug for non-Latin titles (the admin types one)", () => {
		expect(slugify("नेपाली मोमो")).toBe("");
	});
});

describe("testCrudInputSchema (shared by the form and the server)", () => {
	it("accepts a complete valid item", () => {
		expect(testCrudInputSchema.safeParse(valid).success).toBe(true);
	});

	it("reports localized field errors", () => {
		const result = testCrudInputSchema.safeParse({
			...valid,
			title: "",
			slug: "Bad Slug!",
			price: 1.234,
			phone: "+977123",
			status: "archived",
		});
		expect(messages(result)).toMatchObject({
			title: "This field is required.",
			slug: "Use lowercase letters, numbers and single hyphens, like my-first-item.",
			phone: "Enter a valid phone number.",
		});
		expect(Object.keys(messages(result))).toEqual(expect.arrayContaining(["price", "status"]));
	});

	it("reports in Nepali when the locale is ne", () => {
		overwriteGetLocale(() => "ne");
		expect(messages(testCrudInputSchema.safeParse({ ...valid, slug: "x".repeat(81) })).slug).toBe(
			"बढीमा ८० अक्षर प्रयोग गर्नुहोस्।",
		);
	});

	it("the form schema adds the image (type, size, max one)", () => {
		const big = new File([new Uint8Array(3 * 1024 * 1024)], "big.png", { type: "image/png" });
		const svg = new File(["<svg/>"], "x.svg", { type: "image/svg+xml" });
		const ok = new File(["x"], "x.webp", { type: "image/webp" });
		expect(testCrudFormSchema.safeParse({ ...valid, image: [ok], removeImage: false }).success).toBe(true);
		const result = testCrudFormSchema.safeParse({ ...valid, image: [big, svg], removeImage: false });
		expect(result.error?.issues.map((issue) => issue.message)).toEqual(
			expect.arrayContaining(["Choose at most 1 files.", "x.svg isn't an accepted file type."]),
		);
	});
});

describe("admin list search params", () => {
	it("fills defaults and corrects invalid values instead of failing", () => {
		expect(testCrudSearchSchema.parse({})).toEqual({ ...TEST_CRUD_SEARCH_DEFAULTS, pageSize: undefined });
		expect(
			testCrudSearchSchema.parse({ status: "archived", sort: "drop table", page: "-3", pageSize: "7", q: "  hi " }),
		).toEqual({ ...TEST_CRUD_SEARCH_DEFAULTS, q: "hi", pageSize: undefined });
		expect(
			testCrudSearchSchema.parse({ status: "published", sort: "-price", page: "4", pageSize: "50" }),
		).toMatchObject({
			status: "published",
			sort: "-price",
			page: 4,
			pageSize: 50,
		});
	});

	it("the server function input requires an allowed page size", () => {
		expect(testCrudListInputSchema.safeParse({ ...TEST_CRUD_SEARCH_DEFAULTS, pageSize: 20 }).success).toBe(true);
		expect(testCrudListInputSchema.safeParse({ ...TEST_CRUD_SEARCH_DEFAULTS, pageSize: 1000 }).success).toBe(false);
	});
});

describe("imageUrl", () => {
	it("points at the image route", () => {
		expect(imageUrl("abc")).toBe("/api/images/abc");
		expect(imageUrl(null)).toBeNull();
	});
});
