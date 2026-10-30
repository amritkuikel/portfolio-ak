import { createFileRoute } from "@tanstack/react-router";
import { KanbanHome } from "@/features/apps/kanban/components/kanban-home";
import { kanbanBoardsQueryOptions } from "@/features/apps/kanban/queries";
import { ensureQuery } from "@/lib/query";
import { seo } from "@/lib/seo";
import { m } from "@/paraglide/messages";

/** /apps/kanban: the landing for visitors (indexable), the user's boards once they have a session. */
export const Route = createFileRoute("/_apps/apps/kanban/")({
	loader: async ({ context }) => {
		if (context.session) await ensureQuery(context.queryClient, kanbanBoardsQueryOptions(context.session.user.id));
	},
	head: () => seo({ title: m.kanban_name(), description: m.kanban_seo_description(), path: "/apps/kanban" }),
	component: KanbanHome,
});
