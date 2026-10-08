import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TEST_CRUD_IMAGE_MAX_BYTES } from "@/features/test-crud/constants";
import { AppError } from "@/lib/errors";
import { sniffImageType, validateImage } from "@/server/test-crud/image";

/**
 * Admin-only server function files. Add a new feature's admin functions file here
 * (README, "Test CRUD: the template for new features", step 4).
 */
const ADMIN_FUNCTION_FILES: Record<string, number> = { "src/functions/test-crud.ts": 6 };

describe("admin server functions", () => {
	// The middleware itself is tested in auth-middleware.test.ts (anonymous -> UNAUTHORIZED,
	// user -> FORBIDDEN). This guards that no admin function skips it. The live check
	// (401/403 over HTTP) is recorded in docs/decisions.md 0070.
	for (const [file, expected] of Object.entries(ADMIN_FUNCTION_FILES)) {
		it(`every function in ${file} runs requireAdminMiddleware first`, () => {
			const definitions = readFileSync(file, "utf8").split("createServerFn(").slice(1);
			expect(definitions.length).toBe(expected);
			for (const definition of definitions) {
				expect(definition).toMatch(/^\{ method: "(GET|POST)" \}\)\s*\.middleware\(\[requireAdminMiddleware\]\)/);
			}
		});
	}
});

describe("image validation", () => {
	const bytes = (...values: number[]) => new Uint8Array(values);

	it("detects PNG, JPEG and WebP from their signatures", () => {
		expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe("image/png");
		expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
		expect(sniffImageType(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50))).toBe("image/webp");
		expect(sniffImageType(bytes(0x3c, 0x73, 0x76, 0x67))).toBeNull(); // "<svg"
	});

	it("ignores the claimed type: an HTML file named .png is rejected", async () => {
		const fake = new File(["<script>alert(1)</script>"], "cat.png", { type: "image/png" });
		const error = await validateImage(fake).catch((caught: unknown) => caught);
		expect(error).toBeInstanceOf(AppError);
		expect(error).toMatchObject({
			code: "BAD_REQUEST",
			fieldErrors: { image: ["cat.png isn't an accepted file type."] },
		});
	});

	it("rejects files over the size limit before reading them", async () => {
		const big = new File([new Uint8Array(TEST_CRUD_IMAGE_MAX_BYTES + 1)], "big.png", { type: "image/png" });
		await expect(validateImage(big)).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});

	it("accepts a real PNG and reports the sniffed type", async () => {
		const file = new File([bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2)], "x.bin", { type: "" });
		expect((await validateImage(file)).mimeType).toBe("image/png");
	});
});
