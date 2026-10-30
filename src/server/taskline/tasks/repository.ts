import "@tanstack/react-start/server-only";
import { and, asc, count, desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import type { TaskPriority, TaskSummary, TrashedTask } from "@/features/taskline/types";
import { generateKeyBetween, generateKeysBetween } from "@/lib/fractional-index";
import { type TlStatusRow, type TlTaskRow, tlTask, tlTaskLabel, tlTaskWatcher } from "@/server/db/schema";
import type { Db, Tx } from "@/server/db/types";
import { byPosition } from "../workflow/repository";

/** Tasks: plain reads and writes (numbers, history and rules are the service's). */

export const taskRef = (key: string, number: number) => `${key}-${number}`;

export function taskSummary(row: TlTaskRow, key: string, labelIds: string[]): TaskSummary {
	return {
		id: row.id,
		ref: taskRef(key, row.number),
		number: row.number,
		type: row.type,
		title: row.title,
		statusId: row.statusId,
		priority: row.priority as TaskPriority,
		assigneeId: row.assigneeId,
		parentId: row.parentId,
		labelIds,
		position: row.position,
		startOn: row.startOn,
		dueOn: row.dueOn,
		completedAt: row.completedAt?.toISOString() ?? null,
		checklist: { done: row.checklist.filter((item) => item.done).length, total: row.checklist.length },
	};
}

/** Each task's label ids. */
export async function labelIdsOf(db: Db, taskIds: string[]): Promise<Map<string, string[]>> {
	const map = new Map<string, string[]>();
	if (taskIds.length === 0) return map;
	const rows = await db
		.select({ taskId: tlTaskLabel.taskId, labelId: tlTaskLabel.labelId })
		.from(tlTaskLabel)
		.where(inArray(tlTaskLabel.taskId, taskIds))
		.orderBy(asc(tlTaskLabel.labelId));
	for (const row of rows) map.set(row.taskId, [...(map.get(row.taskId) ?? []), row.labelId]);
	return map;
}

export async function summaries(db: Db, rows: TlTaskRow[], key: string): Promise<TaskSummary[]> {
	const labels = await labelIdsOf(
		db,
		rows.map((row) => row.id),
	);
	return rows.map((row) => taskSummary(row, key, labels.get(row.id) ?? []));
}

/** A project's tasks outside the trash, in board order (status, then position). */
export async function listTasks(db: Db, projectId: string): Promise<TlTaskRow[]> {
	return db
		.select()
		.from(tlTask)
		.where(and(eq(tlTask.projectId, projectId), isNull(tlTask.deletedAt)))
		.orderBy(asc(tlTask.statusId), byPosition(tlTask.position), asc(tlTask.id));
}

export async function subtasksOf(db: Db, parentId: string): Promise<TlTaskRow[]> {
	return db
		.select()
		.from(tlTask)
		.where(and(eq(tlTask.parentId, parentId), isNull(tlTask.deletedAt)))
		.orderBy(asc(tlTask.number));
}

export async function getByNumber(db: Db, projectId: string, number: number): Promise<TlTaskRow | null> {
	const [row] = await db
		.select()
		.from(tlTask)
		.where(and(eq(tlTask.projectId, projectId), eq(tlTask.number, number)));
	return row ?? null;
}

export async function getById(db: Db, projectId: string, taskId: string): Promise<TlTaskRow | null> {
	const [row] = await db
		.select()
		.from(tlTask)
		.where(and(eq(tlTask.projectId, projectId), eq(tlTask.id, taskId)));
	return row ?? null;
}

/** Tasks of the workspace outside the trash: what its quota counts. */
export async function countTasks(db: Db, workspaceId: string): Promise<number> {
	const [row] = await db
		.select({ total: count() })
		.from(tlTask)
		.where(and(eq(tlTask.workspaceId, workspaceId), isNull(tlTask.deletedAt)));
	return row?.total ?? 0;
}

/** Tasks in a status, trashed ones included (deleting a status moves them all). */
export async function countInStatus(db: Db, statusId: string): Promise<number> {
	const [row] = await db.select({ total: count() }).from(tlTask).where(eq(tlTask.statusId, statusId));
	return row?.total ?? 0;
}

/** The key after the last task in a status: where a new or moved-in task goes. */
export async function endOfStatus(db: Db, statusId: string): Promise<string> {
	const [row] = await db
		.select({ position: tlTask.position })
		.from(tlTask)
		.where(eq(tlTask.statusId, statusId))
		.orderBy(desc(byPosition(tlTask.position)))
		.limit(1);
	return generateKeyBetween(row?.position ?? null, null);
}

export async function insertTask(tx: Tx, values: typeof tlTask.$inferInsert): Promise<TlTaskRow> {
	const [row] = await tx.insert(tlTask).values(values).returning();
	if (!row) throw new Error("Task insert returned no row");
	return row;
}

export type TaskPatch = Partial<
	Pick<
		TlTaskRow,
		| "type"
		| "priority"
		| "assigneeId"
		| "parentId"
		| "startOn"
		| "dueOn"
		| "statusId"
		| "position"
		| "completedAt"
		| "checklist"
		| "deletedAt"
	>
>;

/** A last-write-wins change: the version stays. */
export async function patchTask(tx: Tx, taskId: string, set: TaskPatch): Promise<TlTaskRow> {
	const [row] = await tx.update(tlTask).set(set).where(eq(tlTask.id, taskId)).returning();
	if (!row) throw new Error("Task update returned no row");
	return row;
}

export async function setLabels(tx: Tx, taskId: string, labelIds: ReadonlyArray<string>): Promise<void> {
	await tx.delete(tlTaskLabel).where(eq(tlTaskLabel.taskId, taskId));
	if (labelIds.length > 0) await tx.insert(tlTaskLabel).values(labelIds.map((labelId) => ({ taskId, labelId })));
}

/** Makes members watchers of a task (creating it, being assigned and commenting do). */
export async function addWatchers(tx: Tx, taskId: string, memberIds: ReadonlyArray<string | null>): Promise<void> {
	const ids = [...new Set(memberIds.filter((id): id is string => id !== null))];
	if (ids.length === 0) return;
	await tx
		.insert(tlTaskWatcher)
		.values(ids.map((memberId) => ({ taskId, memberId })))
		.onConflictDoNothing();
}

/** A task's subtasks and theirs (two levels at most, MAX_TASK_DEPTH), trashed or not. */
export async function descendantsOf(db: Db, taskId: string): Promise<TlTaskRow[]> {
	const children = await db.select().from(tlTask).where(eq(tlTask.parentId, taskId));
	if (children.length === 0) return [];
	const grandchildren = await db
		.select()
		.from(tlTask)
		.where(
			inArray(
				tlTask.parentId,
				children.map((child) => child.id),
			),
		);
	return [...children, ...grandchildren];
}

/** How many ancestors a task has (0: a top-level task). */
export async function depthOf(db: Db, task: Pick<TlTaskRow, "parentId">): Promise<number> {
	let depth = 0;
	let parentId = task.parentId;
	while (parentId && depth <= 3) {
		const [parent] = await db.select({ parentId: tlTask.parentId }).from(tlTask).where(eq(tlTask.id, parentId));
		depth += 1;
		parentId = parent?.parentId ?? null;
	}
	return depth;
}

/** Sets `completed_at` of every task in a status whose category now closes (or opens) them. */
export async function syncCompletedAt(tx: Tx, statusId: string, closed: boolean): Promise<void> {
	await tx
		.update(tlTask)
		.set({ completedAt: closed ? sql`coalesce(${tlTask.completedAt}, now())` : null })
		.where(eq(tlTask.statusId, statusId));
}

/**
 * Moves every task of a status (trashed ones too) to the end of `to`, in their order,
 * with `completed_at` following `to`'s category.
 */
export async function moveAllToStatus(tx: Tx, fromStatusId: string, to: TlStatusRow, closed: boolean): Promise<number> {
	const rows = await tx
		.select({ id: tlTask.id })
		.from(tlTask)
		.where(eq(tlTask.statusId, fromStatusId))
		.orderBy(byPosition(tlTask.position), asc(tlTask.id));
	if (rows.length === 0) return 0;
	const [after] = await tx
		.select({ position: tlTask.position })
		.from(tlTask)
		.where(eq(tlTask.statusId, to.id))
		.orderBy(desc(byPosition(tlTask.position)))
		.limit(1);
	const keys = generateKeysBetween(after?.position ?? null, null, rows.length);
	for (const [index, row] of rows.entries()) {
		await tx
			.update(tlTask)
			.set({
				statusId: to.id,
				position: keys[index] ?? generateKeyBetween(after?.position ?? null, null),
				completedAt: closed ? sql`coalesce(${tlTask.completedAt}, now())` : null,
			})
			.where(eq(tlTask.id, row.id));
	}
	return rows.length;
}

/** Puts tasks in the trash (or takes them out, with null), all with the same time. */
export async function setDeleted(tx: Tx, taskIds: string[], at: Date | null): Promise<void> {
	if (taskIds.length === 0) return;
	await tx.update(tlTask).set({ deletedAt: at }).where(inArray(tlTask.id, taskIds));
}

export async function listTrash(db: Db, projectId: string, key: string): Promise<TrashedTask[]> {
	const rows = await db
		.select({ id: tlTask.id, number: tlTask.number, title: tlTask.title, deletedAt: tlTask.deletedAt })
		.from(tlTask)
		.where(and(eq(tlTask.projectId, projectId), isNotNull(tlTask.deletedAt)))
		.orderBy(desc(tlTask.deletedAt), desc(tlTask.number));
	return rows.map((row) => ({
		id: row.id,
		ref: taskRef(key, row.number),
		title: row.title,
		deletedAt: row.deletedAt?.toISOString() ?? "",
	}));
}
