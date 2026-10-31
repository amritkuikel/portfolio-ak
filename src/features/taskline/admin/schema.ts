import { z } from "zod";
import type { Paged } from "@/lib/list/paging";
import { isoDate, optionalText, required } from "@/lib/validation";
import { m } from "@/paraglide/messages";
import { LABEL_NAME_MAX, PROJECT_NAME_MAX, projectKey } from "../schema";
import { DEFAULT_STATUS_MAX, defaultStatus, TEAM_SLUG_PATTERN, workspaceSettings } from "../settings";
import {
	PROJECT_HEALTHS,
	PROJECT_ROLES,
	PROJECT_STATUSES,
	PROJECT_VISIBILITIES,
	type ProjectHealth,
	type ProjectRole,
	type ProjectStatus,
	type ProjectVisibility,
	TASK_TYPES,
	TASKLINE_COLORS,
	type TaskActivity,
	type TasklineColor,
	type TasklineLabel,
	type TasklineMember,
	type TasklineStatus,
	type TaskType,
	TEAM_ROLES,
	type TeamRole,
} from "../types";

/**
 * /admin/taskline's inputs (strict, checked again on the server) and what its
 * functions return. The admin runs the team workspace only: sandboxes are their
 * owners', and the admin sees them as counts (PLAN 11.5).
 */

const id = z.uuid();
const color = z.enum(TASKLINE_COLORS);
export const TITLE_MAX = 80;
/** A week's capacity, in hours on the form and minutes on the server. */
export const CAPACITY_HOURS_MAX = 80;

// ---- Overview ---------------------------------------------------------------------------------

export type AdminWeekCount = { week: string; created: number; completed: number };

export type AdminProjectHealthRow = {
	id: string;
	key: string;
	name: string;
	color: TasklineColor;
	status: ProjectStatus;
	health: ProjectHealth | null;
	lead: string | null;
	open: number;
	overdue: number;
	done: number;
	targetOn: string | null;
};

export type AdminOverview = {
	stats: { activeProjects: number; openTasks: number; overdueTasks: number; doneThisWeek: number };
	weeks: AdminWeekCount[];
	projects: AdminProjectHealthRow[];
	/** Counts only: what is in the sandboxes is their owners'. */
	sandboxes: { total: number; guests: number; projects: number; tasks: number };
	members: { active: number; invited: number };
	today: string;
};

// ---- Projects -----------------------------------------------------------------------------------

export type AdminProjectItem = {
	id: string;
	key: string;
	name: string;
	color: TasklineColor;
	visibility: ProjectVisibility;
	status: ProjectStatus;
	health: ProjectHealth | null;
	lead: { id: string; name: string } | null;
	members: number;
	open: number;
	archived: boolean;
	updatedAt: string;
	/** The team's `$ws` segment: "Open in Taskline" links there. */
	ws: string;
};
export type AdminProjectPage = Paged<AdminProjectItem>;

export type AdminProjectMember = { memberId: string; name: string; email: string | null; role: ProjectRole };

export type AdminProjectDetail = AdminProjectItem & {
	description: string;
	startOn: string | null;
	targetOn: string | null;
	version: number;
	projectMembers: AdminProjectMember[];
	statuses: (TasklineStatus & { tasks: number })[];
	labels: (TasklineLabel & { tasks: number })[];
	counts: { tasks: number; done: number; trashed: number };
};

export const adminCreateProjectInput = z.strictObject({
	key: projectKey(),
	name: required({ max: PROJECT_NAME_MAX }),
	/** A team member; empty: no lead yet. */
	leadId: id.nullable(),
	visibility: z.enum(PROJECT_VISIBILITIES),
	color,
});
export type AdminCreateProjectInput = z.infer<typeof adminCreateProjectInput>;

/** The details tab, saved from the version it started from (`updatedAt` carries it, as every admin form). */
export const adminUpdateProjectInput = z.strictObject({
	id,
	updatedAt: z.string().regex(/^[1-9][0-9]*$/),
	name: required({ max: PROJECT_NAME_MAX }),
	visibility: z.enum(PROJECT_VISIBILITIES),
	color,
	startOn: isoDate().nullable(),
	targetOn: isoDate().nullable(),
});
export type AdminUpdateProjectInput = z.infer<typeof adminUpdateProjectInput>;

/** The create form's check while typing: whether a key is free. */
export const projectKeyInput = z.strictObject({ key: projectKey() });

export const adminProjectStateInput = z.strictObject({
	id,
	status: z.enum(PROJECT_STATUSES).exclude(["archived"]).optional(),
	health: z.enum(PROJECT_HEALTHS).nullable().optional(),
});
export const adminArchiveProjectInput = z.strictObject({ id, archived: z.boolean() });
export const adminTransferLeadInput = z.strictObject({ id, memberId: id });
/** Deleting takes the key typed again: what the confirm asks for. */
export const adminDeleteProjectInput = z.strictObject({ id, confirmKey: z.string().max(6) });
export const adminExportProjectInput = z.strictObject({ id, format: z.enum(["json", "csv"]) });
export const adminProjectMemberInput = z.strictObject({ id, memberId: id, role: z.enum(PROJECT_ROLES) });
export const adminRemoveProjectMemberInput = z.strictObject({ id, memberId: id });

export type ProjectExport = { filename: string; type: string; content: string };

// ---- Members and invitations -------------------------------------------------------------------

