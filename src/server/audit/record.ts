import "@tanstack/react-start/server-only";
import { eq } from "drizzle-orm";
import type { AuditAction, AuditTarget, AuditValues } from "@/features/audit/schema";
import { auditEvent, user } from "@/server/db/schema";
import type { Db } from "@/server/db/types";
import { currentRequestId } from "@/server/http/request-id";

/**
 * Writes audit rows (docs/decisions.md 0132). Services call it with the same
 * transaction handle as the change it describes, so both commit or neither does:
 *
 *   await db.transaction(async (tx) => {
 *     await repo.deleteRole(tx, id);
 *     await recordAudit(tx, actor, { action: "role.delete", target: { type: "role", id, label: role.name } });
 *   });
 */

/** Who acted, and where from. Server functions build it with auditActorFrom (./actor.ts). */
export type AuditActor = {
	id: string;
	/** The admin behind an impersonated session. */
	impersonatorId?: string | null;
	/** Defaults to the current request's id. */
	requestId?: string | null;
	ip?: string | null;
};

export type AuditEntry = {
	action: AuditAction;
	target: { type: AuditTarget; id: string; label?: string };
	before?: AuditValues | null;
	after?: AuditValues | null;
};

/** Writes the rows; returns their ids. */
export async function recordAudit(
	db: Db,
	actor: AuditActor,
	entries: AuditEntry | ReadonlyArray<AuditEntry>,
): Promise<string[]> {
	const list = Array.isArray(entries) ? entries : [entries as AuditEntry];
	if (list.length === 0) return [];
	// The email is kept on the row, so the log still names the actor after their account is deleted.
	const [account] = await db.select({ email: user.email }).from(user).where(eq(user.id, actor.id));
	const requestId = actor.requestId ?? currentRequestId() ?? null;
	const rows = await db
		.insert(auditEvent)
		.values(
			list.map((entry) => ({
				actorId: account ? actor.id : null,
				actorLabel: account?.email ?? actor.id,
				impersonatorId: actor.impersonatorId ?? null,
				action: entry.action,
				targetType: entry.target.type,
				targetId: entry.target.id,
				targetLabel: entry.target.label ?? "",
				before: entry.before ?? null,
				after: entry.after ?? null,
				requestId,
				ip: actor.ip ?? null,
			})),
		)
		.returning({ id: auditEvent.id });
	return rows.map((row) => row.id);
}
