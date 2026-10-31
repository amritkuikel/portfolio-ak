import type { NavProject, NavWorkspace, TasklineNav } from "../../src/features/taskline/types";
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
