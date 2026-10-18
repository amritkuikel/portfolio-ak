import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@/server/db/schema";
import type { Db } from "@/server/db/types";

/**
 * An in-process Postgres (PGlite) with the committed migrations applied and one
 * admin user, for tests of code that takes an injected `db`.
 */
export async function createTestDb(adminId = "admin-1") {
	const client = new PGlite();
	const pglite = drizzle({ client, schema, casing: "snake_case" });
	await migrate(pglite, { migrationsFolder: "./drizzle" });
	await pglite.insert(schema.user).values({ id: adminId, name: "Admin", email: "admin@example.com", role: "admin" });
	const db: Db = pglite;
	return {
		db,
		/** The raw PGlite client, for code that runs plain SQL (scripts/). */
		client,
		adminId,
		/** Removes Test CRUD rows and attachments between tests. */
		reset: async () => {
			await db.delete(schema.testCrud);
			await db.delete(schema.attachment);
		},
		close: () => client.close(),
	};
}
