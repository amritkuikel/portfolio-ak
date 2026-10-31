import "@tanstack/react-start/server-only";
import { and, eq, gte, inArray, isNotNull, isNull, lt, lte, sql } from "drizzle-orm";
import { workspaceSettings } from "@/features/taskline/settings";
import { addDays, todayInZone } from "@/lib/i18n/date-only";
import { tlInvitation, tlMember, tlNotification, tlProject, tlTask, tlWorkspace } from "@/server/db/schema";
import type { Db } from "@/server/db/types";
import type { EmailProvider } from "@/server/email/types";
import { errorFields, log } from "@/server/log";
import * as collab from "./collab/repository";
import { type DeliveryResult, sendDigests } from "./notify/deliver";
import { produce } from "./notify/produce";
import { bumpRev } from "./rev";
import * as tasks from "./tasks/repository";

/**
 * `GET /api/cron/taskline` (PLAN 11.5; decision 0214), daily at about 07:00 in
 * Kathmandu. Each step is idempotent and runs on its own: one failing doesn't stop
 * the others, and running the whole job twice changes nothing the second time.
 *
 * 1. Due and overdue notices to assignees (one per task and due date).
 * 2. The daily digests.
 * 3. Purging the trash past each workspace's retention (with the tasks' files).
 * 4. Expiring invitations: open ones a month past their date are revoked.
 *
 * Later tasks add sprint snapshots (52), stopping old timers (53) and automations (56).
 */

/** Overdue notices catch up this many days of missed runs, not the whole backlog. */
const OVERDUE_CATCH_UP_DAYS = 3;
const INVITATION_GRACE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export type CronStep = { ok: boolean; [detail: string]: unknown };
export type CronResult = Record<"notices" | "digests" | "trash" | "invitations", CronStep>;

/** Notices of tasks due tomorrow, or past due, to their assignees; never twice for one due date. */
export async function dueNotices(db: Db, now = new Date()): Promise<{ due: number; overdue: number }> {
	const counts = { due: 0, overdue: 0 };
	const workspaces = await db.select().from(tlWorkspace);
	for (const workspace of workspaces) {
		const settings = workspaceSettings.parse(workspace.settings);
		const today = todayInZone(settings.timeZone, now);
		const tomorrow = addDays(today, 1);
		const candidates = await db
			.select({ task: tlTask, project: tlProject })
			.from(tlTask)
			.innerJoin(tlProject, eq(tlProject.id, tlTask.projectId))
			.innerJoin(tlMember, eq(tlMember.id, tlTask.assigneeId))
			.where(
				and(
					eq(tlTask.workspaceId, workspace.id),
					isNull(tlTask.deletedAt),
					isNull(tlTask.completedAt),
					isNull(tlProject.archivedAt),
					isNotNull(tlMember.userId),
					isNull(tlMember.deactivatedAt),
					gte(tlTask.dueOn, addDays(today, -OVERDUE_CATCH_UP_DAYS)),
					lte(tlTask.dueOn, tomorrow),
					sql`${tlTask.dueOn} <> ${today}`,
				),
			);
		if (candidates.length === 0) continue;
		const told = new Set(
			(
				await db
					.select({ taskId: tlNotification.taskId, kind: tlNotification.kind, data: tlNotification.data })
					.from(tlNotification)
					.where(
						and(
							inArray(
								tlNotification.taskId,
								candidates.map((row) => row.task.id),
							),
							inArray(tlNotification.kind, ["due", "overdue"]),
						),
					)
			).map((row) => `${row.taskId}:${row.kind}:${row.data.dueOn ?? ""}`),
		);
		for (const { task, project } of candidates) {
			if (!task.dueOn) continue;
			const kind = task.dueOn === tomorrow ? "due" : "overdue";
			if (told.has(`${task.id}:${kind}:${task.dueOn}`)) continue;
			await db.transaction(async (tx) => {
				await produce(tx, { workspace, project, settings }, { memberId: null, userId: null, name: null }, [
					{
						kind,
						taskId: task.id,
						to: [task.assigneeId],
						data: {
							ref: tasks.taskRef(project.key, task.number),
							title: task.title,
							project: project.name,
							dueOn: task.dueOn ?? "",
						},
					},
				]);
			});
			counts[kind]++;
		}
	}
	return counts;
}

/** Deletes tasks trashed longer ago than their workspace keeps them, with their subtasks and files. */
export async function purgeTrash(db: Db, now = new Date()): Promise<{ purged: number }> {
	let purged = 0;
	const workspaces = await db.select().from(tlWorkspace);
	for (const workspace of workspaces) {
		const settings = workspaceSettings.parse(workspace.settings);
		const before = new Date(now.getTime() - settings.trashRetentionDays * DAY_MS);
		const due = await db
			.select({ id: tlTask.id, projectId: tlTask.projectId })
			.from(tlTask)
			.where(and(eq(tlTask.workspaceId, workspace.id), lt(tlTask.deletedAt, before)));
		if (due.length === 0) continue;
		await db.transaction(async (tx) => {
			const ids = new Set(due.map((row) => row.id));
			for (const row of due) for (const below of await tasks.descendantsOf(tx, row.id)) ids.add(below.id);
			await collab.removeTaskFiles(tx, [...ids]);
			await tasks.deleteTasks(tx, [...ids]);
			for (const projectId of new Set(due.map((row) => row.projectId))) await bumpRev(tx, projectId);
		});
		purged += due.length;
	}
	return { purged };
}

/** Open invitations a month past their date are revoked: they leave the admin's list and free the address. */
export async function expireInvitations(db: Db, now = new Date()): Promise<{ expired: number }> {
	const rows = await db
		.update(tlInvitation)
		.set({ revokedAt: now })
		.where(
			and(
				isNull(tlInvitation.acceptedAt),
				isNull(tlInvitation.revokedAt),
				lt(tlInvitation.expiresAt, new Date(now.getTime() - INVITATION_GRACE_DAYS * DAY_MS)),
			),
		)
		.returning({ id: tlInvitation.id });
	return { expired: rows.length };
}

async function step(name: string, run: () => Promise<object>): Promise<CronStep> {
	try {
		return { ok: true, ...(await run()) };
	} catch (error) {
		log("error", `taskline cron: ${name} failed`, errorFields(error));
		return { ok: false };
	}
}

export async function runTasklineCron(
	db: Db,
	{ provider, now = new Date() }: { provider?: EmailProvider; now?: Date } = {},
): Promise<CronResult> {
	return {
		notices: await step("notices", () => dueNotices(db, now)),
		digests: await step("digests", (): Promise<DeliveryResult> => sendDigests(db, { provider, now })),
		trash: await step("trash", () => purgeTrash(db, now)),
		invitations: await step("invitations", () => expireInvitations(db, now)),
	};
}
