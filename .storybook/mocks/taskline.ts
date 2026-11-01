import type {
	InboxPage,
	NavProject,
	NavWorkspace,
	NotifySettingsView,
	ProjectTasks,
	SprintReport,
	SprintSummary,
	TaskDetail,
	TasklineLabel,
	TasklineMember,
	TasklineNav,
	TasklineStatus,
	TaskSummary,
} from "../../src/features/taskline/types";
import type { Session } from "../../src/lib/session";

/** Fixed Taskline data for the shell's stories and jsdom tests (no server functions). */

const team: NavWorkspace = {
	id: "ws-team",
	kind: "team",
	slug: "team",
	name: "Himal Studio",
	segment: "team",
	canCreateProject: true,
};
const sandbox: NavWorkspace = {
	id: "ws-sandbox",
	kind: "sandbox",
	slug: "sandbox",
	name: "Sandbox",
	segment: "sandbox",
	canCreateProject: true,
};

const project = (id: string, key: string, name: string, color: NavProject["color"], inSandbox = false): NavProject => ({
	id,
	key,
	name,
	color,
	ws: inSandbox ? "sandbox" : "team",
	workspaceKind: inSandbox ? "sandbox" : "team",
});

const web = project("p-web", "WEB", "Website relaunch", "teal");
const app = project("p-app", "APP", "Mobile app", "indigo");
const ops = project("p-ops", "OPS", "Operations", "amber");
const trial = project("p-try", "WEB", "Website relaunch", "teal", true);

/** A team member who also has a sandbox: the switcher shows. */
export const sampleTasklineNav: TasklineNav = {
	workspaces: [team, sandbox],
	projects: [app, ops, web, trial],
	starred: [web],
	recent: [app, web, trial],
};

/** A guest: their sandbox only. */
export const sampleGuestNav: TasklineNav = {
	workspaces: [sandbox],
	projects: [trial],
	starred: [],
	recent: [trial],
};

export const sampleTasklineMember: Session = {
	user: { id: "asha-1", email: "asha@example.com", name: "Asha Gurung", role: "user", twoFactorEnabled: false },
	permissions: [],
};

export const sampleTasklineGuest: Session = {
	user: {
		id: "guest-1",
		email: "guest-1@anonymous.invalid",
		name: "Guest",
		role: "user",
		twoFactorEnabled: false,
	},
	permissions: [],
	isAnonymous: true,
};

// ---- A project, its tasks and one task (the board's, the list's and the task panel's stories) ----

const status = (
	id: string,
	name: string,
	category: TasklineStatus["category"],
	color: TasklineStatus["color"],
	position: string,
	wipLimit: number | null = null,
): TasklineStatus => ({
	id,
	name,
	category,
	color,
	position,
	wipLimit,
});

const statuses: TasklineStatus[] = [
	status("st-todo", "To do", "unstarted", "blue", "a0"),
	status("st-doing", "In progress", "started", "amber", "a1", 2),
	status("st-done", "Done", "completed", "green", "a2"),
];

const member = (id: string, name: string, title: string, userId: string | null = null): TasklineMember => ({
	id,
	userId,
	name,
	role: "member",
	title,
	placeholder: userId === null,
	deactivated: false,
});

const members: TasklineMember[] = [
	member("m-asha", "Asha Gurung", "Designer", "asha-1"),
	member("m-bikash", "Bikash Thapa", "Engineer"),
	member("m-sita", "Sita Rai", "Product manager"),
];

const labels: TasklineLabel[] = [
	{ id: "l-design", name: "Design", color: "violet", projectId: "p-web" },
	{ id: "l-bug", name: "Bug", color: "red", projectId: "p-web" },
];

const summary = (
	number: number,
	title: string,
	statusId: string,
	position: string,
	extra: Partial<TaskSummary> = {},
): TaskSummary => ({
	id: `t-${number}`,
	ref: `WEB-${number}`,
	number,
	type: "task",
	title,
	statusId,
	priority: 2,
	assigneeId: null,
	parentId: null,
	labelIds: [],
	position,
	startOn: null,
	dueOn: null,
	completedAt: null,
	checklist: { done: 0, total: 0 },
	updatedAt: "2026-10-30T09:00:00.000Z",
	sprintId: null,
	points: null,
	rank: `c${String(number).padStart(3, "0")}`,
	...extra,
});

