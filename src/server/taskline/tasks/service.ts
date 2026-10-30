import "@tanstack/react-start/server-only";
import {
	type CreateTaskInput,
	type PatchTaskInput,
	parseTaskRef,
	type UpdateTaskInput,
} from "@/features/taskline/schema";
import {
	type ChecklistItem,
	isClosedCategory,
	MAX_TASK_DEPTH,
	type ProjectTasks,
	type TaskDetail,
	type TaskSummary,
	type TrashedTask,
} from "@/features/taskline/types";
import { ruleError } from "@/lib/errors";
import { todayInZone } from "@/lib/i18n/date-only";
import { m } from "@/paraglide/messages";
import { notFound } from "@/server/db/crud";
import { lockQuota } from "@/server/db/quota";
import { type TlTaskRow, tlTask } from "@/server/db/schema";
import type { Db, Tx } from "@/server/db/types";
import { assertCan, type ProjectAccess, resolveProject, type TasklineServices } from "../access";
import { type ActivityEntry, fieldChanges, recordActivity, taskActivity } from "../activity";
import * as projects from "../projects/repository";
import { bumpRev, nextTaskNumber, saveVersioned } from "../rev";
import { quotaError, quotaScope, quotasOf, richText } from "../rules";
import * as workflow from "../workflow/repository";
import * as members from "../workspace/repository";
import * as repo from "./repository";

/**
 * Tasks (docs/guides/taskline.md, "Tasks"): numbers from the project's sequence,
 * `completed_at` from the status's category, subtasks two levels deep, a trash that
 * takes a task's subtasks with it, and a history entry for every change. The title
 * and description save with their version; everything else is last-write-wins.
 */

type Resolved = { access: ProjectAccess; task: TlTaskRow };

/** The task `ref` ("WEB-12") of workspace `ws`, with the caller's access; NOT_FOUND unless they may see it. */
async function resolveTask(db: Db, user: TasklineServices["user"], ws: string, ref: string): Promise<Resolved> {
	const parsed = parseTaskRef(ref);
	if (!parsed) throw notFound("Task");
	const access = await resolveProject(db, user, ws, parsed.key);
	const task = await repo.getByNumber(db, access.project.id, parsed.number);
	if (!task) throw notFound("Task");
	return { access, task };
}

/** For changes: the caller may edit, and the task isn't in the trash. */
async function resolveEditable(tx: Tx, user: TasklineServices["user"], ws: string, ref: string): Promise<Resolved> {
	const resolved = await resolveTask(tx, user, ws, ref);
	assertCan(resolved.access, "edit");
	if (resolved.task.deletedAt) throw ruleError("CONFLICT", "Taskline: task in trash", m.taskline_error_in_trash());
	return resolved;
}

const summaryOf = async (db: Db, access: ProjectAccess, row: TlTaskRow): Promise<TaskSummary> =>
	(await repo.summaries(db, [row], access.project.key))[0] as TaskSummary;

async function detailOf(db: Db, access: ProjectAccess, row: TlTaskRow): Promise<TaskDetail> {
	const [summary, subtasks, activity] = await Promise.all([
		summaryOf(db, access, row),
		repo.subtasksOf(db, row.id).then((rows) => repo.summaries(db, rows, access.project.key)),
		taskActivity(db, row.id),
	]);
	return {
		...summary,
		description: row.descriptionHtml,
		checklistItems: row.checklist,
		reporterId: row.reporterId,
		subtasks,
		deletedAt: row.deletedAt?.toISOString() ?? null,
		version: row.version,
		activity,
		can: access.can,
	};
}

/** An active member of the task's workspace (assignees can't be deactivated members). */
async function checkAssignee(db: Db, access: ProjectAccess, memberId: string | null | undefined) {
	if (!memberId) return;
	const member = await members.memberById(db, access.workspace.id, memberId);
	if (!member || member.deactivatedAt) throw notFound("Member");
}

/** Labels of the project or its workspace. */
async function checkLabels(db: Db, access: ProjectAccess, labelIds: ReadonlyArray<string> | undefined) {
	if (!labelIds || labelIds.length === 0) return;
	const allowed = new Set(
		(await workflow.listLabels(db, access.workspace.id, access.project.id)).map((label) => label.id),
	);
	if (labelIds.some((id) => !allowed.has(id))) throw notFound("Label");
}

/**
 * A parent in the same project, outside the trash, that isn't the task or one of its
 * subtasks, and leaves the whole subtree within MAX_TASK_DEPTH.
 */
async function checkParent(db: Db, access: ProjectAccess, parentId: string | null | undefined, task?: TlTaskRow) {
	if (!parentId) return;
	const parent = await repo.getById(db, access.project.id, parentId);
	if (!parent || parent.deletedAt) throw notFound("Task");
	const below = task ? await repo.descendantsOf(db, task.id) : [];
	if (task && (parent.id === task.id || below.some((row) => row.id === parent.id))) throw parentError();
	const height = below.length === 0 ? 0 : below.some((row) => row.parentId !== task?.id) ? 2 : 1;
	if ((await repo.depthOf(db, parent)) + 1 + height > MAX_TASK_DEPTH) throw parentError();
}

