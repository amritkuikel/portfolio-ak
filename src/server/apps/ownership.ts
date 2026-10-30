import "@tanstack/react-start/server-only";
import { eq, sql } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { Db, Tx } from "@/server/db/types";

/**
 * Ownership in the showcase apps (decision 0187): every app table has `owner_id`, and
 * every read and write is scoped by it, so a user (or guest) only ever sees and
 * changes their own rows. A row of someone else's is "not found", never "forbidden":
 * the answer doesn't tell whether it exists.
 */
type Owned = PgTable & { ownerId: PgColumn };

/** The condition every query of an app's repository includes (and its claim moves rows by). */
export const ownedBy = (table: Owned, userId: string) => eq(table.ownerId, userId);

/**
 * What an app's service works with: the database and who is asking (from
 * `requireAppUser`). Guests and accounts alike; `isGuest` only decides what can be
 * published (0186). Tests pass their own.
 */
export type AppServices = { db: Db; user: { id: string; isGuest: boolean } };

/**
 * Serializes the quota checks of one owner (or one form) until the transaction ends:
 * a count followed by an insert is only a limit when two requests can't both count
 * before either inserts. Call it in the transaction, before the count. A transaction-
 * scoped advisory lock, so there's no row to lock and nothing to release.
 */
export async function lockQuota(tx: Tx, scope: string): Promise<void> {
	await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${scope}, 0))`);
}
