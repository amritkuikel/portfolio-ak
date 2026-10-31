import { z } from "zod";
import { isOrderKey } from "@/lib/fractional-index";
import { isoDate, optionalText, required } from "@/lib/validation";
import { m } from "@/paraglide/messages";
import { taskList } from "./search";
import { projectSettings } from "./settings";
import {
	PROJECT_HEALTHS,
	PROJECT_ROLES,
	PROJECT_STATUSES,
	PROJECT_VISIBILITIES,
	STATUS_CATEGORIES,
	TASK_TYPES,
	TASKLINE_COLORS,
} from "./types";

/**
 * Taskline's inputs, checked on the server (and, from Task 47, by the forms). Every
 * input names its workspace (`ws`: the team's slug or `sandbox`) and, below it, a
 * project (`key`) or a task (`ref`, "WEB-12"): the resolver starts from those.
 * Ids of new rows may come from the browser, so an optimistic row and the saved one
 * share their key (as Kanban's, 0188).
 */

export const PROJECT_NAME_MAX = 80;
export const PROJECT_DESCRIPTION_MAX = 20_000;
export const STATUS_NAME_MAX = 40;
export const LABEL_NAME_MAX = 40;
export const TASK_TITLE_MAX = 240;
export const TASK_DESCRIPTION_MAX = 50_000;
export const CHECKLIST_MAX = 50;
export const LABELS_PER_TASK_MAX = 10;

/** 2–6 capitals and digits, a letter first: "WEB", "APP2". */
export const PROJECT_KEY_PATTERN = /^[A-Z][A-Z0-9]{1,5}$/;
/** A task's reference: its project's key and its number. */
export const TASK_REF_PATTERN = /^([A-Z][A-Z0-9]{1,5})-([1-9][0-9]{0,8})$/;

const id = z.uuid();
const position = z.string().refine(isOrderKey);
const color = z.enum(TASKLINE_COLORS);

export const ws = () => z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/);
export const projectKey = () =>
	z
		.string()
		.trim()
		.toUpperCase()
		.regex(PROJECT_KEY_PATTERN, { error: () => m.taskline_validation_key() });
/** A key from a name: its initials, or its first letters ("Website relaunch" → "WR", "Operations" → "OPE"). */
export const suggestKey = (name: string): string => {
	const words = name
		.normalize("NFKD")
		.toUpperCase()
		.replace(/[^A-Z0-9 ]/g, "")
		.split(/s+/)
		.filter(Boolean);
	const initials = words.length > 1 ? words.map((word) => word[0]).join("") : (words[0] ?? "").slice(0, 3);
	const key = initials.replace(/^[0-9]+/, "").slice(0, 6);
	return key.length >= 2 ? key : "";
};

export const taskRef = () => z.string().regex(TASK_REF_PATTERN);

/** "WEB-12" → { key: "WEB", number: 12 }; null when it isn't a reference. */
export const parseTaskRef = (ref: string): { key: string; number: number } | null => {
	const match = TASK_REF_PATTERN.exec(ref);
	return match?.[1] && match[2] ? { key: match[1], number: Number(match[2]) } : null;
};

export const wsInput = z.strictObject({ ws: ws() });
export const projectInput = z.strictObject({ ws: ws(), key: projectKey() });
export const taskInput = z.strictObject({ ws: ws(), ref: taskRef() });

// ---- Projects -------------------------------------------------------------------------------

export const listProjectsInput = z.strictObject({ ws: ws(), archived: z.boolean().optional() });

const projectFields = {
	name: required({ max: PROJECT_NAME_MAX }),
	description: optionalText({ max: PROJECT_DESCRIPTION_MAX }).optional(),
	color: color.optional(),
	icon: optionalText({ max: 8 }).optional(),
	visibility: z.enum(PROJECT_VISIBILITIES).optional(),
	startOn: isoDate().nullable().optional(),
	targetOn: isoDate().nullable().optional(),
};

export const createProjectInput = z.strictObject({ ws: ws(), key: projectKey(), ...projectFields });

/** The project form: everything it shows, saved with the version it started from. */
export const updateProjectInput = z.strictObject({
	ws: ws(),
	key: projectKey(),
	version: z.number().int().positive(),
	...projectFields,
	settings: projectSettings.partial().optional(),
});

export const setProjectStateInput = z.strictObject({
	ws: ws(),
	key: projectKey(),
	status: z.enum(PROJECT_STATUSES).exclude(["archived"]).optional(),
	health: z.enum(PROJECT_HEALTHS).nullable().optional(),
});

export const setProjectArchivedInput = z.strictObject({ ws: ws(), key: projectKey(), archived: z.boolean() });
export const setProjectStarInput = z.strictObject({ ws: ws(), key: projectKey(), starred: z.boolean() });

export const setProjectMemberInput = z.strictObject({
	ws: ws(),
	key: projectKey(),
	memberId: id,
	role: z.enum(PROJECT_ROLES),
});
export const removeProjectMemberInput = z.strictObject({ ws: ws(), key: projectKey(), memberId: id });

// ---- Statuses and labels --------------------------------------------------------------------

export const createStatusInput = z.strictObject({
	ws: ws(),
	key: projectKey(),
	id: id.optional(),
	name: required({ max: STATUS_NAME_MAX }),
	category: z.enum(STATUS_CATEGORIES),
	color: color.optional(),
	/** Omitted: after the last status. */
	position: position.optional(),
	wipLimit: z.number().int().positive().max(999).nullable().optional(),
});

