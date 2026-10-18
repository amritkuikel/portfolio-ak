import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Permission } from "@/features/rbac/permissions";

/**
 * Every server function file is declared here, so a new one can't ship unguarded
 * by accident: a file in src/functions/ that is in neither list fails the test.
 *
 * GUARDED_FUNCTIONS: each function and the permission it requires, in file order.
 * Add a new feature's functions file here (README, "Test CRUD: the template for
 * new features", step 4).
 */
const GUARDED_FUNCTIONS: Record<string, ReadonlyArray<[name: string, permission: Permission]>> = {
	"test-crud.ts": [
		["listTestCrud", "test-crud:read"],
		["listTestCrudTags", "test-crud:read"],
		["getTestCrud", "test-crud:read"],
		["createTestCrud", "test-crud:create"],
		["updateTestCrud", "test-crud:update"],
		["setTestCrudStatusFn", "test-crud:publish"],
		["deleteTestCrudFn", "test-crud:delete"],
	],
	"rbac.ts": [
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
	"attachments.ts": [
		["getUploadSettings", "attachments:upload"],
		["signImageUpload", "attachments:upload"],
		["confirmImageUpload", "attachments:upload"],
		["discardImageUpload", "attachments:upload"],
	],
	"examples-permissions.ts": [
		["exampleReadItems", "test-crud:read"],
		["exampleManageRoles", "roles:manage"],
	],
};

/**
 * Files whose functions deliberately don't require a permission, with why, and
 * the functions they hold (adding one to these files also needs a look here).
 */
const UNGUARDED_FILES: Record<string, { why: string; functions: ReadonlyArray<string> }> = {
	"auth.ts": {
		why: "the session itself; per-user functions use requireUserMiddleware, the admin gate requireAdminAccessMiddleware",
		functions: ["getSession", "getAuthFeatures", "ensureAdminAccess", "listMySessions", "revokeMySession"],
	},
	"test-crud-public.ts": {
		why: "public reads; the repository only returns published rows",
		functions: ["listPublicTestCrud", "getPublicTestCrud"],
	},
	"stack.ts": { why: "public /stack page data (static)", functions: ["listStack", "getStackStats"] },
	"health.ts": { why: "public health check", functions: ["getDbHealth"] },
	"feature-flags.ts": { why: "public feature flags for the current visitor", functions: ["getHomeFlags"] },
	"dev.ts": { why: "dev-only, refuses in production", functions: ["previewRichText"] },
	"examples.ts": {
		why: "dev-only /dev/examples, devOnlyMiddleware on each",
		functions: [
			"getExampleSnapshot",
			"getSlowExample",
			"listExampleTasks",
			"getExampleTask",
			"setExampleTasksDone",
			"deleteExampleTasks",
			"resetExampleTasks",
			"submitExampleSignup",
			"failExample",
		],
	},
};

const DIR = "src/functions";

/** The exported server functions of a file, in order, with their source. */
const serverFunctions = (file: string) =>
	readFileSync(`${DIR}/${file}`, "utf8")
		.split("export const ")
		.slice(1)
		.filter((definition) => definition.includes("createServerFn("))
		.map((definition) => ({ name: definition.split(" ")[0] ?? "", definition }));

describe("guarded server functions", () => {
	it("every file in src/functions is declared as guarded or deliberately unguarded", () => {
		const files = readdirSync(DIR).filter((file) => file.endsWith(".ts"));
		const declared = [...Object.keys(GUARDED_FUNCTIONS), ...Object.keys(UNGUARDED_FILES)];
		expect(files.filter((file) => !declared.includes(file))).toEqual([]);
		expect(declared.filter((file) => !files.includes(file))).toEqual([]);
	});

	// The middleware itself is tested in auth-middleware.test.ts (anonymous -> UNAUTHORIZED,
	// missing permission -> FORBIDDEN). This guards that no function skips it or checks
	// the wrong permission. The live 403 replay is recorded in docs/decisions.md 0095.
	for (const [file, expected] of Object.entries(GUARDED_FUNCTIONS)) {
		it(`every function in ${file} runs requirePermission with its permission first`, () => {
			const functions = serverFunctions(file);
			expect(functions.map((fn) => fn.name)).toEqual(expected.map(([name]) => name));
			for (const [index, { definition }] of functions.entries()) {
				const permission = expected[index]?.[1];
				expect(definition).toMatch(
					new RegExp(
						`= createServerFn\\(\\{ method: "(GET|POST)" \\}\\)\\s*\\.middleware\\(\\[requirePermission\\("${permission}"\\)\\]\\)`,
					),
				);
			}
		});
	}

	for (const [file, { functions }] of Object.entries(UNGUARDED_FILES)) {
		it(`${file} holds only its declared functions`, () => {
			expect(serverFunctions(file).map((fn) => fn.name)).toEqual(functions);
		});
	}
});