export const sampleTasks: TaskSummary[] = [
	summary(1, "Design the new navigation", "st-todo", "a0", {
		type: "story",
		assigneeId: "m-asha",
		labelIds: ["l-design"],
		priority: 3,
	}),
	summary(2, "Write the homepage copy", "st-todo", "a1", { assigneeId: "m-sita", dueOn: "2026-10-01" }),
	summary(3, "Sketch the mobile menu", "st-doing", "a0", { parentId: "t-1", assigneeId: "m-asha" }),
	summary(4, "Fix the broken contact form", "st-doing", "a1", {
		type: "bug",
		priority: 4,
		labelIds: ["l-bug"],
		assigneeId: "m-bikash",
		checklist: { done: 1, total: 3 },
	}),
	summary(5, "Check the contrast in dark mode", "st-doing", "a2", { parentId: "t-1" }),
	summary(6, "Replace the logo files", "st-done", "a0", { completedAt: "2026-10-29T10:00:00.000Z", priority: 1 }),
];

export const sampleProjectTasks: ProjectTasks = {
	project: {
		id: "p-web",
		key: "WEB",
		name: "Website relaunch",
		color: "teal",
		icon: "",
		visibility: "team",
		status: "active",
		health: null,
		leadId: "m-asha",
		starred: true,
		openTasks: 5,
		archived: false,
		updatedAt: "2026-10-30T09:00:00.000Z",
		description: "<p>A sample project to try Taskline with.</p>",
		startOn: null,
		targetOn: null,
		settings: {
			sprints: false,
			time: true,
			estimation: "points",
			blockCompletionWhileBlocked: false,
			doneColumnDays: null,
		},
		role: "lead",
		can: { view: true, comment: true, edit: true, manage: true, logTime: true },
		rev: 12,
		version: 1,
	},
	statuses,
	labels,
	members,
	tasks: sampleTasks,
	today: "2026-10-31",
	doneColumnDays: 14,
	taskTypes: ["task", "bug", "story", "epic"],
	readAt: "2026-10-31T06:00:00.000Z",
	sprints: [],
	velocity: { points: null, tasks: null, sprints: 0 },
	sprintCount: 0,
};

/** Task 52: the same project with sprints on: an active sprint, the next one planned, and a backlog. */
const activeSprint: SprintSummary = {
	id: "s-2",
	name: "Sprint 2",
	goal: "Ship the new navigation",
	state: "active",
	startOn: "2026-10-24",
	endOn: "2026-11-06",
	startedAt: "2026-10-24T03:00:00.000Z",
	completedAt: null,
	committed: { points: 13, tasks: 4 },
	completed: null,
};
const plannedSprint: SprintSummary = {
	id: "s-3",
	name: "Sprint 3",
	goal: "",
	state: "planned",
	startOn: "2026-11-07",
	endOn: "2026-11-20",
	startedAt: null,
	completedAt: null,
	committed: null,
	completed: null,
};
const IN_SPRINT: Record<string, { sprintId: string | null; points: number | null }> = {
	"t-1": { sprintId: "s-2", points: 5 },
	"t-2": { sprintId: "s-2", points: 3 },
	"t-3": { sprintId: "s-3", points: 2 },
	"t-4": { sprintId: "s-2", points: 3 },
	"t-5": { sprintId: "s-2", points: 2 },
	"t-6": { sprintId: null, points: 8 },
};
export const sampleSprintProject: ProjectTasks = {
	...sampleProjectTasks,
	project: { ...sampleProjectTasks.project, settings: { ...sampleProjectTasks.project.settings, sprints: true } },
	tasks: sampleTasks.map((task) => ({ ...task, ...(IN_SPRINT[task.id] ?? { sprintId: null, points: null }) })),
	sprints: [activeSprint, plannedSprint],
	velocity: { points: 9.5, tasks: 3, sprints: 2 },
	sprintCount: 4,
};

/** The active sprint's report: a week of days so far, and two completed sprints before it. */
export const sampleSprintReport: SprintReport = {
	sprint: activeSprint,
	estimation: "points",
	days: [
		{ day: "2026-10-23", scopePoints: 13, donePoints: 0, scopeTasks: 4, doneTasks: 0 },
		{ day: "2026-10-26", scopePoints: 13, donePoints: 0, scopeTasks: 4, doneTasks: 0 },
		{ day: "2026-10-27", scopePoints: 15, donePoints: 2, scopeTasks: 5, doneTasks: 1 },
		{ day: "2026-10-29", scopePoints: 15, donePoints: 5, scopeTasks: 5, doneTasks: 2 },
	],
	live: { scopePoints: 15, donePoints: 5, scopeTasks: 5, doneTasks: 2 },
	today: "2026-10-31",
	workingDays: [0, 1, 2, 3, 4, 5],
	velocity: [
		{ id: "s-0", name: "Sprint 0", committedPoints: 10, completedPoints: 11, committedTasks: 3, completedTasks: 3 },
		{ id: "s-1", name: "Sprint 1", committedPoints: 11, completedPoints: 8, committedTasks: 3, completedTasks: 2 },
	],
	sprints: [
		{ id: "s-3", name: "Sprint 3", state: "planned" },
		{ id: "s-2", name: "Sprint 2", state: "active" },
		{ id: "s-1", name: "Sprint 1", state: "completed" },
		{ id: "s-0", name: "Sprint 0", state: "completed" },
	],
};