export const updateStatusInput = z.strictObject({
	ws: ws(),
	key: projectKey(),
	id,
	name: required({ max: STATUS_NAME_MAX }).optional(),
	category: z.enum(STATUS_CATEGORIES).optional(),
	color: color.optional(),
	position: position.optional(),
	wipLimit: z.number().int().positive().max(999).nullable().optional(),
});

/** A status with tasks moves them to `moveTo` (trashed ones too) before it goes. */
export const deleteStatusInput = z.strictObject({ ws: ws(), key: projectKey(), id, moveTo: id.optional() });

export const createLabelInput = z.strictObject({
	ws: ws(),
	key: projectKey(),
	id: id.optional(),
	name: required({ max: LABEL_NAME_MAX }),
	color: color.optional(),
});
export const updateLabelInput = z.strictObject({
	ws: ws(),
	key: projectKey(),
	id,
	name: required({ max: LABEL_NAME_MAX }).optional(),
	color: color.optional(),
});
export const deleteLabelInput = z.strictObject({ ws: ws(), key: projectKey(), id });

// ---- Tasks ----------------------------------------------------------------------------------

const labelIds = z
	.array(id)
	.max(LABELS_PER_TASK_MAX)
	.refine((ids) => new Set(ids).size === ids.length);

export const checklistItem = z.strictObject({ id, text: required({ max: TASK_TITLE_MAX }), done: z.boolean() });

export const createTaskInput = z.strictObject({
	ws: ws(),
	key: projectKey(),
	id: id.optional(),
	title: required({ max: TASK_TITLE_MAX }),
	description: optionalText({ max: TASK_DESCRIPTION_MAX }).optional(),
	type: z.enum(TASK_TYPES).optional(),
	/** Omitted: the project's first status that isn't backlog (or its first). */
	statusId: id.optional(),
	/** Omitted: at the end of its status. */
	position: position.optional(),
	priority: z.number().int().min(0).max(4).optional(),
	assigneeId: id.nullable().optional(),
	parentId: id.nullable().optional(),
	labelIds: labelIds.optional(),
	startOn: isoDate().nullable().optional(),
	dueOn: isoDate().nullable().optional(),
});

/** The title and description: saved with the version they started from. */
export const updateTaskInput = z.strictObject({
	ws: ws(),
	ref: taskRef(),
	version: z.number().int().positive(),
	title: required({ max: TASK_TITLE_MAX }),
	description: optionalText({ max: TASK_DESCRIPTION_MAX }),
});

/** One or more single fields, last write wins (each change is in the task's history). */
export const patchTaskInput = z.strictObject({
	ws: ws(),
	ref: taskRef(),
	type: z.enum(TASK_TYPES).optional(),
	priority: z.number().int().min(0).max(4).optional(),
	assigneeId: id.nullable().optional(),
	parentId: id.nullable().optional(),
	labelIds: labelIds.optional(),
	startOn: isoDate().nullable().optional(),
	dueOn: isoDate().nullable().optional(),
});

/** A drop on the board: a status and a position in it (an order key the browser computed). */
export const moveTaskInput = z.strictObject({ ws: ws(), ref: taskRef(), statusId: id, position });

export const setChecklistInput = z.strictObject({
	ws: ws(),
	ref: taskRef(),
	checklist: z.array(checklistItem).max(CHECKLIST_MAX),
});

/** The list view's page: the list contract (taskList, search.ts) in a project. */
export const taskListInput = taskList.input.extend({ ws: ws(), key: projectKey() });
export type TaskListInput = z.infer<typeof taskListInput>;

export const BULK_MAX = 100;

/**
 * The list's bulk actions on selected tasks of one project: one change at a time
 * (a status, an assignee, a priority, a label added or removed, or the trash).
 */
export const bulkTasksInput = z
	.strictObject({
		ws: ws(),
		key: projectKey(),
		ids: z.array(id).min(1).max(BULK_MAX),
		statusId: id.optional(),
		assigneeId: id.nullable().optional(),
		priority: z.number().int().min(0).max(4).optional(),
		addLabelId: id.optional(),
		removeLabelId: id.optional(),
		trash: z.literal(true).optional(),
	})
	.refine(
		(input) =>
			[input.statusId, input.assigneeId, input.priority, input.addLabelId, input.removeLabelId, input.trash].filter(
				(value) => value !== undefined,
			).length === 1,
		{ error: "One change at a time" },
	);
export type BulkTasksInput = z.infer<typeof bulkTasksInput>;

/** A project by id: where an old Kanban board's link goes (0210). */
export const projectByIdInput = z.strictObject({ id });

export type CreateProjectInput = z.infer<typeof createProjectInput>;
export type UpdateProjectInput = z.infer<typeof updateProjectInput>;
export type SetProjectStateInput = z.infer<typeof setProjectStateInput>;
export type CreateStatusInput = z.infer<typeof createStatusInput>;
export type UpdateStatusInput = z.infer<typeof updateStatusInput>;
export type CreateLabelInput = z.infer<typeof createLabelInput>;
export type UpdateLabelInput = z.infer<typeof updateLabelInput>;
export type CreateTaskInput = z.infer<typeof createTaskInput>;
export type UpdateTaskInput = z.infer<typeof updateTaskInput>;
export type PatchTaskInput = z.infer<typeof patchTaskInput>;
