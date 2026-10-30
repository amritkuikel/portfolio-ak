/**
 * Taskline's shapes, shared by the tables, the server and (from Task 47) the pages
 * (docs/guides/taskline.md). No imports: the schema files import these types, and
 * drizzle-kit loads them without the app's aliases.
 */

/** `team`: the one workspace the admin runs. `sandbox`: one per user, private, seeded for guests (0203). */
export const WORKSPACE_KINDS = ["team", "sandbox"] as const;
export type WorkspaceKind = (typeof WORKSPACE_KINDS)[number];

/** The `$ws` segment that means "the caller's own sandbox". */
export const SANDBOX_SEGMENT = "sandbox";

/** A team member's role: `viewer` reads and comments, `member` also edits team-visible projects. */
export const TEAM_ROLES = ["member", "viewer"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const PROJECT_ROLES = ["lead", "member", "viewer"] as const;
export type ProjectRole = (typeof PROJECT_ROLES)[number];

/** `team`: every team member sees it. `private`: only its project members (and the admins). */
export const PROJECT_VISIBILITIES = ["team", "private"] as const;
export type ProjectVisibility = (typeof PROJECT_VISIBILITIES)[number];

export const PROJECT_STATUSES = ["active", "paused", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_HEALTHS = ["on_track", "at_risk", "off_track"] as const;
export type ProjectHealth = (typeof PROJECT_HEALTHS)[number];

/** What a status means, whatever it's called: `completed` and `canceled` close a task (`completed_at`). */
export const STATUS_CATEGORIES = ["backlog", "unstarted", "started", "completed", "canceled"] as const;
export type StatusCategory = (typeof STATUS_CATEGORIES)[number];
export const isClosedCategory = (category: StatusCategory) => category === "completed" || category === "canceled";

export const TASK_TYPES = ["task", "bug", "story", "epic"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

/** 0 none, 1 low, 2 medium, 3 high, 4 urgent. */
export const TASK_PRIORITIES = [0, 1, 2, 3, 4] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/** A task's subtasks nest at most this deep: an epic (0), its story (1), the story's subtask (2). */
export const MAX_TASK_DEPTH = 2;

/**
 * Colours of projects, statuses and labels, stored by name (as the apps' palette,
 * 0192) so the values can be retuned without touching rows. The CSS values come
 * with the pages (Task 47).
 */
export const TASKLINE_COLORS = [
	"gray",
	"red",
	"orange",
	"amber",
	"green",
	"teal",
	"blue",
	"indigo",
	"violet",
	"pink",
] as const;
export type TasklineColor = (typeof TASKLINE_COLORS)[number];

export type ChecklistItem = { id: string; text: string; done: boolean };

/** How a member hears about one kind of event (Task 50). */
export const NOTIFY_MODES = ["instant", "digest", "off"] as const;
export type NotifyMode = (typeof NOTIFY_MODES)[number];

/** Everything `tl_activity.kind` holds; `data` carries the change (`{ from, to }` and the like). */
export const ACTIVITY_KINDS = [
	"project.created",
	"project.updated",
	"project.state",
	"project.archived",
	"project.restored",
	"project.member_added",
	"project.member_removed",
	"status.created",
	"status.updated",
	"status.deleted",
	"label.created",
	"label.updated",
	"label.deleted",
	"task.created",
	"task.updated",
	"task.moved",
	"task.trashed",
	"task.restored",
	"task.checklist",
] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

/** Sandbox limits (11.5); the team's are in its settings. */
export const SANDBOX_QUOTAS = { projects: 5, tasks: 1000, statusesPerProject: 20, timeEntries: 500 } as const;
export type TasklineQuotas = { projects: number; tasks: number; statusesPerProject: number; timeEntries: number };

// ---- What the server returns (DTOs) -----------------------------------------------------------

export type WorkspaceSummary = { id: string; kind: WorkspaceKind; slug: string; name: string; segment: string };

/** What a caller may do in a project (src/server/taskline/access.ts, the table in docs/guides/taskline.md). */
export type ProjectCan = { view: boolean; comment: boolean; edit: boolean; manage: boolean; logTime: boolean };

export type TasklineMember = {
	id: string;
	userId: string | null;
	name: string;
	role: TeamRole;
	title: string;
	/** A sandbox's made-up teammate, or a deleted account's history (no user). */
	placeholder: boolean;
	deactivated: boolean;
};

export type WorkspaceView = {
	workspace: WorkspaceSummary;
	/** The caller's member row, or null for an admin reading as `taskline:read` / `taskline:manage`. */
	me: TasklineMember | null;
	canCreateProject: boolean;
	/** The working days (0 Sunday … 6 Saturday), the week start and the time zone: what dates are read in. */
	calendar: { workingDays: number[]; weekStart: number; timeZone: string };
	today: string;
};

export type ProjectSummary = {
	id: string;
	key: string;
	name: string;
	color: TasklineColor;
	icon: string;
	visibility: ProjectVisibility;
	status: ProjectStatus;
	health: ProjectHealth | null;
	leadId: string | null;
	starred: boolean;
	openTasks: number;
	archived: boolean;
	updatedAt: string;
};

export type ProjectSettings = {
	sprints: boolean;
	time: boolean;
	estimation: "points" | "time";
	blockCompletionWhileBlocked: boolean;
	/** Days a completed task stays on the board; null: the workspace's window. */
	doneColumnDays: number | null;
};

export type ProjectDetail = ProjectSummary & {
	description: string;
	startOn: string | null;
	targetOn: string | null;
	settings: ProjectSettings;
	role: ProjectRole | null;
	can: ProjectCan;
	rev: number;
	version: number;
};

export type ProjectMemberView = { memberId: string; name: string; role: ProjectRole; placeholder: boolean };

export type TasklineStatus = {
	id: string;
	name: string;
	category: StatusCategory;
	color: TasklineColor;
	position: string;
	wipLimit: number | null;
};

export type TasklineLabel = { id: string; name: string; color: TasklineColor; projectId: string | null };

export type TaskSummary = {
	id: string;
	ref: string;
	number: number;
	type: TaskType;
	title: string;
	statusId: string;
	priority: TaskPriority;
	assigneeId: string | null;
	parentId: string | null;
	labelIds: string[];
	position: string;
	startOn: string | null;
	dueOn: string | null;
	completedAt: string | null;
	checklist: { done: number; total: number };
};

type ActivityScalar = string | number | boolean | null;
/** A value in an activity entry's `data`: short JSON (ids, names, a field's before and after). */
export type ActivityValue = ActivityScalar | string[] | { [key: string]: ActivityScalar };
export type ActivityData = Record<string, ActivityValue>;

export type TaskActivity = {
	id: string;
	kind: ActivityKind;
	actorId: string | null;
	data: ActivityData;
	at: string;
};

export type TaskDetail = TaskSummary & {
	description: string;
	checklistItems: ChecklistItem[];
	reporterId: string | null;
	subtasks: TaskSummary[];
	deletedAt: string | null;
	version: number;
	activity: TaskActivity[];
	can: ProjectCan;
};

/** A project's tasks with what draws them: the board and list (Task 48) start from it. */
export type ProjectTasks = {
	project: ProjectDetail;
	statuses: TasklineStatus[];
	labels: TasklineLabel[];
	members: TasklineMember[];
	tasks: TaskSummary[];
	today: string;
};

export type TrashedTask = { id: string; ref: string; title: string; deletedAt: string };
