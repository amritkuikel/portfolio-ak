import "@tanstack/react-start/server-only";
import { and, eq } from "drizzle-orm";
import { pdProfile } from "@/server/db/schema";
import type { Db, Tx } from "@/server/db/types";

export type PardaProfileRow = typeof pdProfile.$inferSelect;

/** The owner's default profile, made if it isn't there yet (two first calls at once make one). */
export async function ensureDefaultProfile(db: Db | Tx, ownerId: string, name: string): Promise<PardaProfileRow> {
	const [created] = await db
		.insert(pdProfile)
		.values({ ownerId, name, isDefault: true })
		.onConflictDoNothing({ target: pdProfile.ownerId, where: eq(pdProfile.isDefault, true) })
		.returning();
	if (created) return created;
	const [existing] = await db
		.select()
		.from(pdProfile)
		.where(and(eq(pdProfile.ownerId, ownerId), eq(pdProfile.isDefault, true)))
		.limit(1);
	if (!existing) throw new Error("pd_profile: the default profile vanished");
	return existing;
}

/** A profile of this owner, by id; null for anyone else's (or none). */
export async function ownedProfile(db: Db | Tx, ownerId: string, id: string): Promise<PardaProfileRow | null> {
	const [row] = await db
		.select()
		.from(pdProfile)
		.where(and(eq(pdProfile.id, id), eq(pdProfile.ownerId, ownerId)))
		.limit(1);
	return row ?? null;
}

export async function defaultProfile(db: Db | Tx, ownerId: string): Promise<PardaProfileRow | null> {
	const [row] = await db
		.select()
		.from(pdProfile)
		.where(and(eq(pdProfile.ownerId, ownerId), eq(pdProfile.isDefault, true)))
		.limit(1);
	return row ?? null;
}

export const profilesOf = (db: Db | Tx, ownerId: string) =>
	db.select().from(pdProfile).where(eq(pdProfile.ownerId, ownerId));
