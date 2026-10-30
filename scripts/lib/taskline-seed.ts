/**
 * Taskline's demo team (`pnpm db:seed-taskline`, and `pnpm dev:local` on a fresh
 * database): five accounts on the team (one a viewer), every admin as a member, three
 * projects (one private) and sixty tasks, so the app has something to show. Plain SQL
 * through an injected query (as ./demo-data.ts), so it runs on node-postgres and is
 * tested on PGlite (tests/server/taskline-seed.test.ts). Safe to run again: accounts
 * and members are kept, and projects are only written while the team has none.
 *
 * Run by Node directly (type stripping): it imports only relative `.ts` files without imports.
 */
import { randomUUID } from "node:crypto";
import { generateKeysBetween } from "../../src/lib/fractional-index.ts";
import type { DemoQuery } from "./demo-data.ts";

export const TASKLINE_TEAM: ReadonlyArray<{ email: string; name: string; title: string; role: "member" | "viewer" }> = [
	{ email: "asha@taskline.example.com", name: "Asha Gurung", title: "Designer", role: "member" },
	{ email: "bikash@taskline.example.com", name: "Bikash Thapa", title: "Engineer", role: "member" },
	{ email: "sita@taskline.example.com", name: "Sita Rai", title: "Product manager", role: "member" },
	{ email: "nabin@taskline.example.com", name: "Nabin Shrestha", title: "Engineer", role: "member" },
	{ email: "priya@taskline.example.com", name: "Priya Tamang", title: "Stakeholder", role: "viewer" },
];

const STATUSES = [
	["Backlog", "backlog", "gray"],
	["To do", "unstarted", "blue"],
	["In progress", "started", "amber"],
	["Done", "completed", "green"],
	["Canceled", "canceled", "red"],
] as const;

const PROJECTS = [
	{
		key: "WEB",
		name: "Website relaunch",
		color: "teal",
		visibility: "team",
		lead: 2,
		members: [0, 1, 3, 4],
		labels: [
			["Design", "violet"],
			["Content", "teal"],
			["Bug", "red"],
		],
		tasks: [
			"Write the homepage copy",
			"Design the new navigation",
			"Fix the broken contact form",
			"Pick a launch date",
			"Set up analytics",
			"Move the old blog posts",
			"Replace the logo files",
			"Check the contrast in dark mode",
			"Add the pricing page",
			"Redirect the old URLs",
			"Compress the hero images",
			"Write the launch announcement",
			"Test the forms on phones",
			"Add the cookie notice",
			"Review the footer links",
			"Translate the homepage into Nepali",
			"Set up the status page",
			"Plan the launch-day checklist",
			"Archive the old site",
			"Thank the beta testers",
		],
	},
	{
		key: "APP",
		name: "Mobile app",
		color: "indigo",
		visibility: "team",
		lead: 1,
		members: [0, 3],
		labels: [
			["iOS", "gray"],
			["Android", "green"],
			["Bug", "red"],
		],
		tasks: [
			"Sign in with a one-time code",
			"Offline mode for the task list",
			"Push notifications for assignments",
			"Crash on rotating the board",
			"Dark mode icons",
			"Upload a photo to a task",
			"Swipe to complete a task",
			"Release notes for 1.2",
			"Settle the app store screenshots",
			"Speed up the first launch",
			"Haptics when a card moves",
			"Accessibility labels on buttons",
			"Search tasks by reference",
			"Fix the date picker in Nepali",
			"Battery use while syncing",
			"Show who is assigned",
			"Pull to refresh",
			"Empty states for new users",
			"Beta group feedback round",
			"Remove the old login screen",
		],
	},
	{
		key: "OPS",
		name: "Operations",
		color: "amber",
		visibility: "private",
		lead: 3,
		members: [1],
		labels: [
			["Infra", "blue"],
			["Security", "red"],
		],
		tasks: [
			"Rotate the database password",
			"Turn on backups for the media",
			"Upgrade Node on the servers",
			"Review who can deploy",
			"Set up uptime alerts",
			"Document the restore steps",
			"Renew the certificates",
			"Clean up unused buckets",
			"Load test the API",
			"Patch the base images",
			"Move secrets to the vault",
			"Audit the admin accounts",
			"Plan the on-call rota",
			"Check the cron jobs",
			"Trim the log retention",
			"Budget for next quarter",
			"Write the incident template",
			"Test a failover",
			"Tag the cloud resources",
			"Remove old API keys",
		],
	},
] as const;

/** A calendar day `offset` days from today (UTC; demo data needs no time zone). */
const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

const firstId = (rows: Array<Record<string, unknown>>, what: string): string => {
	const id = rows[0]?.id;
	if (typeof id !== "string") throw new Error(`taskline seed: no ${what}`);
	return id;
};

