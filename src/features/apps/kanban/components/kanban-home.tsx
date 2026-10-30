import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { KeyboardIcon, ListChecksIcon, LockIcon, PlusIcon, SquareKanbanIcon } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { RelativeTime } from "@/components/data-display/relative-time";
import { EmptyState } from "@/components/page/empty-state";
import { Page, PageHeader } from "@/components/page/page";
import { Button } from "@/components/ui/button";
import { GUEST_LIFETIME_DAYS } from "@/lib/guests";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { TryAppButton } from "../../components/try-app-button";
import { createBoardMutation, kanbanBoardsQueryOptions } from "../queries";
import { BOARD_NAME_MAX } from "../schema";
import { KANBAN_QUOTAS } from "../types";

const NameDialog = lazy(() => import("../../components/name-dialog"));

const route = getRouteApi("/_apps/apps/kanban/");

/**
 * /apps/kanban (decision 0187): the app's landing for a visitor (what it is, "Try it"),
 * and the user's boards once they have a session (a guest's included). The landing is
 * what search engines see.
 */
export function KanbanHome() {
	const { session } = route.useRouteContext();
	return session ? <BoardList userId={session.user.id} /> : <KanbanLanding />;
}

function KanbanLanding() {
	const location = useLocation();
	const features = [
		{ icon: KeyboardIcon, title: m.kanban_feature_move(), body: m.kanban_feature_move_body() },
		{ icon: ListChecksIcon, title: m.kanban_feature_details(), body: m.kanban_feature_details_body() },
		{ icon: LockIcon, title: m.kanban_feature_private(), body: m.kanban_feature_private_body() },
	];
	return (
		<Page width="wide" data-testid="kanban-landing">
			<div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,28rem)]">
				<div className="flex flex-col gap-6">
					<PageHeader size="display" title={m.kanban_name()} description={m.kanban_description()} />
					<div className="flex flex-wrap items-center gap-3">
						<TryAppButton />
						<Button asChild variant="outline" size="lg">
							<Link to="/login" search={{ redirect: location.href }}>
								{m.apps_sign_in_to_use()}
							</Link>
						</Button>
					</div>
					<p className="max-w-prose text-muted-foreground text-sm">
						{m.apps_guest_note({ days: formatNumber(GUEST_LIFETIME_DAYS) })}
					</p>
				</div>
				<BoardPreview />
			</div>
			<section aria-labelledby="kanban-features" className="flex flex-col gap-4">
				<h2 id="kanban-features" className="text-heading">
					{m.kanban_features_title()}
				</h2>
				<ul className="grid gap-4 sm:grid-cols-3">
					{features.map(({ icon: Icon, title, body }) => (
						<li key={title} className="flex flex-col gap-2 rounded-lg border bg-surface-1 p-4">
							<Icon className="size-5 text-primary" aria-hidden />
							<h3 className="font-medium text-body">{title}</h3>
							<p className="text-muted-foreground text-sm">{body}</p>
						</li>
					))}
				</ul>
			</section>
		</Page>
	);
}

/** A still picture of a board (decorative: the text beside it says what the app does). */
function BoardPreview() {
	const columns = [
		{ name: m.kanban_column_todo(), cards: [m.kanban_seed_drag(), m.kanban_seed_add()] },
		{ name: m.kanban_column_doing(), cards: [m.kanban_seed_explore()] },
		{ name: m.kanban_column_done(), cards: [m.kanban_seed_started()] },
	];
	return (
		<div aria-hidden className="grid grid-cols-3 gap-2 rounded-xl border bg-surface-1 p-3 shadow-sm">
			{columns.map((column) => (
				<div key={column.name} className="flex flex-col gap-2 rounded-lg bg-surface-2 p-2">
					<p className="truncate font-medium text-caption">{column.name}</p>
					{column.cards.map((card) => (
						<p key={card} className="rounded-md border bg-background p-2 text-caption leading-snug">
							{card}
						</p>
					))}
				</div>
			))}
		</div>
	);
}

function BoardList({ userId }: { userId: string }) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const {
		data: { boards, now },
	} = useSuspenseQuery(kanbanBoardsQueryOptions(userId));
	const create = useMutation(createBoardMutation(queryClient, userId));
	const [naming, setNaming] = useState(false);
	const full = boards.length >= KANBAN_QUOTAS.boards;
	const newButton = (
		<Button onClick={() => setNaming(true)} disabled={full} data-testid="kanban-new-board">
			<PlusIcon aria-hidden />
			{m.kanban_new_board()}
		</Button>
	);
	return (
		<Page width="wide" data-testid="kanban-boards">
			<PageHeader
				title={m.kanban_boards_title()}
				description={m.kanban_boards_count({
					count: formatNumber(boards.length),
					max: formatNumber(KANBAN_QUOTAS.boards),
				})}
				actions={newButton}
			/>
			{boards.length === 0 ? (
				<EmptyState
					icon={SquareKanbanIcon}
					title={m.kanban_empty_title()}
					description={m.kanban_empty_body()}
					primaryAction={newButton}
				/>
			) : (
				<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{boards.map((board) => (
						<li key={board.id}>
							<Link
								to="/apps/kanban/$boardId"
								params={{ boardId: board.id }}
								className="flex h-full flex-col gap-2 rounded-lg border bg-surface-1 p-4 outline-none transition-colors hover:bg-surface-2 focus-visible:ring-[3px] focus-visible:ring-ring/50"
								data-testid="kanban-board-link"
							>
								<span className="font-medium text-body">{board.name}</span>
								<span className="text-muted-foreground text-sm">
									{m.kanban_board_summary({ columns: formatNumber(board.columns), cards: formatNumber(board.cards) })}
								</span>
								<span className="text-caption text-muted-foreground">
									{m.kanban_board_updated()} <RelativeTime value={board.updatedAt} now={now} />
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
			<Suspense fallback={null}>
				{naming ? (
					<NameDialog
						title={m.kanban_new_board()}
						label={m.kanban_board_name()}
						submitLabel={m.crud_create()}
						max={BOARD_NAME_MAX}
						onSubmit={async (name) => {
							const board = await create.mutateAsync({ id: crypto.randomUUID(), name });
							await navigate({ to: "/apps/kanban/$boardId", params: { boardId: board.id } });
						}}
						onClose={() => setNaming(false)}
						testId="kanban-new-board-dialog"
					/>
				) : null}
			</Suspense>
		</Page>
	);
}