const parentError = () => ruleError("CONFLICT", "Taskline: bad parent", m.taskline_error_parent());

/** `completed_at` after a move into `statusId` (kept when it stays closed). */
async function completedAtFor(db: Db, projectId: string, statusId: string, current: Date | null) {
	const status = await workflow.getStatus(db, projectId, statusId);
	if (!status) throw notFound("Status");
	return isClosedCategory(status.category) ? (current ?? new Date()) : null;
}

export async function listTasks({ db, user }: TasklineServices, ws: string, key: string): Promise<ProjectTasks> {
	const access = await resolveProject(db, user, ws, key);
	const [statuses, labels, memberRows, rows, stars, counts] = await Promise.all([
		workflow.listStatuses(db, access.project.id),
		workflow.listLabels(db, access.workspace.id, access.project.id),
		members.listMembers(db, access.workspace.id, { deactivated: true }),
		repo.listTasks(db, access.project.id),
		projects.starsOf(db, access.member?.id ?? null, [access.project.id]),
		projects.openTaskCounts(db, [access.project.id]),
	]);
	return {
		project: projects.projectDetail(access.project, {
			starred: stars.has(access.project.id),
			openTasks: counts.get(access.project.id) ?? 0,
			role: access.projectRole,
			can: access.can,
		}),
		statuses: statuses.map(workflow.statusDto),
		labels: labels.map(workflow.labelDto),
		members: memberRows.map(members.memberDto),
		tasks: await repo.summaries(db, rows, access.project.key),
		today: todayInZone(access.settings.timeZone),
	};
}

/** One task with its subtasks and history; a trashed one too (the trash opens it). */
export async function getTask({ db, user }: TasklineServices, ws: string, ref: string): Promise<TaskDetail> {
	const { access, task } = await resolveTask(db, user, ws, ref);
	return detailOf(db, access, task);
}

export async function createTask(
	{ db, user }: TasklineServices,
	{ ws, key, id, labelIds = [], description, ...input }: CreateTaskInput,
): Promise<TaskDetail> {
	return db.transaction(async (tx) => {
		const access = await resolveProject(tx, user, ws, key);
		assertCan(access, "edit");
		await lockQuota(tx, quotaScope(access.workspace.id));
		const max = quotasOf(access).tasks;
		if ((await repo.countTasks(tx, access.workspace.id)) >= max) throw quotaError("tasks", max);
		const statuses = await workflow.listStatuses(tx, access.project.id);
		const status = input.statusId
			? statuses.find((row) => row.id === input.statusId)
			: (statuses.find((row) => row.category === "unstarted") ?? statuses[0]);
		if (!status) throw notFound("Status");
		await checkAssignee(tx, access, input.assigneeId);
		await checkParent(tx, access, input.parentId);
		await checkLabels(tx, access, labelIds);
		const text = richText(description);
		const task = await repo.insertTask(tx, {
			...(id ? { id } : {}),
			workspaceId: access.workspace.id,
			projectId: access.project.id,
			number: await nextTaskNumber(tx, access.project.id),
			title: input.title,
			descriptionHtml: text.html,
			descriptionText: text.text,
			type: input.type,
			statusId: status.id,
			position: input.position ?? (await repo.endOfStatus(tx, status.id)),
			priority: input.priority,
			assigneeId: input.assigneeId ?? null,
			reporterId: access.member?.id ?? null,
			parentId: input.parentId ?? null,
			startOn: input.startOn ?? null,
			dueOn: input.dueOn ?? null,
			completedAt: isClosedCategory(status.category) ? new Date() : null,
		});
		await repo.setLabels(tx, task.id, labelIds);
		await repo.addWatchers(tx, task.id, [task.reporterId, task.assigneeId]);
		await recordActivity(tx, access, { kind: "task.created", taskId: task.id, data: { title: task.title } });
		await bumpRev(tx, access.project.id);
		return detailOf(tx, access, task);
	});
}

/** The title and description, from the version the edit started at. */
export async function updateTask(
	{ db, user }: TasklineServices,
	{ ws, ref, version, title, description }: UpdateTaskInput,
): Promise<TaskDetail> {
	return db.transaction(async (tx) => {
		const { access, task: before } = await resolveEditable(tx, user, ws, ref);
		const text = richText(description);
		const task = await saveVersioned(tx, tlTask, {
			id: before.id,
			version,
			what: "Task",
			set: { title, descriptionHtml: text.html, descriptionText: text.text },
		});
		const entries: ActivityEntry[] = [];
		if (before.title !== task.title) {
			entries.push({
				kind: "task.updated",
				taskId: task.id,
				data: { field: "title", from: before.title, to: task.title },
			});
		}
		if (before.descriptionHtml !== task.descriptionHtml) {
			entries.push({ kind: "task.updated", taskId: task.id, data: { field: "description" } });
		}
		await recordActivity(tx, access, ...entries);
		await bumpRev(tx, access.project.id);
		return detailOf(tx, access, task);
	});
}

