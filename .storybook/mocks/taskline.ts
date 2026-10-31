import type {
	NavProject,
	NavWorkspace,
	ProjectTasks,
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
};
