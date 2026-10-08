import { describe, expect, it } from "vitest";
import { parseSaveForm, parseUpdateForm, toFormData } from "@/features/test-crud/form-data";
import type { TestCrudFormValues } from "@/features/test-crud/schema";
import { AppError } from "@/lib/errors";

/** The create/update wire format: what the form sends is exactly what the server accepts. */
const values = (overrides: Partial<TestCrudFormValues> = {}): TestCrudFormValues => ({
	title: "Momo Kitchen",
	slug: "momo-kitchen",
	summary: "",
	body: "<p>Hi</p>",
	status: "draft",
	price: 1250.5,
	phone: "",
	tags: ["food"],
	image: [],
	removeImage: false,
	...overrides,
});
const ID = "6f1c0a52-0b6c-4c43-9a55-1f4a6f0d0001";

const failure = (run: () => unknown) => {
	try {
		run();
	} catch (error) {
		return error;
	}
	throw new Error("expected an error");
};

describe("toFormData -> parseSaveForm", () => {
	it("round-trips the fields, the file and the remove flag", () => {
		const file = new File(["x"], "a.png", { type: "image/png" });
		const parsed = parseSaveForm(toFormData(values({ image: [file], removeImage: true })));
		expect(parsed.input).toEqual({
			title: "Momo Kitchen",
			slug: "momo-kitchen",
			summary: "",
			body: "<p>Hi</p>",
			status: "draft",
			price: 1250.5,
			phone: "",
			tags: ["food"],
		});
		expect(parsed.image?.name).toBe("a.png");
		expect(parsed.removeImage).toBe(true);
	});

	it("treats a missing or empty file as no image", () => {
		expect(parseSaveForm(toFormData(values())).image).toBeNull();
		const form = toFormData(values());
		form.set("image", new File([], "empty.png"));
		expect(parseSaveForm(form).image).toBeNull();
	});

	it("rejects what isn't FormData, malformed JSON and invalid fields with BAD_REQUEST", () => {
		expect(failure(() => parseSaveForm({ title: "x" }))).toMatchObject({ code: "BAD_REQUEST" });
		const malformed = new FormData();
		malformed.set("data", "{not json");
		expect(failure(() => parseSaveForm(malformed))).toMatchObject({
			code: "BAD_REQUEST",
			message: "Malformed data field",
		});

		const invalid = failure(() => parseSaveForm(toFormData(values({ slug: "Bad Slug", title: "" }))));
		expect(invalid).toBeInstanceOf(AppError);
		expect((invalid as AppError).fieldErrors).toMatchObject({
			slug: [expect.stringContaining("lowercase")],
			title: ["This field is required."],
		});
	});
});

describe("parseUpdateForm", () => {
	it("adds a validated id", () => {
		expect(parseUpdateForm(toFormData(values(), ID)).id).toBe(ID);
	});

	it("rejects a missing or malformed id", () => {
		expect(failure(() => parseUpdateForm(toFormData(values())))).toMatchObject({ code: "BAD_REQUEST" });
		expect(failure(() => parseUpdateForm(toFormData(values(), "../etc/passwd")))).toMatchObject({
			code: "BAD_REQUEST",
		});
	});
});
