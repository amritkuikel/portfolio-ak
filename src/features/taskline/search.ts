import { z } from "zod";
import { listSchema } from "@/lib/crud/schema";
import { enumParam, searchParam } from "@/lib/list/params";
import { TASK_TYPES } from "./types";

/**
 * Taskline's URL contracts (route files import these, never the form schemas, 0194).
 * Never strict: links carry utm tags.
 */

/** The project directory: cards or a list, the archived projects, and the create dialog (the palette opens it). */
export const projectsSearch = z.object({
	view: z.enum(["cards", "list"]).optional().catch(undefined),
	archived: z.literal(1).optional().catch(undefined),
	create: z.literal(1).optional().catch(undefined),
});

/** An id filter: `all`, or one row's id (and, for the assignee, `none` or `me`). */
const idOr = <const T extends readonly [string, ...string[]]>(...words: T) =>
	z
		.union([z.enum(words), z.uuid()])
		.default(words[0])
		.catch(words[0]);

export const DUE_FILTERS = ["all", "overdue", "week", "none"] as const;
export type DueFilter = (typeof DUE_FILTERS)[number];
export const PRIORITY_FILTERS = ["all", "0", "1", "2", "3", "4"] as const;

/**
 * The project's filters (the project layout's FilterBar): the board applies them to
 * the tasks it has, the list sends them to the server. Same URL, both views.
 */
export const taskFilterParams = {
	status: idOr("all"),
	assignee: idOr("all", "none", "me"),
	label: idOr("all"),
	priority: enumParam(PRIORITY_FILTERS, "all"),
	type: enumParam(["all", ...TASK_TYPES], "all"),
	due: enumParam(DUE_FILTERS, "all"),
};

export type TaskFilters = { q: string } & {
	[K in keyof typeof taskFilterParams]: z.output<(typeof taskFilterParams)[K]>;
};

/** `?task=WEB-12`: the task open in the sheet over a view (a masked route showing /$ws/t/WEB-12). */
const taskParam = z
	.string()
	.regex(/^[A-Z][A-Z0-9]{1,5}-[1-9][0-9]{0,8}$/)
	.optional()
	.catch(undefined);

export const SWIMLANES = ["none", "assignee", "priority"] as const;
export type Swimlanes = (typeof SWIMLANES)[number];

/** The board: the filters, swimlanes, and the open task. */
export const boardSearch = z.object({
	q: searchParam(),
	...taskFilterParams,
	swimlanes: enumParam(SWIMLANES, "none"),
	task: taskParam,
});

export const LIST_GROUPS = ["none", "status", "assignee"] as const;
export type ListGroup = (typeof LIST_GROUPS)[number];

/** The list: the filters, the list contract (sort, page, page size) and a grouping, server-side. */
export const taskList = listSchema({
	sorts: [
		"status",
		"-updated",
		"updated",
		"-number",
		"number",
		"title",
		"-title",
		"-priority",
		"priority",
		"due",
		"-due",
	],
	filters: { ...taskFilterParams, group: enumParam(LIST_GROUPS, "none") },
});
export const taskListSearch = taskList.search.extend({ task: taskParam });
/** The list's table: its saved page size, hidden columns and views. */
export const TASKS_TABLE_ID = "taskline-tasks";

/** The project key of a task reference ("WEB-12" → "WEB"), or null when it isn't one (route files can't import schema.ts). */
export const keyOfRef = (ref: string): string | null => /^([A-Z][A-Z0-9]{1,5})-[1-9][0-9]{0,8}$/.exec(ref)?.[1] ?? null;
