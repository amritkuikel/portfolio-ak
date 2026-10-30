import { createServerFn } from "@tanstack/react-start";
import {
	createTaskInput,
	moveTaskInput,
	patchTaskInput,
	projectInput,
	setChecklistInput,
	taskInput,
	updateTaskInput,
} from "@/features/taskline/schema";
import type { ProjectTasks, TaskDetail, TaskSummary, TrashedTask } from "@/features/taskline/types";
import { zodInput } from "@/functions/_lib/validator";
import { requireTasklineUser, withTasklineServices } from "@/middleware/taskline";
import * as tasks from "@/server/taskline/tasks/service";

/** Taskline's tasks: a project's tasks, one task, and every change to one. */

export const listTasklineTasks = createServerFn({ method: "GET" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(projectInput))
	.handler(({ data, context }): Promise<ProjectTasks> => tasks.listTasks(context, data.ws, data.key));

export const getTasklineTask = createServerFn({ method: "GET" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(taskInput))
	.handler(({ data, context }): Promise<TaskDetail> => tasks.getTask(context, data.ws, data.ref));

export const createTasklineTask = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(createTaskInput))
	.handler(({ data, context }): Promise<TaskDetail> => tasks.createTask(context, data));

export const updateTasklineTask = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(updateTaskInput))
	.handler(({ data, context }): Promise<TaskDetail> => tasks.updateTask(context, data));

export const patchTasklineTask = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(patchTaskInput))
	.handler(({ data, context }): Promise<TaskDetail> => tasks.patchTask(context, data));

export const moveTasklineTask = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(moveTaskInput))
	.handler(({ data, context }): Promise<TaskSummary> => tasks.moveTask(context, data));

export const setTasklineChecklist = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(setChecklistInput))
	.handler(({ data, context }): Promise<TaskDetail> => tasks.setChecklist(context, data));

export const trashTasklineTask = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(taskInput))
	.handler(({ data, context }): Promise<void> => tasks.trashTask(context, data.ws, data.ref));

export const restoreTasklineTask = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(taskInput))
	.handler(({ data, context }): Promise<TaskDetail> => tasks.restoreTask(context, data.ws, data.ref));

export const listTasklineTrash = createServerFn({ method: "GET" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(projectInput))
	.handler(({ data, context }): Promise<TrashedTask[]> => tasks.listTrash(context, data.ws, data.key));