export type AdminMemberItem = {
	id: string;
	userId: string | null;
	name: string;
	email: string | null;
	role: TeamRole;
	title: string;
	capacityMinutesWeek: number;
	/** Open tasks assigned to them: their workload. */
	open: number;
	overdue: number;
	projects: number;
	deactivated: boolean;
	joinedAt: string;
};
export type AdminMemberPage = Paged<AdminMemberItem>;

export type AccountOption = { value: string; label: string };

export const searchAccountsInput = z.strictObject({ q: z.string().trim().max(80) });

export const addMembersInput = z.strictObject({
	userIds: z.array(z.string().min(1).max(64)).min(1).max(20),
	role: z.enum(TEAM_ROLES),
});

export const updateMemberInput = z.strictObject({
	id,
	role: z.enum(TEAM_ROLES),
	title: optionalText({ max: TITLE_MAX }),
	capacityMinutesWeek: z
		.number()
		.int()
		.min(0)
		.max(CAPACITY_HOURS_MAX * 60),
});
export type UpdateMemberInput = z.infer<typeof updateMemberInput>;

/** Their open tasks go to `reassignTo` (another active member), or are left unassigned (null). */
export const deactivateMemberInput = z.strictObject({ id, reassignTo: id.nullable() });
export const reactivateMemberInput = z.strictObject({ id });

export type AdminInvitation = {
	id: string;
	email: string;
	role: TeamRole;
	project: { id: string; key: string; name: string } | null;
	invitedBy: string | null;
	expiresAt: string;
	expired: boolean;
	createdAt: string;
};

export const inviteMemberInput = z.strictObject({
	email: z
		.email({ error: () => m.validation_email() })
		.max(254)
		.transform((email) => email.toLowerCase()),
	role: z.enum(TEAM_ROLES),
	/** Also added to this project (as a member), and the email's link lands there. */
	projectId: id.nullable(),
});
export type InviteMemberInput = z.input<typeof inviteMemberInput>;
export const invitationIdInput = z.strictObject({ id });

/** Days an invitation stays good; resending starts them again. */
export const INVITATION_DAYS = 7;

// ---- Settings and workflows -------------------------------------------------------------------

/** The workspace as the settings form edits it: its name and URL segment, and the settings it holds. */
export const workspaceForm = workspaceSettings.pick({
	projectCreation: true,
	defaultVisibility: true,
	membersCanJoin: true,
	workingDays: true,
	weekStart: true,
	timeZone: true,
	digestHour: true,
	trashRetentionDays: true,
	doneColumnDays: true,
});

const quotas = z.strictObject({
	projects: z.number().int().positive().max(100_000),
	tasks: z.number().int().positive().max(10_000_000),
	statusesPerProject: z.number().int().positive().max(200),
	timeEntries: z.number().int().positive().max(100_000_000),
});

export const updateWorkspaceInput = z.strictObject({
	updatedAt: z.string().regex(/^[1-9][0-9]*$/),
	name: required({ max: 60 }),
	slug: z
		.string()
		.trim()
		.toLowerCase()
		.regex(TEAM_SLUG_PATTERN, { error: () => m.taskline_admin_validation_slug() }),
	settings: workspaceForm.extend({ quotas }).strict(),
});
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceInput>;

export type AdminWorkspace = {
	id: string;
	name: string;
	slug: string;
	/** The version, as a string: what the form sends back (`updatedAt`, as every admin form). */
	updatedAt: string;
	settings: z.output<typeof workspaceForm> & { quotas: z.output<typeof quotas> };
	/** What exists now: the quotas can't go below it. */
	usage: { projects: number; tasks: number; statusesPerProject: number };
};

export type DefaultStatus = z.output<typeof defaultStatus>;

export type AdminWorkflows = {
	updatedAt: string;
	/** The statuses a new project starts with; `custom` false: the built-in ones, in the creator's language. */
	statuses: DefaultStatus[];
	custom: boolean;
	taskTypes: TaskType[];
	labels: (TasklineLabel & { tasks: number })[];
};

export const updateWorkflowsInput = z.strictObject({
	updatedAt: z.string().regex(/^[1-9][0-9]*$/),
	/** Null: back to the built-in statuses. */
	statuses: z.array(defaultStatus).min(2).max(DEFAULT_STATUS_MAX).nullable(),
	taskTypes: z.array(z.enum(TASK_TYPES)).min(1).max(TASK_TYPES.length),
});
export type UpdateWorkflowsInput = z.infer<typeof updateWorkflowsInput>;

export const workspaceLabelInput = z.strictObject({ name: required({ max: LABEL_NAME_MAX }), color });
export const updateWorkspaceLabelInput = workspaceLabelInput.extend({ id });
export const deleteWorkspaceLabelInput = z.strictObject({ id });

// ---- Activity -----------------------------------------------------------------------------------

export type AdminActivityEntry = TaskActivity & {
	project: { id: string; key: string; name: string };
	task: { ref: string; title: string } | null;
};

/** A page of the team's history, with what its sentences name (members, statuses). */
export type AdminActivityPage = Paged<AdminActivityEntry> & {
	members: TasklineMember[];
	statuses: TasklineStatus[];
};

/** The activity filters' choices: the team's projects and members. */
export type AdminActivityOptions = {
	projects: { id: string; key: string; name: string }[];
	members: { id: string; name: string }[];
};
