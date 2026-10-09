import { createServerFn } from "@tanstack/react-start";
import {
	type ExampleTaskPage,
	exampleErrorSchema,
	exampleSignupSchema,
	exampleTaskIdSchema,
	exampleTaskSearchSchema,
	exampleTasksDoneSchema,
} from "@/features/dev/examples/schema";
import { AppError } from "@/lib/errors";
import { zodInput } from "@/lib/fn-input";
import { bulkIdsSchema } from "@/lib/list";
import { devOnlyMiddleware } from "@/middleware/dev";
import { m } from "@/paraglide/messages";
import { deleteTasks, getTask, listTasks, nextSnapshot, resetTasks, setTasksDone } from "@/server/examples/tasks";

/**
 * Server functions behind the /dev/examples pages. Every one runs
 * devOnlyMiddleware: in a production build they answer NOT_FOUND. The
 * permission example's functions are in examples-permissions.ts.
 */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Loader + Query: each call counts, so a refetch after hydration would show. */
export const getExampleSnapshot = createServerFn({ method: "GET" })
	.middleware([devOnlyMiddleware])
	.handler(() => nextSnapshot());

/** Streaming: deliberately slow, so the page streams its fallback first. */
export const getSlowExample = createServerFn({ method: "GET" })
	.middleware([devOnlyMiddleware])
	.handler(async () => {
		const started = Date.now();
		await sleep(1500);
		return { tookMs: Date.now() - started, finishedAt: new Date().toISOString() };
	});

export const listExampleTasks = createServerFn({ method: "GET" })
	.middleware([devOnlyMiddleware])
	.validator(zodInput(exampleTaskSearchSchema))
	.handler(({ data }): ExampleTaskPage => listTasks(data));

/** One task, for the masking example's full page. Missing: NOT_FOUND. */
export const getExampleTask = createServerFn({ method: "GET" })
	.middleware([devOnlyMiddleware])
	.validator(zodInput(exampleTaskIdSchema))
	.handler(({ data }) => {
		const task = getTask(data.id);
		if (!task) throw new AppError("NOT_FOUND", "No such example task");
		return task;
	});

/** Marks tasks done or not; `fail` makes it refuse (after a delay), to show the optimistic rollback. */
export const setExampleTasksDone = createServerFn({ method: "POST" })
	.middleware([devOnlyMiddleware])
	.validator(zodInput(exampleTasksDoneSchema))
	.handler(async ({ data }) => {
		await sleep(600);
		if (data.fail) throw new AppError("CONFLICT", "Simulated failure (examples)");
		return { updated: setTasksDone(data.ids, data.done) };
	});

export const deleteExampleTasks = createServerFn({ method: "POST" })
	.middleware([devOnlyMiddleware])
	.validator(zodInput(bulkIdsSchema()))
	.handler(({ data }) => ({ deleted: deleteTasks(data.ids) }));

export const resetExampleTasks = createServerFn({ method: "POST" })
	.middleware([devOnlyMiddleware])
	.handler(() => {
		resetTasks();
		return { ok: true };
	});

/** Forms: the same schema as the client, plus a rule only the server knows (taken usernames). */
export const submitExampleSignup = createServerFn({ method: "POST" })
	.middleware([devOnlyMiddleware])
	.validator(zodInput(exampleSignupSchema))
	.handler(({ data }) => {
		if (["admin", "root", "taken"].includes(data.username.toLowerCase())) {
			throw new AppError("CONFLICT", "Username taken (examples)", {
				fieldErrors: { username: [m.examples_forms_username_taken()] },
			});
		}
		return { username: data.username };
	});

/** Errors: throws what the example asks for. A plain Error reaches the client as INTERNAL. */
export const failExample = createServerFn({ method: "POST" })
	.middleware([devOnlyMiddleware])
	.validator(zodInput(exampleErrorSchema))
	.handler(({ data }): never => {
		if (data.case === "forbidden") throw new AppError("FORBIDDEN", "Example refusal");
		if (data.case === "not-found") throw new AppError("NOT_FOUND", "Example missing record");
		throw new Error("Example crash: details stay in the server log");
	});