export async function seedTaskline(
	query: DemoQuery,
	{ passwordHash }: { passwordHash: string },
): Promise<{ accounts: number; projects: number; tasks: number }> {
	const team = await query(`select "id" from "tl_workspace" where "kind" = 'team'`);
	const workspaceId = firstId(team.rows, "team workspace (run the migrations first)");

	let accounts = 0;
	const userIds: string[] = [];
	for (const person of TASKLINE_TEAM) {
		const existing = await query(`select "id" from "user" where "email" = $1`, [person.email]);
		let id = existing.rows[0]?.id as string | undefined;
		if (!id) {
			id = randomUUID();
			await query(
				`insert into "user" ("id", "name", "email", "email_verified", "role") values ($1, $2, $3, true, 'user')`,
				[id, person.name, person.email],
			);
			await query(
				`insert into "account" ("id", "account_id", "provider_id", "user_id", "password", "created_at", "updated_at")
				 values ($1, $2, 'credential', $2, $3, now(), now())`,
				[randomUUID(), id, passwordHash],
			);
			accounts += 1;
		}
		userIds.push(id);
	}

	const memberIds: string[] = [];
	for (const [index, person] of TASKLINE_TEAM.entries()) {
		const { rows } = await query(
			`insert into "tl_member" ("workspace_id", "user_id", "display_name", "role", "title") values ($1, $2, $3, $4, $5)
			 on conflict ("workspace_id", "user_id") do update set "display_name" = excluded."display_name" returning "id"`,
			[workspaceId, userIds[index], person.name, person.role, person.title],
		);
		memberIds.push(firstId(rows, `member ${person.email}`));
	}
	// Admins are on the team too, so their home page has work on it.
	const { rows: admins } = await query(
		`insert into "tl_member" ("workspace_id", "user_id", "display_name")
		 select $1, "id", "name" from "user" where "role" = 'admin' and not coalesce("is_anonymous", false)
		 on conflict ("workspace_id", "user_id") do nothing returning "id"`,
		[workspaceId],
	);

	const existingProjects = await query(`select count(*)::int as "total" from "tl_project" where "workspace_id" = $1`, [
		workspaceId,
	]);
	if (Number(existingProjects.rows[0]?.total ?? 0) > 0) return { accounts, projects: 0, tasks: 0 };

	let taskCount = 0;
	for (const project of PROJECTS) {
		const leadId = memberIds[project.lead] ?? null;
		const { rows } = await query(
			`insert into "tl_project" ("workspace_id", "key", "name", "color", "visibility", "lead_id", "description_html", "description_text", "start_on", "target_on")
			 values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning "id"`,
			[
				workspaceId,
				project.key,
				project.name,
				project.color,
				project.visibility,
				leadId,
				`<p>${project.name}: demo data from pnpm db:seed-taskline.</p>`,
				`${project.name}: demo data from pnpm db:seed-taskline.`,
				day(-30),
				day(45),
			],
		);
		const projectId = firstId(rows, `project ${project.key}`);
		const people = [
			[leadId, "lead"],
			...project.members.map((index) => [memberIds[index] ?? null, "member"] as const),
			...admins.map((row) => [row.id as string, "member"] as const),
		] as const;
		for (const [memberId, role] of people) {
			await query(
				`insert into "tl_project_member" ("project_id", "member_id", "role") values ($1, $2, $3) on conflict do nothing`,
				[projectId, memberId, role],
			);
		}
		const statusPositions = generateKeysBetween(null, null, STATUSES.length);
		const statusIds: string[] = [];
		for (const [index, [name, category, color]] of STATUSES.entries()) {
			const status = await query(
				`insert into "tl_status" ("project_id", "name", "category", "color", "position") values ($1, $2, $3, $4, $5) returning "id"`,
				[projectId, name, category, color, statusPositions[index]],
			);
			statusIds.push(firstId(status.rows, `status ${name}`));
		}
		const labelIds: string[] = [];
		for (const [name, color] of project.labels) {
			const label = await query(
				`insert into "tl_label" ("workspace_id", "project_id", "name", "color") values ($1, $2, $3, $4) returning "id"`,
				[workspaceId, projectId, name, color],
			);
			labelIds.push(firstId(label.rows, `label ${name}`));
		}
		const assignees = people.map(([memberId]) => memberId);
		// Spread over the statuses: a few in the backlog, most to do or in progress, a quarter done.
		const statusOf = (index: number) => [1, 2, 1, 0, 3, 2, 3, 1, 0, 2, 1, 3, 4, 1, 2, 3, 0, 1, 2, 3][index % 20] ?? 1;
		const positions = STATUSES.map((_, status) =>
			generateKeysBetween(null, null, project.tasks.filter((__, index) => statusOf(index) === status).length),
		);
		for (const [index, title] of project.tasks.entries()) {
			const status = statusOf(index);
			const closed = status >= 3;
			const number = index + 1;
			const task = await query(
				`insert into "tl_task" ("workspace_id", "project_id", "number", "type", "title", "status_id", "priority", "assignee_id", "reporter_id", "position", "due_on", "completed_at")
				 values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning "id"`,
				[
					workspaceId,
					projectId,
					number,
					index % 7 === 2 ? "bug" : index % 9 === 1 ? "story" : "task",
					title,
					statusIds[status],
					index % 5,
					index % 6 === 5 ? null : (assignees[index % assignees.length] ?? null),
					leadId,
					positions[status]?.shift() ?? "a0",
					index % 3 === 0 ? null : day((index % 11) - 3),
					closed ? new Date(Date.now() - (20 - index) * 86_400_000).toISOString() : null,
				],
			);
			const taskId = firstId(task.rows, `task ${project.key}-${number}`);
			const labelId = labelIds[index % (labelIds.length + 1)];
			if (labelId) {
				await query(`insert into "tl_task_label" ("task_id", "label_id") values ($1, $2)`, [taskId, labelId]);
			}
			await query(
				`insert into "tl_activity" ("workspace_id", "project_id", "task_id", "actor_id", "kind", "data") values ($1, $2, $3, $4, 'task.created', $5)`,
				[workspaceId, projectId, taskId, leadId, JSON.stringify({ title })],
			);
			taskCount += 1;
		}
		await query(`update "tl_project" set "task_seq" = $2 where "id" = $1`, [projectId, project.tasks.length]);
		await query(
			`insert into "tl_activity" ("workspace_id", "project_id", "actor_id", "kind", "data") values ($1, $2, $3, 'project.created', $4)`,
			[workspaceId, projectId, leadId, JSON.stringify({ key: project.key, name: project.name })],
		);
	}
	return { accounts, projects: PROJECTS.length, tasks: taskCount };
}
