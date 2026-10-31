import { createServerFn } from "@tanstack/react-start";
import {
	createProjectInput,
	listProjectsInput,
	projectByIdInput,
	projectInput,
	removeProjectMemberInput,
	setProjectArchivedInput,
	setProjectMemberInput,
	setProjectStarInput,
	setProjectStateInput,
	updateProjectInput,
} from "@/features/taskline/schema";
import type { ProjectDetail, ProjectLocation, ProjectMemberView, ProjectSummary } from "@/features/taskline/types";
import { zodInput } from "@/functions/_lib/validator";
import { requireTasklineUser, withTasklineServices } from "@/middleware/taskline";
import * as projects from "@/server/taskline/projects/service";

/** Taskline's projects: the directory, the project form, state, archive, stars and project members. */

export const listTasklineProjects = createServerFn({ method: "GET" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(listProjectsInput))
	.handler(({ data, context }): Promise<ProjectSummary[]> => projects.listProjects(context, data));

export const createTasklineProject = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(createProjectInput))
	.handler(({ data, context }): Promise<ProjectDetail> => projects.createProject(context, data));

export const updateTasklineProject = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(updateProjectInput))
	.handler(({ data, context }): Promise<ProjectDetail> => projects.updateProject(context, data));

export const setTasklineProjectState = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(setProjectStateInput))
	.handler(({ data, context }): Promise<ProjectDetail> => projects.setProjectState(context, data));

export const setTasklineProjectArchived = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(setProjectArchivedInput))
	.handler(({ data, context }): Promise<ProjectDetail> => projects.setProjectArchived(context, data));

export const setTasklineProjectStar = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(setProjectStarInput))
	.handler(({ data, context }): Promise<void> => projects.setProjectStar(context, data));

export const joinTasklineProject = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(projectInput))
	.handler(({ data, context }): Promise<ProjectDetail> => projects.joinProject(context, data));

export const listTasklineProjectMembers = createServerFn({ method: "GET" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(projectInput))
	.handler(
		({ data, context }): Promise<ProjectMemberView[]> => projects.listProjectMembers(context, data.ws, data.key),
	);

export const setTasklineProjectMember = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(setProjectMemberInput))
	.handler(({ data, context }): Promise<ProjectMemberView[]> => projects.setProjectMember(context, data));

export const removeTasklineProjectMember = createServerFn({ method: "POST" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(removeProjectMemberInput))
	.handler(({ data, context }): Promise<ProjectMemberView[]> => projects.removeProjectMember(context, data));

/** Where a project is, by id: the redirect of an old Kanban board's URL (decision 0210). */
export const locateTasklineProject = createServerFn({ method: "GET" })
	.middleware([requireTasklineUser, withTasklineServices])
	.validator(zodInput(projectByIdInput))
	.handler(({ data, context }): Promise<ProjectLocation> => projects.locateProject(context, data.id));
