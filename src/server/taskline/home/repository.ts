import "@tanstack/react-start/server-only";
import { and, asc, desc, eq, inArray, isNull, max, sql } from "drizzle-orm";
import type { TaskPriority } from "@/features/taskline/types";
import { tlActivity, tlStatus, tlTask } from "@/server/db/schema";
import type { Db } from "@/server/db/types";

/** Reads across one workspace's projects for the shell and Home: plain queries (rules are in ./service.ts). */

/** The projects among `projectIds` the member worked on (recorded activity in), most recent first. */
export async function recentProjectIds(db: Db, memberId: string, projectIds: string[], limit: number) {
	if (projectIds.length === 0) return [];
	const last = max(tlActivity.at);
	const rows = await db
		.select({ projectId: tlActivity.projectId, at: last })
		.from(tlActivity)
		.where(and(eq(tlActivity.actorId, memberId), inArray(tlActivity.projectId, projectIds)))
		.groupBy(tlActivity.projectId)
		.orderBy(desc(last))
		.limit(limit);
	return rows.map((row) => ({ projectId: row.projectId, at: row.at ?? new Date(0) }));
}

/** Open tasks (not closed, not in the trash) assigned to the member in `projectIds`: soonest due first, undated last. */
export async function openTasksOf(db: Db, memberId: string, projectIds: string[], limit: number) {
	if (projectIds.length === 0) return [];
	const rows = await db
		.select({
			id: tlTask.id,
			projectId: tlTask.projectId,
			number: tlTask.number,
			type: tlTask.type,
			title: tlTask.title,
			priority: tlTask.priority,
			dueOn: tlTask.dueOn,
			statusName: tlStatus.name,
			statusCategory: tlStatus.category,
			statusColor: tlStatus.color,
		})
		.from(tlTask)
		.innerJoin(tlStatus, eq(tlStatus.id, tlTask.statusId))
		.where(
			and(
				eq(tlTask.assigneeId, memberId),
				inArray(tlTask.projectId, projectIds),
				isNull(tlTask.completedAt),
				isNull(tlTask.deletedAt),
			),
		)
		.orderBy(sql`${tlTask.dueOn} asc nulls last`, desc(tlTask.priority), asc(tlTask.number))
		.limit(limit);
	return rows.map((row) => ({ ...row, priority: row.priority as TaskPriority }));
}
