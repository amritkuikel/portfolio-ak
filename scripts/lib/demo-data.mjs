/**
 * The demo data `pnpm db:seed-demo` writes (scripts/seed-demo.mjs). Plain SQL
 * through an injected `query(sql, params) => Promise<{ rows, rowCount }>`, so it
 * runs on node-postgres and is tested on PGlite (tests/server/seed-demo.test.ts).
 * Idempotent: existing roles, users and items are kept.
 */
import { randomUUID } from "node:crypto";
// A plain TypeScript module without imports: Node strips its types.
import { isPermission } from "../../src/features/rbac/permissions.ts";

export const DEMO_ROLES = [
	{
		key: "editor",
		name: "Editor",
		description: "Writes and publishes Test CRUD items.",
		permissions: ["test-crud:read", "test-crud:create", "test-crud:update", "test-crud:publish", "attachments:upload"],
	},
	{
		key: "viewer",
		name: "Viewer",
		description: "Sees the admin area without changing anything.",
		permissions: ["test-crud:read", "users:read", "roles:read"],
	},
];

export const DEMO_USERS = [
	{ email: "editor@example.com", name: "Demo Editor", role: "editor" },
	{ email: "viewer@example.com", name: "Demo Viewer", role: "viewer" },
	// No role: can sign in, but /admin shows the forbidden page.
	{ email: "member@example.com", name: "Demo Member", role: null },
];

export const DEMO_ITEM_COUNT = 30;

const TAGS = ["food", "nepal", "travel", "craft", "music", "tea"];
const TITLES = [
	"Momo masterclass",
	"Thangka painting",
	"Himalayan tea tasting",
	"Pottery in Bhaktapur",
	"Dal bhat for beginners",
	"Madal rhythms",
	"Prayer flag printing",
	"Sel roti morning",
	"Lokta paper making",
	"Newari feast",
];

/**
 * Writes the demo roles, users (sharing `passwordHash`, a Better Auth hash) and
 * Test CRUD items. Returns how many items were new.
 */
export async function seedDemo(query, { passwordHash, now = new Date() }) {
	for (const role of DEMO_ROLES) {
		const unknown = role.permissions.filter((permission) => !isPermission(permission));
		if (unknown.length) throw new Error(`role ${role.key} has unknown permissions: ${unknown.join(", ")}`);
	}

	const roleIds = new Map();
	for (const role of DEMO_ROLES) {
		const { rows } = await query(
			`insert into "role" ("key", "name", "description") values ($1, $2, $3)
			 on conflict ("key") do update set "key" = excluded."key" returning "id"`,
			[role.key, role.name, role.description],
		);
		roleIds.set(role.key, rows[0].id);
		for (const permission of role.permissions) {
			await query(`insert into "role_permission" ("role_id", "permission") values ($1, $2) on conflict do nothing`, [
				rows[0].id,
				permission,
			]);
		}
	}

	let authorId = null;
	for (const demo of DEMO_USERS) {
		const existing = await query(`select "id" from "user" where "email" = $1`, [demo.email]);
		let id = existing.rows[0]?.id;
		if (!id) {
			id = randomUUID();
			await query(
				`insert into "user" ("id", "name", "email", "email_verified", "role") values ($1, $2, $3, true, 'user')`,
				[id, demo.name, demo.email],
			);
			// Better Auth's email + password sign-in reads the hash from the "credential" account.
			await query(
				// updated_at has no database default (Drizzle fills it in app code).
				`insert into "account" ("id", "account_id", "provider_id", "user_id", "password", "created_at", "updated_at")
				 values ($1, $2, 'credential', $2, $3, now(), now())`,
				[randomUUID(), id, passwordHash],
			);
		}
		authorId ??= id;
		if (demo.role) {
			await query(`insert into "user_role" ("user_id", "role_id") values ($1, $2) on conflict do nothing`, [
				id,
				roleIds.get(demo.role),
			]);
		}
	}

	let created = 0;
	for (let index = 0; index < DEMO_ITEM_COUNT; index++) {
		const title = `${TITLES[index % TITLES.length]} ${Math.floor(index / TITLES.length) + 1}`;
		const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
		// Two in three published, newest first; the rest drafts.
		const published = index % 3 !== 0;
		const result = await query(
			`insert into "test_crud" ("slug", "title", "summary", "body", "status", "price", "tags", "published_at", "created_by")
			 values ($1, $2, $3, $4, $5, $6, $7, $8, $9) on conflict ("slug") do nothing`,
			[
				slug,
				title,
				`Demo item ${index + 1}: a short summary for the list and the public card.`,
				`<p>Demo content for <strong>${title}</strong>.</p>`,
				published ? "published" : "draft",
				500 + index * 125,
				[TAGS[index % TAGS.length], TAGS[(index + 2) % TAGS.length]],
				published ? new Date(now.getTime() - index * 86_400_000) : null,
				authorId,
			],
		);
		created += result.rowCount ?? 0;
	}
	return { created };
}
