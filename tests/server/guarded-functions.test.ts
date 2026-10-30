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
		["isTestCrudSlugFree", "test-crud:read"],
		["createTestCrud", "test-crud:create"],
		["updateTestCrud", "test-crud:update"],
		["setTestCrudStatus", "test-crud:publish"],
		["deleteTestCrud", "test-crud:delete"],
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
		["revokeUserSessions", "users:ban"],
		["isUserEmailFree", "users:invite"],
		["inviteUser", "users:invite"],
		// Admins only on top: the service refuses everyone else (decisions.md 0134).
		["impersonateUser", "users:update"],
	],
	"audit.ts": [["listAuditEvents", "audit:read"]],
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
	// portfolio:start
	"portfolio.ts": [
		["getPortfolioProfile", "portfolio:read"],
		["updatePortfolioProfile", "portfolio:write"],
		["listProjects", "portfolio:read"],
		["listProjectOrder", "portfolio:read"],
		["getProject", "portfolio:read"],
		["isProjectSlugFree", "portfolio:read"],
		["createProject", "portfolio:write"],
		["updateProject", "portfolio:write"],
		["setProjectStatus", "portfolio:publish"],
		["deleteProjects", "portfolio:write"],
		["reorderProjects", "portfolio:write"],
		["listPosts", "portfolio:read"],
		["getPost", "portfolio:read"],
		["isPostSlugFree", "portfolio:read"],
		["createPost", "portfolio:write"],
		["updatePost", "portfolio:write"],
		["setPostStatus", "portfolio:publish"],
		["deletePosts", "portfolio:write"],
	],
	"portfolio-sections.ts": [
		["listExperience", "portfolio:read"],
		["createExperience", "portfolio:write"],
		["updateExperience", "portfolio:write"],
		["deleteExperience", "portfolio:write"],
		["reorderExperience", "portfolio:write"],
		["listSkills", "portfolio:read"],
		["createSkill", "portfolio:write"],
		["updateSkill", "portfolio:write"],
		["deleteSkills", "portfolio:write"],
		["reorderSkills", "portfolio:write"],
		["listProcessSteps", "portfolio:read"],
		["createProcessStep", "portfolio:write"],
		["updateProcessStep", "portfolio:write"],
		["deleteProcessSteps", "portfolio:write"],
		["reorderProcessSteps", "portfolio:write"],
		["listTestimonials", "portfolio:read"],
		["createTestimonial", "portfolio:write"],
		["updateTestimonial", "portfolio:write"],
		["deleteTestimonials", "portfolio:write"],
		["reorderTestimonials", "portfolio:write"],
	],
	"portfolio-messages.ts": [
		["listContactMessages", "messages:read"],
		["setContactMessageState", "messages:manage"],
		["deleteContactMessages", "messages:manage"],
	],
	"media.ts": [
		["listMedia", "media:read"],
		["updateMediaAlt", "media:write"],
		["deleteMedia", "media:write"],
	],
	// portfolio:end
	// apps:start
	"apps/admin.ts": [["getAppsUsage", "apps:read"]],
	"apps/links-admin.ts": [
		["listLinksForModeration", "links:moderate"],
		["setLinksBlocked", "links:moderate"],
		["deleteModeratedLinks", "links:moderate"],
	],
	// apps:end
	// @new-feature:guarded-functions
};

// apps:start
/**
 * The showcase apps' files (decision 0187): every function runs `requireAppUser` then
 * `withAppServices` first. No permission is involved (guests use the apps too); each
 * service scopes every read and write to the caller's own rows (`ownedBy`, tested in
 * tests/server/apps-kanban.test.ts).
 */
const APP_FUNCTIONS: Record<string, ReadonlyArray<string>> = {
	"apps/kanban.ts": [
		"listKanbanBoards",
		"getKanbanBoard",
		"createKanbanBoard",
		"renameKanbanBoard",
		"deleteKanbanBoard",
		"createKanbanColumn",
		"updateKanbanColumn",
		"deleteKanbanColumn",
		"createKanbanCard",
		"updateKanbanCard",
		"deleteKanbanCard",
	],
	"apps/notes.ts": [
		"listNotes",
		"searchNotes",
		"getNote",
		"createNote",
		"updateNote",
		"setNoteFlags",
		"shareNote",
		"unshareNote",
		"deleteNote",
		"getNoteUploadSettings",
		"signNoteImageUpload",
		"confirmNoteImageUpload",
		"discardNoteImageUpload",
	],
	"apps/links.ts": ["listLinks", "getLinkStats", "createLink", "updateLink", "deleteLink"],
	"apps/expenses.ts": [
		"getExpensesMonth",
		"createExpense",
		"updateExpense",
		"deleteExpense",
		"listExpenseCategories",
		"createExpenseCategory",
		"updateExpenseCategory",
		"deleteExpenseCategory",
		"setExpenseBudget",
		"importExpenses",
		"exportExpenses",
	],
	"apps/habits.ts": ["getHabitsOverview", "getHabit", "createHabit", "updateHabit", "deleteHabit", "setHabitCheckin"],
};
// apps:end

/**
 * Files whose functions deliberately don't require a permission, with why, and
 * the functions they hold (adding one to these files also needs a look here).
 */
