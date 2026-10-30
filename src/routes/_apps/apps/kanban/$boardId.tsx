import { createFileRoute, redirect } from "@tanstack/react-router";
import { KanbanBoardPage } from "@/features/apps/kanban/components/board-page";
import { kanbanBoardParamsSchema } from "@/features/apps/kanban/search";
import { loadDetailOr404 } from "@/lib/crud/route";
import { parseParams } from "@/lib/list/params";
import { privateHead } from "@/lib/seo";
import { m } from "@/paraglide/messages";

/** /apps/kanban/$boardId: one of the user's boards (private; someone else's is a 404). */
export const Route = createFileRoute("/_apps/apps/kanban/$boardId")({
	// Only UUIDs match; anything else is the localized 404 without a round trip.
	params: { parse: (raw) => parseParams(kanbanBoardParamsSchema, raw) },
	beforeLoad: ({ context }) => {
		if (!context.session) throw redirect({ to: "/apps/kanban" });
		return { session: context.session };
	},
	// Only the title; the board travels in the Query cache (and its collections start from it).
	loader: async ({ context, params }) => {
		// On demand: the queries and their server functions stay out of every page's JavaScript (0194).
		const { kanbanBoardQueryOptions } = await import("@/features/apps/kanban/queries");
		const board = await loadDetailOr404(
			context.queryClient,
			kanbanBoardQueryOptions(context.session.user.id, params.boardId),
		);
		return { name: board.name };
	},
	head: ({ loaderData }) => privateHead(loaderData?.name ?? m.kanban_name()),
	component: KanbanBoardPage,
});
