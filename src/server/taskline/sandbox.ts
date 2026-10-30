import "@tanstack/react-start/server-only";
import { and, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import { workspaceSettings } from "@/features/taskline/settings";
import type { TasklineColor, TaskPriority, TaskType } from "@/features/taskline/types";
import { generateKeysBetween } from "@/lib/fractional-index";
import { addDays, todayInZone } from "@/lib/i18n/date-only";
import { APP_TIME_ZONE } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import type { Locale } from "@/paraglide/runtime";
import {
	type TlWorkspaceRow,
	tlActivity,
	tlInvitation,
	tlLabel,
	tlMember,
	tlProject,
	tlProjectMember,
	tlStar,
	tlTask,
	tlTaskLabel,
	tlTaskWatcher,
	tlWorkspace,
} from "@/server/db/schema";
import type { Tx } from "@/server/db/types";
import type { GuestData } from "@/server/guests/data";
import type { WorkspaceAccess } from "./access";
import { recordActivity } from "./activity";
import * as projects from "./projects/repository";
import { insertProjectWithWorkflow } from "./projects/service";
import { nextTaskNumber } from "./rev";
import * as tasks from "./tasks/repository";
import * as workflow from "./workflow/repository";
import * as workspaces from "./workspace/repository";

/**
 * The sandbox (decision 0203): a private workspace per user, seeded with sample work
 * and three placeholder teammates (members with no account), in the language the
 * user started in. Guests get one when they start (the `GUEST_DATA` entry, 0186);
 * an account can start one. When a guest signs up or in, the claim hands it over.
 */

const SAMPLE_KEY = "WEB";

type SampleTask = {
	title: (t: { locale: Locale }) => string;
	/** Index into the default statuses: 0 backlog, 1 to do, 2 in progress, 3 done, 4 canceled. */
	status: number;
	/** -1: the sandbox's owner; 0–2: a teammate; null: nobody. */
	assignee: number | null;
	priority: TaskPriority;
	labels?: number[];
	due?: number;
	type?: TaskType;
	/** Index of a sample task above: this one is its subtask. */
	parent?: number;
	checklist?: Array<(t: { locale: Locale }) => string>;
};

const TEAMMATES = [
	{ name: m.taskline_seed_asha, title: m.taskline_seed_title_designer },
	{ name: m.taskline_seed_bikash, title: m.taskline_seed_title_engineer },
	{ name: m.taskline_seed_sita, title: m.taskline_seed_title_product },
];

const LABELS: ReadonlyArray<{ name: (t: { locale: Locale }) => string; color: TasklineColor }> = [
	{ name: (t) => m.taskline_seed_label_design({}, t), color: "violet" },
	{ name: (t) => m.taskline_seed_label_bug({}, t), color: "red" },
	{ name: (t) => m.taskline_seed_label_content({}, t), color: "teal" },
];

const TASKS: ReadonlyArray<SampleTask> = [
	{ title: (t) => m.taskline_seed_task_try({}, t), status: 1, assignee: -1, priority: 2 },
	{ title: (t) => m.taskline_seed_task_copy({}, t), status: 1, assignee: 2, priority: 3, labels: [2], due: 3 },
	{
		title: (t) => m.taskline_seed_task_navigation({}, t),
		status: 2,
		assignee: 0,
		priority: 3,
		labels: [0],
		due: 1,
		type: "story",
	},
	{ title: (t) => m.taskline_seed_task_mobile_menu({}, t), status: 3, assignee: 0, priority: 2, parent: 2 },
	{ title: (t) => m.taskline_seed_task_contrast({}, t), status: 1, assignee: 1, priority: 2, parent: 2 },
	{
		title: (t) => m.taskline_seed_task_contact_form({}, t),
		status: 2,
		assignee: 1,
		priority: 4,
		labels: [1],
		due: -1,
		type: "bug",
		checklist: [
			(t) => m.taskline_seed_check_reproduce({}, t),
			(t) => m.taskline_seed_check_logs({}, t),
			(t) => m.taskline_seed_check_test({}, t),
		],
	},
	{ title: (t) => m.taskline_seed_task_launch_date({}, t), status: 1, assignee: -1, priority: 2, due: 7 },
	{ title: (t) => m.taskline_seed_task_analytics({}, t), status: 0, assignee: null, priority: 1 },
	{ title: (t) => m.taskline_seed_task_blog({}, t), status: 0, assignee: 2, priority: 0, labels: [2] },
	{ title: (t) => m.taskline_seed_task_logo({}, t), status: 3, assignee: 0, priority: 2, labels: [0] },
];

/**
 * The user's sandbox, created and seeded if they have none (in the caller's
 * transaction), or the one they have.
 */
export async function seedSandbox(tx: Tx, userId: string, locale: Locale): Promise<TlWorkspaceRow> {
	const existing = await workspaces.sandboxOf(tx, userId);
	if (existing) return existing;
	const t = { locale };
	const workspace = await workspaces.insertSandbox(tx, userId, m.taskline_sandbox_name({}, t));
	const [owner, ...teammates] = await workspaces.insertMembers(tx, [
		{ workspaceId: workspace.id, userId, displayName: (await workspaces.userName(tx, userId)) ?? "" },
		...TEAMMATES.map((mate) => ({
			workspaceId: workspace.id,
			userId: null,
			displayName: mate.name({}, t),
			title: mate.title({}, t),
		})),
	]);
	if (!owner) throw new Error("Sandbox owner insert returned no row");
	const access: WorkspaceAccess = {
		workspace,
		settings: workspaceSettings.parse(workspace.settings),
		member: owner,
		sandboxOwner: true,
		admin: null,
		canCreateProject: true,
	};
	const created = await insertProjectWithWorkflow(
		tx,
		access,
		{
			key: SAMPLE_KEY,
			name: m.taskline_seed_project({}, t),
			descriptionHtml: `<p>${m.taskline_seed_project_description({}, t)}</p>`,
			descriptionText: m.taskline_seed_project_description({}, t),
			color: "teal",
		},
		locale,
	);
	const project = created.project;
	for (const mate of teammates) {
		await tx.insert(tlProjectMember).values({ projectId: project.id, memberId: mate.id, role: "member" });
	}
	const statuses = await workflow.listStatuses(tx, project.id);
	const labels = await workflow.insertLabels(
		tx,
		LABELS.map((label) => ({
			workspaceId: workspace.id,
			projectId: project.id,
			name: label.name(t),
			color: label.color,
		})),
	);
	const today = todayInZone(APP_TIME_ZONE);
	const memberFor = (index: number | null) => (index === null ? null : index === -1 ? owner.id : teammates[index]?.id);
	const positions = new Map<string, string[]>();
	for (const status of statuses) {
		const count = TASKS.filter((task) => statuses[task.status]?.id === status.id).length;
		positions.set(status.id, generateKeysBetween(null, null, count));
	}
	const ids: string[] = [];
	for (const sample of TASKS) {
		const status = statuses[sample.status] ?? statuses[0];
		if (!status) break;
		const closed = status.category === "completed" || status.category === "canceled";
		const task = await tasks.insertTask(tx, {
			workspaceId: workspace.id,
			projectId: project.id,
			number: await nextTaskNumber(tx, project.id),
			title: sample.title(t),
			type: sample.type ?? "task",
			statusId: status.id,
			position: positions.get(status.id)?.shift() ?? "a0",
			priority: sample.priority,
			assigneeId: memberFor(sample.assignee) ?? null,
			reporterId: owner.id,
			parentId: sample.parent === undefined ? null : (ids[sample.parent] ?? null),
			dueOn: sample.due === undefined ? null : addDays(today, sample.due),
			checklist: (sample.checklist ?? []).map((text, index) => ({
				id: crypto.randomUUID(),
				text: text(t),
				done: index === 0,
			})),
			completedAt: closed ? new Date() : null,
		});
		ids.push(task.id);
		await tasks.setLabels(
			tx,
			task.id,
			(sample.labels ?? []).flatMap((index) => (labels[index] ? [labels[index].id] : [])),
		);
		await tasks.addWatchers(tx, task.id, [owner.id, task.assigneeId]);
		await recordActivity(tx, created, { kind: "task.created", taskId: task.id, data: { title: task.title } });
	}
	return workspace;
}

/** `base`, or the first of `base2`, `base3`… (shortened to six characters) not in `taken`. */
export function freeProjectKey(base: string, taken: ReadonlySet<string>): string {
	if (!taken.has(base)) return base;
	for (let suffix = 2; ; suffix++) {
		const candidate = `${base.slice(0, 6 - String(suffix).length)}${suffix}`;
		if (!taken.has(candidate)) return candidate;
	}
}

/** Points every reference to one member at another (the claim's merge). */
async function remapMember(tx: Tx, from: string, to: string): Promise<void> {
	await tx.update(tlTask).set({ assigneeId: to }).where(eq(tlTask.assigneeId, from));
	await tx.update(tlTask).set({ reporterId: to }).where(eq(tlTask.reporterId, from));
	await tx.update(tlProject).set({ leadId: to }).where(eq(tlProject.leadId, from));
	await tx.update(tlActivity).set({ actorId: to }).where(eq(tlActivity.actorId, from));
	await tx.update(tlInvitation).set({ invitedById: to }).where(eq(tlInvitation.invitedById, from));
	await tx.update(tlProjectMember).set({ memberId: to }).where(eq(tlProjectMember.memberId, from));
	// Stars and watchers have the pair as their key: keep one row per pair.
	await tx.execute(
		sql`insert into ${tlStar} (member_id, project_id) select ${to}, project_id from ${tlStar} where member_id = ${from} on conflict do nothing`,
	);
	await tx.delete(tlStar).where(eq(tlStar.memberId, from));
	await tx.execute(
		sql`insert into ${tlTaskWatcher} (task_id, member_id) select task_id, ${to} from ${tlTaskWatcher} where member_id = ${from} on conflict do nothing`,
	);
	await tx.delete(tlTaskWatcher).where(eq(tlTaskWatcher.memberId, from));
}

/**
 * Hands a guest's sandbox to an account (decision 0186's claim). With no sandbox of
 * its own the account simply takes it over. Otherwise the guest's projects, teammates
 * and history move into the account's sandbox: a project whose key is taken there
 * gets a suffix (WEB → WEB2), workspace labels merge by name, and what the guest did
 * becomes the account's. Quotas don't apply: nothing the guest made is lost.
 */
export async function claimSandbox(tx: Tx, fromUserId: string, toUserId: string): Promise<void> {
	const guest = await workspaces.sandboxOf(tx, fromUserId);
	if (!guest) return;
	const guestMember = await workspaces.memberOf(tx, guest.id, fromUserId);
	const accountName = (await workspaces.userName(tx, toUserId)) ?? "";
	const target = await workspaces.sandboxOf(tx, toUserId);
	if (!target) {
		await tx.update(tlWorkspace).set({ ownerId: toUserId }).where(eq(tlWorkspace.id, guest.id));
		if (guestMember) {
			await tx
				.update(tlMember)
				.set({ userId: toUserId, displayName: accountName })
				.where(eq(tlMember.id, guestMember.id));
		}
		return;
	}
	const accountMember =
		(await workspaces.memberOf(tx, target.id, toUserId)) ??
		(await workspaces.insertMembers(tx, [{ workspaceId: target.id, userId: toUserId, displayName: accountName }]))[0];
	if (guestMember && accountMember) await remapMember(tx, guestMember.id, accountMember.id);
	// The teammates (everyone but the guest) move with their work.
	await tx
		.update(tlMember)
		.set({ workspaceId: target.id })
		.where(and(eq(tlMember.workspaceId, guest.id), guestMember ? ne(tlMember.id, guestMember.id) : undefined));
	const taken = await projects.projectKeys(tx, target.id);
	const moving = await tx.select().from(tlProject).where(eq(tlProject.workspaceId, guest.id));
	for (const project of moving) {
		const key = freeProjectKey(project.key, taken);
		taken.add(key);
		await tx.update(tlProject).set({ workspaceId: target.id, key }).where(eq(tlProject.id, project.id));
	}
	await tx.update(tlTask).set({ workspaceId: target.id }).where(eq(tlTask.workspaceId, guest.id));
	await tx.update(tlActivity).set({ workspaceId: target.id }).where(eq(tlActivity.workspaceId, guest.id));
	await tx
		.update(tlLabel)
		.set({ workspaceId: target.id })
		.where(and(eq(tlLabel.workspaceId, guest.id), sql`${tlLabel.projectId} is not null`));
	await mergeWorkspaceLabels(tx, guest.id, target.id);
	// What's left (the guest's own member row) goes with the workspace.
	await tx.delete(tlWorkspace).where(eq(tlWorkspace.id, guest.id));
}

/** Workspace-wide labels: one the target has by name (any case) takes the guest's tasks; the rest move. */
async function mergeWorkspaceLabels(tx: Tx, fromWorkspaceId: string, toWorkspaceId: string): Promise<void> {
	const guestLabels = await tx
		.select()
		.from(tlLabel)
		.where(and(eq(tlLabel.workspaceId, fromWorkspaceId), isNull(tlLabel.projectId)));
	if (guestLabels.length === 0) return;
	const existing = await tx
		.select()
		.from(tlLabel)
		.where(and(eq(tlLabel.workspaceId, toWorkspaceId), isNull(tlLabel.projectId)));
	const byName = new Map(existing.map((label) => [label.name.toLowerCase(), label.id]));
	const moving: string[] = [];
	for (const label of guestLabels) {
		const same = byName.get(label.name.toLowerCase());
		if (!same) {
			moving.push(label.id);
			continue;
		}
		await tx.execute(
			sql`insert into ${tlTaskLabel} (task_id, label_id) select task_id, ${same} from ${tlTaskLabel} where label_id = ${label.id} on conflict do nothing`,
		);
		await tx.delete(tlLabel).where(eq(tlLabel.id, label.id));
	}
	if (moving.length > 0) {
		await tx.update(tlLabel).set({ workspaceId: toWorkspaceId }).where(inArray(tlLabel.id, moving));
	}
}

/** Taskline's entry in `GUEST_DATA` (src/server/guests/data.ts): a guest's sandbox and its claim. */
export const TASKLINE_GUEST_DATA: GuestData = {
	slug: "taskline",
	seedGuestData: async (tx, userId, locale) => {
		await seedSandbox(tx, userId, locale);
	},
	claim: claimSandbox,
};
