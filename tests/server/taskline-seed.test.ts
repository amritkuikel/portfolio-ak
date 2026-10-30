import { hashPassword } from "better-auth/crypto";
import { afterAll, describe, expect, it } from "vitest";
import type { TasklineServices } from "@/server/taskline/access";
import * as projects from "@/server/taskline/projects/service";
import * as tasks from "@/server/taskline/tasks/service";
import { seedTaskline, TASKLINE_TEAM } from "../../scripts/lib/taskline-seed.ts";
import { createTestDb } from "../utils/test-db";

/** `pnpm db:seed-taskline`'s demo team, run against the real migrations, then read through the services. */
describe("Taskline demo seed", async () => {
	const testDb = await createTestDb();
	const query = async (sql: string, params?: unknown[]) => {
		const result = await testDb.client.query<Record<string, unknown>>(sql, params);
		return { rows: result.rows, rowCount: result.affectedRows ?? 0 };
	};
	afterAll(() => testDb.close());
	const as = async (email: string): Promise<TasklineServices> => {
		const { rows } = await query(`select "id" from "user" where "email" = $1`, [email]);
		return { db: testDb.db, user: { id: String(rows[0]?.id), isGuest: false, permissions: [] } };
	};

	it("writes the team, its projects and tasks once, and keeps them on a second run", async () => {
		const passwordHash = await hashPassword("demo-password-123");
		expect(await seedTaskline(query, { passwordHash })).toEqual({ accounts: 5, projects: 3, tasks: 60 });
		expect(await seedTaskline(query, { passwordHash })).toEqual({ accounts: 0, projects: 0, tasks: 0 });

		const asha = TASKLINE_TEAM[0];
		const priya = TASKLINE_TEAM.find((person) => person.role === "viewer");
		const viewer = await as(priya?.email ?? "");
		expect((await projects.listProjects(viewer, { ws: "team" })).map((project) => project.key)).toEqual(["APP", "WEB"]);
		const board = await tasks.listTasks(await as(asha?.email ?? ""), "team", "WEB");
		expect(board.tasks).toHaveLength(20);
		expect(board.statuses.map((status) => status.name)).toEqual([
			"Backlog",
			"To do",
			"In progress",
			"Done",
			"Canceled",
		]);
		// The admin is on the team and on every project.
		const admin = { db: testDb.db, user: { id: testDb.adminId, isGuest: false, permissions: [] } };
		expect((await projects.listProjects(admin, { ws: "team" })).map((project) => project.key)).toEqual([
			"APP",
			"OPS",
			"WEB",
		]);
		// Numbers continue after the seeded ones.
		expect((await tasks.createTask(admin, { ws: "team", key: "OPS", title: "Next" })).ref).toBe("OPS-21");
	});
});
