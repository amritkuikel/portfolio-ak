import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Permission } from "@/features/rbac/permissions";
import { TEST_CRUD_IMAGE_MAX_BYTES } from "@/features/test-crud/constants";
import { AppError } from "@/lib/errors";
import { sniffImageType, validateImage } from "@/server/test-crud/image";

/**
 * Permission-guarded server function files and each function's required
 * permission, in file order. Add a new feature's functions file here (README,
 * "Test CRUD: the template for new features", step 4).
 */
const GUARDED_FUNCTIONS: Record<string, ReadonlyArray<[name: string, permission: Permission]>> = {
	"src/functions/test-crud.ts": [
		["listTestCrud", "test-crud:read"],
		["listTestCrudTags", "test-crud:read"],
		["getTestCrud", "test-crud:read"],
		["createTestCrud", "test-crud:create"],
		["updateTestCrud", "test-crud:update"],
		["setTestCrudStatusFn", "test-crud:publish"],
		["deleteTestCrudFn", "test-crud:delete"],
	],
	"src/functions/rbac.ts": [
		["listRoles", "roles:read"],
		["listRoleOptions", "users:read"],
		["createRole", "roles:manage"],
		["updateRole", "roles:manage"],
		["deleteRole", "roles:manage"],
		["updateRolePermissions", "roles:manage"],
		["listUsers", "users:read"],
		["setUserRoles", "users:update"],
		["setUserBanned", "users:ban"],
	],
};

describe("guarded server functions", () => {
	// The middleware itself is tested in auth-middleware.test.ts (anonymous -> UNAUTHORIZED,
	// missing permission -> FORBIDDEN). This guards that no function skips it or checks
	// the wrong permission. The live 403 replay is recorded in docs/decisions.md 0095.
	for (const [file, expected] of Object.entries(GUARDED_FUNCTIONS)) {
		it(`every function in ${file} runs requirePermission with its permission first`, () => {
			const definitions = readFileSync(file, "utf8")
				.split("export const ")
				.slice(1)
				.filter((d) => d.includes("createServerFn("));
			expect(definitions.map((definition) => definition.split(" ")[0])).toEqual(expected.map(([name]) => name));
			for (const [index, definition] of definitions.entries()) {
				const permission = expected[index]?.[1];
				expect(definition).toMatch(
					new RegExp(
						`= createServerFn\\(\\{ method: "(GET|POST)" \\}\\)\\s*\\.middleware\\(\\[requirePermission\\("${permission}"\\)\\]\\)`,
					),
				);
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
