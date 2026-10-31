import { linkOptions } from "@tanstack/react-router";

/**
 * Every link into Taskline (PLAN 11.5, "Base path"): pages link through these, so
 * renaming the app is a move of `src/routes/_taskline/app/taskline` and this file.
 */
export const tasklineLinks = {
	landing: () => linkOptions({ to: "/app/taskline" }),
	signIn: (redirect?: string) => linkOptions({ to: "/app/taskline/sign-in", search: { redirect } }),
	signUp: (redirect?: string) => linkOptions({ to: "/app/taskline/sign-up", search: { redirect } }),
	home: () => linkOptions({ to: "/app/taskline/home" }),
	account: () => linkOptions({ to: "/app/taskline/account" }),
	projects: (ws: string) => linkOptions({ to: "/app/taskline/$ws/projects", params: { ws } }),
	project: (ws: string, key: string) => linkOptions({ to: "/app/taskline/$ws/p/$key", params: { ws, key } }),
	board: (ws: string, key: string) => linkOptions({ to: "/app/taskline/$ws/p/$key/board", params: { ws, key } }),
	list: (ws: string, key: string) => linkOptions({ to: "/app/taskline/$ws/p/$key/list", params: { ws, key } }),
	settings: (ws: string, key: string, section: "general" | "members" | "workflow" | "labels" | "trash" = "general") =>
		linkOptions({ to: `/app/taskline/$ws/p/$key/settings/${section}` as const, params: { ws, key } }),
	task: (ws: string, ref: string) => linkOptions({ to: "/app/taskline/$ws/t/$ref", params: { ws, ref } }),
};

/** De-localized paths for redirects and `?redirect=` targets. */
export const TASKLINE_PATHS = { landing: "/app/taskline", home: "/app/taskline/home" } as const;
