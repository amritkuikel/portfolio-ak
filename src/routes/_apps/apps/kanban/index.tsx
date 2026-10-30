import { createFileRoute } from "@tanstack/react-router";
import { KanbanHome } from "@/features/apps/kanban/components/kanban-home";
import { ensureQuery } from "@/lib/query";
import { seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";

/** /apps/kanban: the landing for visitors (indexable), the user's boards once they have a session. */
export const Route = createFileRoute("/_apps/apps/kanban/")({
	loader: async ({ context }) => {
		if (!context.session) return;
		// On demand: the queries and their server functions stay out of every page's JavaScript (0194).
		const { kanbanBoardsQueryOptions } = await import("@/features/apps/kanban/queries");
		await ensureQuery(context.queryClient, kanbanBoardsQueryOptions(context.session.user.id));
	},
	head: () => seo({ title: m.kanban_name(), description: m.kanban_seo_description(), path: "/apps/kanban" }),
	component: KanbanHome,
});
