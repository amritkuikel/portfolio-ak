import { afterEach, describe, expect, it } from "vitest";
import { slugify, testCrudFormSchema, testCrudInputSchema, toTestCrudInput } from "@/features/test-crud/schema";
import { TEST_CRUD_SEARCH_DEFAULTS, testCrudListInputSchema, testCrudSearchSchema } from "@/features/test-crud/search";
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
	images: [],
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

	it("images are attachment ids with alt text, at most 8, and the form's previews never reach the server", () => {
		const id = "6f1c0a52-0b6c-4c43-9a55-1f4a6f0d0001";
		const preview = {
			id,
			alt: "",
			width: 1,
			height: 1,
			full: { src: "x", srcSet: "x" },
			cover: { src: "x", srcSet: "x" },
			thumb: "x",
			og: "x",
		};
		const form = testCrudFormSchema.parse({ ...valid, images: [{ id, alt: " Momo ", preview }] });
		expect(toTestCrudInput(form).images).toEqual([{ id, alt: "Momo" }]);
		expect(testCrudInputSchema.safeParse({ ...valid, images: [{ id: "nope", alt: "" }] }).success).toBe(false);
		const nine = Array.from({ length: 9 }, () => ({ id, alt: "" }));
		expect(testCrudInputSchema.safeParse({ ...valid, images: nine }).success).toBe(false);
		expect(testCrudInputSchema.safeParse({ ...valid, images: [{ id, alt: "x".repeat(201) }] }).success).toBe(false);
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