/** Single fields (type, priority, assignee, parent, labels, dates); each change goes in the history. */
export async function patchTask(
	{ db, user }: TasklineServices,
	{ ws, ref, labelIds, ...fields }: PatchTaskInput,
): Promise<TaskDetail> {
	return db.transaction(async (tx) => {
		const { access, task: before } = await resolveEditable(tx, user, ws, ref);
		if (fields.assigneeId !== undefined) await checkAssignee(tx, access, fields.assigneeId);
		if (fields.parentId !== undefined) await checkParent(tx, access, fields.parentId, before);
		const entries: ActivityEntry[] = [];
		let task = before;
		if (Object.keys(fields).length > 0) {
			task = await repo.patchTask(tx, before.id, fields);
			entries.push(...fieldChanges(task.id, before, fields));
		}
		if (labelIds) {
			await checkLabels(tx, access, labelIds);
			const current = (await repo.labelIdsOf(tx, [task.id])).get(task.id) ?? [];
			const next = [...labelIds].sort();
			if (JSON.stringify(current) !== JSON.stringify(next)) {
				await repo.setLabels(tx, task.id, next);
				entries.push({ kind: "task.updated", taskId: task.id, data: { field: "labels", from: current, to: next } });
			}
		}
		if (fields.assigneeId) await repo.addWatchers(tx, task.id, [fields.assigneeId]);
		await recordActivity(tx, access, ...entries);
		if (entries.length > 0) await bumpRev(tx, access.project.id);
		return detailOf(tx, access, task);
	});
}

/** A drop on the board: into a status (closing or reopening the task by its category) at a position. */
export async function moveTask(
	{ db, user }: TasklineServices,
	{ ws, ref, statusId, position }: { ws: string; ref: string; statusId: string; position: string },
): Promise<TaskSummary> {
	return db.transaction(async (tx) => {
		const { access, task: before } = await resolveEditable(tx, user, ws, ref);
		const completedAt = await completedAtFor(tx, access.project.id, statusId, before.completedAt);
		const task = await repo.patchTask(tx, before.id, { statusId, position, completedAt });
		if (before.statusId !== statusId) {
			await recordActivity(tx, access, {
				kind: "task.moved",
				taskId: task.id,
				data: { from: before.statusId, to: statusId },
			});
		}
		await bumpRev(tx, access.project.id);
		return summaryOf(tx, access, task);
	});
}

export async function setChecklist(
	{ db, user }: TasklineServices,
	{ ws, ref, checklist }: { ws: string; ref: string; checklist: ChecklistItem[] },
): Promise<TaskDetail> {
	return db.transaction(async (tx) => {
		const { access, task: before } = await resolveEditable(tx, user, ws, ref);
		const task = await repo.patchTask(tx, before.id, { checklist });
		const done = checklist.filter((item) => item.done).length;
		await recordActivity(tx, access, {
			kind: "task.checklist",
			taskId: task.id,
			data: { done, total: checklist.length },
		});
		await bumpRev(tx, access.project.id);
		return detailOf(tx, access, task);
	});
}

/** Puts a task in the trash, with its subtasks that aren't there yet (restored together). */
export async function trashTask({ db, user }: TasklineServices, ws: string, ref: string): Promise<void> {
	await db.transaction(async (tx) => {
		const { access, task } = await resolveEditable(tx, user, ws, ref);
		const below = (await repo.descendantsOf(tx, task.id)).filter((row) => !row.deletedAt);
		await repo.setDeleted(tx, [task.id, ...below.map((row) => row.id)], new Date());
		await recordActivity(tx, access, { kind: "task.trashed", taskId: task.id, data: { subtasks: below.length } });
		await bumpRev(tx, access.project.id);
	});
}

/**
 * Takes a task out of the trash with the subtasks that went in with it. If its parent
 * is still in the trash, it comes back as a top-level task.
 */
export async function restoreTask({ db, user }: TasklineServices, ws: string, ref: string): Promise<TaskDetail> {
	return db.transaction(async (tx) => {
		const { access, task } = await resolveTask(tx, user, ws, ref);
		assertCan(access, "edit");
		if (!task.deletedAt) return detailOf(tx, access, task);
		const trashedAt = task.deletedAt.getTime();
		const together = (await repo.descendantsOf(tx, task.id)).filter((row) => row.deletedAt?.getTime() === trashedAt);
		await repo.setDeleted(tx, [task.id, ...together.map((row) => row.id)], null);
		let restored: TlTaskRow = { ...task, deletedAt: null };
		if (task.parentId) {
			const parent = await repo.getById(tx, access.project.id, task.parentId);
			if (parent?.deletedAt) restored = await repo.patchTask(tx, task.id, { parentId: null });
		}
		await recordActivity(tx, access, { kind: "task.restored", taskId: task.id, data: { subtasks: together.length } });
		await bumpRev(tx, access.project.id);
		return detailOf(tx, access, restored);
	});
}

export async function listTrash({ db, user }: TasklineServices, ws: string, key: string): Promise<TrashedTask[]> {
	const access = await resolveProject(db, user, ws, key);
	return repo.listTrash(db, access.project.id, access.project.key);
}
