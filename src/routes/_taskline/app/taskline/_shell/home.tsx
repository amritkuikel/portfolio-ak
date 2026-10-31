import { createFileRoute } from "@tanstack/react-router";
import { tasklineTitle } from "@/features/taskline/brand";
import { TasklineHome } from "@/features/taskline/home/taskline-home";
import { staticCrumb } from "@/lib/breadcrumbs";
import { ensureQuery } from "@/lib/query";
import { m } from "@/paraglide/messages";

/** /app/taskline/home: the caller's open tasks in every workspace, and their recent projects. */
export const Route = createFileRoute("/_taskline/app/taskline/_shell/home")({
	loader: async ({ context }) => {
		const { myTasksQueryOptions } = await import("@/features/taskline/queries");
		await ensureQuery(context.queryClient, myTasksQueryOptions(context.session.user.id));
	},
	staticData: { breadcrumb: staticCrumb(m.taskline_nav_home) },
	head: () => ({ meta: [{ title: tasklineTitle(m.taskline_nav_home()) }] }),
	component: TasklineHome,
});
