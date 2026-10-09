import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Permission } from "@/features/rbac/permissions";

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
	"src/functions/attachments.ts": [
		["getUploadSettings", "attachments:upload"],
		["signImageUpload", "attachments:upload"],
		["confirmImageUpload", "attachments:upload"],
		["discardImageUpload", "attachments:upload"],
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
