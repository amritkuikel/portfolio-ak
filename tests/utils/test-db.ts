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
		adminId,
		/** Removes Test CRUD rows and images between tests. */
		reset: async () => {
			await db.delete(schema.testCrud);
			await db.delete(schema.testCrudImage);
		},
		close: () => client.close(),
	};
}

/** Smallest valid PNG signature + bytes, for upload tests (validateImage sniffs the signature). */
export const pngFile = (name = "photo.png") =>
	new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])], name, { type: "image/png" });
