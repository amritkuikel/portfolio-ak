import { createServerFn } from "@tanstack/react-start";
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { checkDatabaseHealth } from "@/server/db/health";

/**
 * Database health check. The handler runs only on the server; the Start compiler
 * replaces it with an RPC stub in the client bundle, which prunes the db imports.
 */
export const getDbHealth = createServerFn({ method: "GET" }).handler(() =>
	checkDatabaseHealth(() => db.execute(sql`select 1`)),
);