const UNGUARDED_FILES: Record<string, { why: string; functions: ReadonlyArray<string> }> = {
	"auth.ts": {
		why: "the session itself; per-user functions use requireUserMiddleware (account changes requireAccountOwnerMiddleware), the admin gate requireAdminAccessMiddleware",
		functions: [
			"getSession",
			"getAuthFeatures",
			"ensureAdminAccess",
			"listMySessions",
			"revokeMySession",
			"getAccountSecurity",
			"setMyPassword",
			"stopImpersonating",
		],
	},
	"admin.ts": {
		why: "the admin area's gate (requireAdminAccessMiddleware); the dashboard fills only the parts whose read permission the user holds",
		functions: ["getDashboard"],
	},
	"guests.ts": {
		why: "moves this browser's guest data to the signed-in account (requireUserMiddleware: accounts only; the guest comes from a signed httpOnly cookie, decision 0186)",
		functions: ["claimGuestData"],
	},
	// portfolio:start
	"portfolio-public.ts": {
		why: "the portfolio's public pages and contact form: published content only; drafts only in a preview the handler grants to a session holding portfolio:read; the form is rate limited, Turnstile-checked and honeypotted",
		functions: [
			"getPublicProfile",
			"getHome",
			"getWork",
			"getCaseStudy",
			"getAbout",
			"getJournal",
			"getArticle",
			// apps:start
			"getAppCaseStudies",
			// apps:end
			"submitContactMessage",
		],
	},
	// portfolio:end
	// apps:start
	"apps/notes-public.ts": {
		why: "the public page of a shared note: only a note its owner (an account) shared, by its random token (decision 0190)",
		functions: ["getSharedNote"],
	},
	// apps:end
	"test-crud-public.ts": {
		why: "dev-only /dev/test-crud reads (devOnlyMiddleware); the repository only returns published rows",
		functions: ["listPublicTestCrud", "getPublicTestCrud"],
	},
	"stack.ts": {
		why: "dev-only /dev/stack data (static, devOnlyMiddleware)",
		functions: ["listStack", "getStackStats"],
	},
	"health.ts": { why: "public health check", functions: ["getDbHealth"] },
	"feature-flags.ts": { why: "public feature flags for the current visitor", functions: ["getHomeFlags"] },
	"dev.ts": { why: "dev-only /dev/forms preview (devOnlyMiddleware)", functions: ["previewRichText"] },
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
			"listExampleMessages",
			"sendExampleMessage",
			"resetExampleMessages",
			"submitExampleContact",
			"runExampleJobFn",
		],
	},
	// @new-feature:unguarded-functions
};

const DIR = "src/functions";

/**
 * Every server-function file under src/functions, as a path relative to it (e.g. "rbac.ts",
 * "apps/kanban.ts"). Subfolders count too, so a file can't escape this test by living in
 * one; `_lib/` holds helpers for these files, not server functions.
 */
const functionFiles = (dir = DIR, prefix = ""): string[] =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory())
			return entry.name === "_lib" ? [] : functionFiles(`${dir}/${entry.name}`, `${prefix}${entry.name}/`);
		return entry.name.endsWith(".ts") ? [`${prefix}${entry.name}`] : [];
	});

/** The exported server functions of a file, in order, with their source. */
const serverFunctions = (file: string) =>
	readFileSync(`${DIR}/${file}`, "utf8")
		.split("export const ")
		.slice(1)
		.filter((definition) => definition.includes("createServerFn("))
		.map((definition) => ({ name: definition.split(" ")[0] ?? "", definition }));

describe("guarded server functions", () => {
	it("every file in src/functions is declared as guarded or deliberately unguarded", () => {
		const files = functionFiles();
		const declared = [
			...Object.keys(GUARDED_FUNCTIONS),
			...Object.keys(UNGUARDED_FILES),
			...Object.keys(APP_FUNCTIONS), // @apps
		];
		expect(files.filter((file) => !declared.includes(file))).toEqual([]);
		expect(declared.filter((file) => !files.includes(file))).toEqual([]);
	});

	// The middleware itself is tested in auth-middleware.test.ts (anonymous -> UNAUTHORIZED,
	// missing permission -> FORBIDDEN). This guards that no function skips it or checks
	// the wrong permission. The live 403 replay is recorded in docs/decisions.md 0095.
	// `withServices` may follow it (decision 0173): it builds nothing for a refused call.
	for (const [file, expected] of Object.entries(GUARDED_FUNCTIONS)) {
		it(`every function in ${file} runs requirePermission with its permission first`, () => {
			const functions = serverFunctions(file);
			expect(functions.map((fn) => fn.name)).toEqual(expected.map(([name]) => name));
			for (const [index, { definition }] of functions.entries()) {
				const permission = expected[index]?.[1];
				expect(definition).toMatch(
					new RegExp(
						`= createServerFn\\(\\{ method: "(GET|POST)" \\}\\)\\s*\\.middleware\\(\\[requirePermission\\("${permission}"\\)(, withServices)?\\]\\)`,
					),
				);
			}
		});
	}

	// apps:start
	for (const [file, expected] of Object.entries(APP_FUNCTIONS)) {
		it(`every function in ${file} runs requireAppUser and withAppServices first`, () => {
			const functions = serverFunctions(file);
			expect(functions.map((fn) => fn.name)).toEqual(expected);
			for (const { definition } of functions) {
				expect(definition).toMatch(
					/= createServerFn\(\{ method: "(GET|POST)" \}\)\s*\.middleware\(\[requireAppUser, withAppServices\]\)/,
				);
			}
		});
	}
	// apps:end

	for (const [file, { functions }] of Object.entries(UNGUARDED_FILES)) {
		it(`${file} holds only its declared functions`, () => {
			expect(serverFunctions(file).map((fn) => fn.name)).toEqual(functions);
		});
	}
});
