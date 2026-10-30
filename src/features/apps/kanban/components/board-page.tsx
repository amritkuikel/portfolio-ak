import { useDbClient, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/dialogs/confirm";
import { errorMessage } from "@/components/errors/error-page";
import { Page, PageHeader } from "@/components/page/page";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import { boardCollections } from "../collections";
import { boardLayout, endPosition } from "../moves";
import { deleteBoardMutation, kanbanBoardQueryOptions, renameBoardMutation } from "../queries";
import { BOARD_NAME_MAX, COLUMN_NAME_MAX } from "../schema";
import type { KanbanCard, KanbanColumn } from "../types";
import { Board } from "./board";

const CardSheet = lazy(() => import("./card-sheet"));
const NameDialog = lazy(() => import("./name-dialog"));

const route = getRouteApi("/_apps/apps/kanban/$boardId");

type Open = { kind: "card"; cardId: string } | { kind: "board" } | { kind: "column"; column: KanbanColumn } | null;

/** A change that shows at once; if the server refuses it, DB has put it back and this says so. */
const reportRollback = (transaction: { when: (state: "settled") => Promise<unknown> }) =>
	transaction.when("settled").catch((error: unknown) => {
		toast.error(m.kanban_rolled_back(), { description: errorMessage(error) });
	});

/**
 * /apps/kanban/$boardId (decision 0188): one board. Its columns and cards are live
 * queries over TanStack DB collections (server-rendered from the loader's board
 * query); every move and edit shows at once and is put back if the save fails.
 */
export function KanbanBoardPage() {
	const { boardId } = route.useParams();
	const { session } = route.useRouteContext();
	const userId = session.user.id;
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const confirm = useConfirm();
	const { data: board } = useSuspenseQuery(kanbanBoardQueryOptions(userId, boardId));
	const dbClient = useDbClient();
	const descriptors = boardCollections(userId, boardId);
	const columnsCollection = dbClient.collection(descriptors.columns);
	const cardsCollection = dbClient.collection(descriptors.cards);
	const { data: columns } = useLiveSuspenseQuery((q) => q.from({ column: columnsCollection }), [columnsCollection]);
	const { data: cards } = useLiveSuspenseQuery((q) => q.from({ card: cardsCollection }), [cardsCollection]);
	const [open, setOpen] = useState<Open>(null);
	const rename = useMutation(renameBoardMutation(queryClient, userId));
	const removeBoard = useMutation(deleteBoardMutation(queryClient, userId));

	const openCard = open?.kind === "card" ? cards.find((card) => card.id === open.cardId) : undefined;
	const close = () => setOpen(null);

	const deleteBoard = async () => {
		const confirmed = await confirm({
			title: m.crud_delete_title({ label: board.name }),
			description: m.kanban_delete_board_body(),
			confirmLabel: m.crud_delete(),
			destructive: true,
		});
		if (!confirmed) return;
		try {
			await removeBoard.mutateAsync(board.id);
			toast.success(m.crud_toast_deleted({ label: board.name }));
			await navigate({ to: "/apps/kanban" });
		} catch (error) {
			toast.error(errorMessage(error));
		}
	};

	const deleteColumn = async (column: KanbanColumn) => {
		const count = cards.filter((card) => card.columnId === column.id).length;
		const confirmed = await confirm({
			title: m.crud_delete_title({ label: column.name }),
			description: count > 0 ? m.kanban_delete_column_body({ count: formatNumber(count) }) : m.crud_delete_body(),
			confirmLabel: m.crud_delete(),
			destructive: true,
		});
		if (confirmed) reportRollback(columnsCollection.delete(column.id));
	};

	return (
		<Page width="wide" data-testid="kanban-board-page">
			<Button asChild variant="ghost" size="sm" className="self-start">
				<Link to="/apps/kanban">
					<ArrowLeftIcon aria-hidden />
					{m.kanban_all_boards()}
				</Link>
			</Button>
			<PageHeader
				title={board.name}
				description={m.kanban_board_hint()}
				actions={
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon" data-testid="kanban-board-menu">
								<MoreHorizontalIcon aria-hidden />
								<span className="sr-only">{m.kanban_board_menu()}</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={() => setOpen({ kind: "board" })}>
								<PencilIcon aria-hidden />
								{m.kanban_rename_board()}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive" onSelect={() => void deleteBoard()}>
								<Trash2Icon aria-hidden />
								{m.kanban_delete_board()}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				}
			/>
			<Board
				columns={columns}
				cards={cards}
				today={board.today}
				onMoveCard={(card, move) =>
					reportRollback(
						cardsCollection.update(card.id, (draft) => {
							draft.columnId = move.columnId;
							draft.position = move.position;
						}),
					)
				}
				onMoveColumn={(column, position) =>
					reportRollback(
						columnsCollection.update(column.id, (draft) => {
							draft.position = position;
						}),
					)
				}
				onAddCard={(column, title) => {
					const siblings = boardLayout(columns, cards).cards.get(column.id) ?? [];
					reportRollback(
						cardsCollection.insert({
							id: crypto.randomUUID(),
							boardId,
							columnId: column.id,
							title,
							description: "",
							labels: [],
							dueOn: null,
							checklist: [],
							position: endPosition(siblings),
						}),
					);
				}}
				onAddColumn={(name) => {
					const ordered = boardLayout(columns, []).columns;
					reportRollback(
						columnsCollection.insert({ id: crypto.randomUUID(), boardId, name, position: endPosition(ordered) }),
					);
				}}
				onOpenCard={(card: KanbanCard) => setOpen({ kind: "card", cardId: card.id })}
				onRenameColumn={(column) => setOpen({ kind: "column", column })}
				onDeleteColumn={(column) => void deleteColumn(column)}
			/>
			<Suspense fallback={null}>
				{openCard ? (
					<CardSheet
						card={openCard}
						onClose={close}
						onSave={async (changes) => {
							const transaction = cardsCollection.update(openCard.id, (draft) => {
								Object.assign(draft, changes);
							});
							await transaction.when("settled");
						}}
						onDelete={() => {
							close();
							reportRollback(cardsCollection.delete(openCard.id));
						}}
					/>
				) : null}
				{open?.kind === "board" ? (
					<NameDialog
						title={m.kanban_rename_board()}
						label={m.kanban_board_name()}
						submitLabel={m.crud_save()}
						initial={board.name}
						max={BOARD_NAME_MAX}
						onSubmit={(name) => rename.mutateAsync({ id: board.id, name })}
						onClose={close}
						testId="kanban-board-name-dialog"
					/>
				) : null}
				{open?.kind === "column" ? (
					<NameDialog
						title={m.kanban_rename_column()}
						label={m.kanban_column_name()}
						submitLabel={m.crud_save()}
						initial={open.column.name}
						max={COLUMN_NAME_MAX}
						onSubmit={async (name) => {
							const transaction = columnsCollection.update(open.column.id, (draft) => {
								draft.name = name;
							});
							await transaction.when("settled");
						}}
						onClose={close}
						testId="kanban-column-name-dialog"
					/>
				) : null}
			</Suspense>
		</Page>
	);
}
