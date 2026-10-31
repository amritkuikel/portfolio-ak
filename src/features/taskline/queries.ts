import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";
import { getTasklineNav, listMyTasklineTasks } from "@/functions/taskline/home";
import {
	createTasklineProject,
	listTasklineProjectMembers,
	listTasklineProjects,
	setTasklineProjectStar,
} from "@/functions/taskline/projects";
import { listTasklineTasks } from "@/functions/taskline/tasks";
import { getTasklineWorkspace, startTasklineSandbox } from "@/functions/taskline/workspaces";
import type { CreateProjectInput } from "./schema";

/**
 * Taskline's reads and the writes the shell's pages make (Query; the board and list
 * of Task 48 add TanStack DB collections over these). Keys carry the user's id, so
 * another account signing in on the same tab never sees cached data, and every
 * write refreshes everything under it: the sidebar's stars and recent projects too.
 */
export const tasklineKeys = {
	all: ["taskline"] as const,
	user: (userId: string) => [...tasklineKeys.all, userId] as const,
	nav: (userId: string) => [...tasklineKeys.user(userId), "nav"] as const,
	myTasks: (userId: string) => [...tasklineKeys.user(userId), "my-tasks"] as const,
	workspace: (userId: string, ws: string) => [...tasklineKeys.user(userId), "ws", ws] as const,
	projects: (userId: string, ws: string, archived: boolean) =>
		[...tasklineKeys.workspace(userId, ws), "projects", { archived }] as const,
	project: (userId: string, ws: string, key: string) =>
		[...tasklineKeys.workspace(userId, ws), "project", key] as const,
};

export const tasklineNavQueryOptions = (userId: string) =>
	queryOptions({ queryKey: tasklineKeys.nav(userId), queryFn: () => getTasklineNav() });

export const myTasksQueryOptions = (userId: string) =>
	queryOptions({ queryKey: tasklineKeys.myTasks(userId), queryFn: () => listMyTasklineTasks() });

export const workspaceQueryOptions = (userId: string, ws: string) =>
	queryOptions({
		queryKey: tasklineKeys.workspace(userId, ws),
		queryFn: () => getTasklineWorkspace({ data: { ws } }),
	});

export const projectsQueryOptions = (userId: string, ws: string, archived: boolean) =>
	queryOptions({
		queryKey: tasklineKeys.projects(userId, ws, archived),
		queryFn: () => listTasklineProjects({ data: { ws, archived } }),
	});

/** A project with its statuses, members and tasks (what the overview counts). */
export const projectTasksQueryOptions = (userId: string, ws: string, key: string) =>
	queryOptions({
		queryKey: tasklineKeys.project(userId, ws, key),
		queryFn: () => listTasklineTasks({ data: { ws, key } }),
	});

export const projectMembersQueryOptions = (userId: string, ws: string, key: string) =>
	queryOptions({
		queryKey: [...tasklineKeys.project(userId, ws, key), "members"],
		queryFn: () => listTasklineProjectMembers({ data: { ws, key } }),
	});

const refresh = (queryClient: QueryClient, userId: string) =>
	queryClient.invalidateQueries({ queryKey: tasklineKeys.user(userId) });

export const starProjectMutation = (queryClient: QueryClient, userId: string) =>
	mutationOptions({
		mutationFn: (input: { ws: string; key: string; starred: boolean }) => setTasklineProjectStar({ data: input }),
		onSettled: () => refresh(queryClient, userId),
	});

export const createProjectMutation = (queryClient: QueryClient, userId: string) =>
	mutationOptions({
		mutationFn: (input: CreateProjectInput) => createTasklineProject({ data: input }),
		onSettled: () => refresh(queryClient, userId),
	});

export const startSandboxMutation = (queryClient: QueryClient, userId: string) =>
	mutationOptions({
		mutationFn: () => startTasklineSandbox(),
		onSettled: () => refresh(queryClient, userId),
	});