export const sampleTaskDetail: TaskDetail = {
	...(sampleTasks[3] as TaskSummary),
	description: "<p>The form's submit button does nothing on a phone.</p>",
	checklistItems: [
		{ id: "c1", text: "Reproduce it on a phone", done: true },
		{ id: "c2", text: "Read the server logs", done: false },
		{ id: "c3", text: "Add a test", done: false },
	],
	reporterId: "m-asha",
	subtasks: [],
	deletedAt: null,
	version: 1,
	activity: [
		{
			id: "a1",
			kind: "task.created",
			actorId: "m-asha",
			data: { title: "Fix the broken contact form" },
			at: "2026-10-30T08:00:00.000Z",
		},
		{
			id: "a2",
			kind: "task.moved",
			actorId: "m-bikash",
			data: { from: "st-todo", to: "st-doing" },
			at: "2026-10-30T09:00:00.000Z",
		},
	],
	can: { view: true, comment: true, edit: true, manage: true, logTime: true },
	comments: [
		{
			id: "cm1",
			authorId: "m-bikash",
			html: '<p><span data-type="mention" class="mention" data-id="m-asha" data-label="Asha Gurung">@Asha Gurung</span> it only fails on Safari. I attached the console output.</p>',
			mentions: ["m-asha"],
			attachments: [],
			createdAt: "2026-10-30T10:00:00.000Z",
			editedAt: null,
			canEdit: false,
			canDelete: true,
		},
		{
			id: "cm2",
			authorId: "m-asha",
			html: "<p>Thanks, I'll take it from here.</p>",
			mentions: [],
			attachments: [],
			createdAt: "2026-10-30T11:30:00.000Z",
			editedAt: "2026-10-30T11:35:00.000Z",
			canEdit: true,
			canDelete: true,
		},
	],
	attachments: [],
	watching: true,
	watcherIds: ["m-asha", "m-bikash"],
};

/** The inbox (Task 50): two unread, one read. */
export const sampleInbox: InboxPage = {
	items: [
		{
			id: "n1",
			kind: "mentioned",
			data: {
				actor: "Bikash Rai",
				ref: "WEB-4",
				title: "Fix the broken contact form",
				project: "Website relaunch",
				excerpt: "@Asha Gurung it only fails on Safari.",
			},
			ws: "team",
			workspaceKind: "team",
			projectKey: "WEB",
			ref: "WEB-4",
			createdAt: "2026-10-31T05:30:00.000Z",
			read: false,
		},
		{
			id: "n2",
			kind: "assigned",
			data: { actor: "Sita Sharma", ref: "WEB-2", title: "Write the launch post", project: "Website relaunch" },
			ws: "team",
			workspaceKind: "team",
			projectKey: "WEB",
			ref: "WEB-2",
			createdAt: "2026-10-31T04:00:00.000Z",
			read: false,
		},
		{
			id: "n3",
			kind: "due",
			data: { ref: "WEB-1", title: "Choose the fonts", project: "Website relaunch", dueOn: "2026-11-01" },
			ws: "team",
			workspaceKind: "team",
			projectKey: "WEB",
			ref: "WEB-1",
			createdAt: "2026-10-31T01:15:00.000Z",
			read: true,
		},
	],
	unread: 2,
	hasMore: false,
	readAt: "2026-10-31T06:00:00.000Z",
};

export const sampleNotifySettings: NotifySettingsView = {
	defaults: {
		assigned: "instant",
		mentioned: "instant",
		comment: "digest",
		status: "digest",
		due: "digest",
		overdue: "digest",
		added: "digest",
		invited: "digest",
		sprint: "digest",
		automation: "digest",
		timer: "digest",
	},
	modes: { status: "off" },
	locale: null,
	member: true,
	email: true,
};
