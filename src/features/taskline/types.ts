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

/** How a member hears about one kind of event (Task 50): an email at once, the daily digest, or nothing. */
export const NOTIFY_MODES = ["instant", "digest", "off"] as const;
export type NotifyMode = (typeof NOTIFY_MODES)[number];

/**
 * The kinds of notification a member can tune. Task 50 sends assigned, mentioned,
 * comment and status (on a watched task), due (tomorrow), overdue and added (to a
 * project); invited, sprint, automation and timer come with their modules.
 */
export const NOTIFY_KINDS = [
	"assigned",
	"mentioned",
	"comment",
	"status",
	"due",
	"overdue",
	"added",
	"invited",
	"sprint",
	"automation",
	"timer",
] as const;
export type NotifyKind = (typeof NOTIFY_KINDS)[number];
export type NotificationKind = NotifyKind;
/** What a notification's row says about email, fixed when it's made from the recipient's mode. */
export type NotificationEmail = "instant" | "digest" | "none";
/** A notification's snapshot: what its sentence needs even after the task changes or goes. */
export type NotificationData = {
	actor?: string;
	ref?: string;
	title?: string;
	project?: string;
	status?: string;
	excerpt?: string;
	dueOn?: string;
};

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
	/** Deleted for good from the trash (Task 48): a project entry with the task's ref and title, its own history gone. */
	"task.deleted",
	/** Task 50: `{ commentId }`; the comment's body is in `tl_comment`. */
	"comment.added",
	"comment.deleted",
	/** Task 50: `{ attachmentId, name }`. */
	"attachment.added",
	"attachment.removed",
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
	updatedAt: string;
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

/** An image on a task or a comment (the attachments service's asset, with what the page needs). */
export type TaskAttachment = {
	id: string;
	/** The original file (a PDF to download). */
	url: string;
	/** A 160 px square preview (a PDF's first page). */
	thumbUrl: string;
	/** The image at a readable size. */
	src: string;
	width: number;
	height: number;
	format: string;
};

export type TaskComment = {
	id: string;
	authorId: string | null;
	html: string;
	mentions: string[];
	attachments: TaskAttachment[];
	createdAt: string;
	editedAt: string | null;
	/** The caller's own (they may edit it), or theirs to moderate as the project's lead. */
	canEdit: boolean;
	canDelete: boolean;
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
	/** Task 50: the conversation, oldest first; the images; who watches. */
	comments: TaskComment[];
	attachments: TaskAttachment[];
	watching: boolean;
	watcherIds: string[];
};

/** A project's tasks with what draws them: the board, the list and the task sheet start from it. */
export type ProjectTasks = {
	project: ProjectDetail;
	statuses: TasklineStatus[];
	labels: TasklineLabel[];
	members: TasklineMember[];
	tasks: TaskSummary[];
	today: string;
	/** Days a closed task stays on the board: the project's setting, else the workspace's. */
	doneColumnDays: number;
	/** The types a task can be given (the workspace's setting); a task keeps one turned off later. */
	taskTypes: TaskType[];
	/** When the server read it: relative times ("5 minutes ago") start from here, so both renders agree. */
	readAt: string;
};

export type TrashedTask = { id: string; ref: string; title: string; deletedAt: string };

/** An entry of a project's feed (the overview): the task it's about, when it still exists. */
export type ProjectActivity = TaskActivity & { task: { ref: string; title: string } | null };

/** What open pages poll (decision 0209): the project's `rev`, which every change moves. */
export type ProjectRev = { rev: number };

/** Where a project lives, for links that only know its id (the Kanban redirects, 0210). */
export type ProjectLocation = { ws: string; key: string };

/** A bulk change's outcome: how many tasks it changed. */
export type BulkResult = { count: number };

/** A project in the shell's sidebar and the palette, with the workspace it's in. */
export type NavProject = {
	id: string;
	key: string;
	name: string;
	color: TasklineColor;
	/** The workspace's `$ws` segment. */
	ws: string;
	workspaceKind: WorkspaceKind;
};

/** A workspace in the shell, with whether the caller may create projects in it. */
export type NavWorkspace = WorkspaceSummary & { canCreateProject: boolean };

/**
 * What the shell draws on every page: the caller's workspaces, every active project
 * they may see (the palette's), the starred ones and the ones they last worked on.
 */
export type TasklineNav = {
	workspaces: NavWorkspace[];
	projects: NavProject[];
	starred: NavProject[];
	recent: NavProject[];
};

/** An open task assigned to the caller or watched by them, for Home ("My work", every workspace at once). */
export type MyTask = {
	id: string;
	ref: string;
	title: string;
	type: TaskType;
	priority: TaskPriority;
	dueOn: string | null;
	status: { name: string; category: StatusCategory; color: TasklineColor };
	project: NavProject;
	/** Task 51: assigned to the caller, and whether they watch it. */
	assigned: boolean;
	watching: boolean;
};

/** My work: the tasks, and the days they're grouped by (today and the last day of this week, in the first workspace's calendar). */
export type MyTasks = { tasks: MyTask[]; today: string; weekEnd: string };

// ---- Finding things (Task 51) -----------------------------------------------------------------

/** The views a saved view can belong to. */
export const SAVED_VIEW_KINDS = ["list", "board", "calendar"] as const;
export type SavedViewKind = (typeof SAVED_VIEW_KINDS)[number];

/** A saved view of a project: a search string for one of its views. */
export type SavedViewDto = {
	id: string;
	name: string;
	view: SavedViewKind;
	search: string;
	shared: boolean;
	/** Whose it is, for a shared one's "by Asha". */
	author: string;
	mine: boolean;
	/** The author, or the project's lead for a shared one. */
	canDelete: boolean;
};

/** A project's saved views of one kind, and whether the caller may save (a member row) and share (an editor). */
export type SavedViews = { views: SavedViewDto[]; canSave: boolean; canShare: boolean };

/** A task found by search, with where it lives. */
export type FoundTask = {
	id: string;
	ref: string;
	title: string;
	type: TaskType;
	priority: TaskPriority;
	status: { name: string; category: StatusCategory; color: TasklineColor };
	project: NavProject;
	/** The start of its description's text, for the results' second line. */
	excerpt: string;
	closed: boolean;
};

/** A page of search results; `jump` is the task an exact reference ("WEB-12") names, when the caller may see it. */
export type TaskSearchPage = {
	items: FoundTask[];
	total: number;
	page: number;
	pageSize: number;
	jump: string | null;
};

/** What an import did: tasks made, and the names in the file that matched nothing (left blank). */
export type TaskImportResult = {
	inserted: number;
	unmatched: { statuses: string[]; assignees: string[]; labels: string[] };
};

// ---- Notifications (Task 50) ------------------------------------------------------------------

/** One row of the inbox, with where it points (the workspace's current segment). */
export type InboxItem = {
	id: string;
	kind: NotificationKind;
	data: NotificationData;
	ws: string;
	workspaceKind: WorkspaceKind;
	projectKey: string;
	ref: string | null;
	createdAt: string;
	read: boolean;
};

export type InboxPage = { items: InboxItem[]; unread: number; hasMore: boolean; readAt: string };

export type UnreadCount = { unread: number };

/** The caller's notification settings: the modes they chose over the team's defaults, and their email language. */
export type NotifySettingsView = {
	defaults: Record<NotifyKind, NotifyMode>;
	modes: Partial<Record<NotifyKind, NotifyMode>>;
	locale: "en" | "ne" | null;
	/** Whether they have a member row anywhere (an account with none has nothing to tune). */
	member: boolean;
	/** Whether email can reach them (guests' addresses can't). */
	email: boolean;
};
