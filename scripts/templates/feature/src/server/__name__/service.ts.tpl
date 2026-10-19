import "@tanstack/react-start/server-only";
import type { __Pascal__Detail, __Pascal__Input } from "@/features/__name__/schema";
import { AppError } from "@/lib/errors";
import { type AuditActor, recordAudit } from "@/server/audit/record";
import type { Db } from "@/server/db/types";
import { create__Pascal__, delete__Pascal__, get__Pascal__, update__Pascal__ } from "./repository";

/**
 * What the __Title__ server functions do once auth and input validation have
 * passed (src/functions/__name__.ts are thin wrappers around these). Deleting
 * writes an audit row in the same transaction (decisions.md 0132).
 */

export async function get__Pascal__OrThrow(db: Db, id: string): Promise<__Pascal__Detail> {
	const row = await get__Pascal__(db, id);
	if (!row) throw new AppError("NOT_FOUND", "__Title__ row not found");
	return row;
}

export const create__Pascal__Item = (db: Db, input: __Pascal__Input, userId: string) =>
	create__Pascal__(db, input, userId);

/** Saves the edit if nobody changed the row since `updatedAt` (else a stale CONFLICT). */
export async function update__Pascal__Item(
	db: Db,
	data: __Pascal__Input & { id: string; updatedAt: string },
): Promise<__Pascal__Detail> {
	const { id, updatedAt, ...input } = data;
	return update__Pascal__(db, id, input, updatedAt);
}

/** Deletes one or many, one audit row each; missing ids are ignored. */
export async function delete__Pascal__Items(
	db: Db,
	ids: ReadonlyArray<string>,
	actor: AuditActor,
): Promise<{ deleted: number }> {
	return db.transaction(async (tx) => {
		const rows = await delete__Pascal__(tx, ids);
		await recordAudit(
			tx,
			actor,
			rows.map((row) => ({
				action: "__name__.delete" as const,
				target: { type: "__name__" as const, id: row.id, label: row.title },
				before: { title: row.title },
			})),
		);
		return { deleted: rows.length };
	});
}
