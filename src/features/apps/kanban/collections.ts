import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { collectionOptions } from "@tanstack/react-db";
import {
	createKanbanCard,
	createKanbanColumn,
	deleteKanbanCard,
	deleteKanbanColumn,
	getKanbanBoard,
	updateKanbanCard,
	updateKanbanColumn,
} from "@/functions/apps/kanban";
import { queryClientOf } from "@/lib/tanstack-db";
import { kanbanKeys } from "./queries";
import type { CardChanges } from "./schema";
import type { KanbanBoard, KanbanCard, KanbanColumn } from "./types";

/**
 * A board's columns and cards as TanStack DB collections (decisions 0188, 0189). Both
 * read the board query the page's loader filled (`select`), so their first rows are
 * the server-rendered ones and a live query renders on the server too. A change shows
 * at once; the handler saves it, and if the server refuses, DB puts the row back.
 * After a save the board is read again (one GET), so the rows are the server's.
 */
const fetchBoard = (boardId: string) => () => getKanbanBoard({ data: { id: boardId } });

/**
 * After a save, the board is read again before the optimistic change is dropped, so the
 * rows don't flicker back. Explicit, because query collections' automatic refetch is
 * deprecated (it goes away at TanStack DB 1.0).
 */
const saved = async (collection: { utils: { refetch: () => Promise<unknown> } }) => {
	await collection.utils.refetch();
	return { refetch: false };
};

/** The fields of a card an edit may send (the input schema is strict). */
const cardChanges = ({
	title,
	description,
	labels,
	dueOn,
	checklist,
	columnId,
	position,
}: Partial<KanbanCard>): CardChanges => ({
	title,
	description,
	labels,
	dueOn,
	checklist,
	columnId,
	position,
});

const make = (userId: string, boardId: string) => ({
	columns: collectionOptions(`kanban:columns:${boardId}`, (client) =>
		queryCollectionOptions({
			id: `kanban:columns:${boardId}`,
			queryKey: kanbanKeys.board(userId, boardId),
			queryFn: fetchBoard(boardId),
			select: (board: KanbanBoard) => board.columns,
			queryClient: queryClientOf(client),
			getKey: (column: KanbanColumn) => column.id,
			onInsert: async ({ transaction, collection }) => {
				for (const { modified } of transaction.mutations) {
					await createKanbanColumn({
						data: { id: modified.id, boardId, name: modified.name, position: modified.position },
					});
				}
				return saved(collection);
			},
			onUpdate: async ({ transaction, collection }) => {
				for (const { key, changes } of transaction.mutations) {
					await updateKanbanColumn({ data: { id: String(key), name: changes.name, position: changes.position } });
				}
				return saved(collection);
			},
			onDelete: async ({ transaction, collection }) => {
				for (const { key } of transaction.mutations) await deleteKanbanColumn({ data: { id: String(key) } });
				return saved(collection);
			},
		}),
	),
	cards: collectionOptions(`kanban:cards:${boardId}`, (client) =>
		queryCollectionOptions({
			id: `kanban:cards:${boardId}`,
			queryKey: kanbanKeys.board(userId, boardId),
			queryFn: fetchBoard(boardId),
			select: (board: KanbanBoard) => board.cards,
			queryClient: queryClientOf(client),
			getKey: (card: KanbanCard) => card.id,
			onInsert: async ({ transaction, collection }) => {
				for (const { modified } of transaction.mutations) {
					await createKanbanCard({
						data: {
							id: modified.id,
							boardId,
							columnId: modified.columnId,
							title: modified.title,
							position: modified.position,
						},
					});
				}
				return saved(collection);
			},
			onUpdate: async ({ transaction, collection }) => {
				for (const { key, changes } of transaction.mutations) {
					await updateKanbanCard({ data: { id: String(key), ...cardChanges(changes) } });
				}
				return saved(collection);
			},
			onDelete: async ({ transaction, collection }) => {
				for (const { key } of transaction.mutations) await deleteKanbanCard({ data: { id: String(key) } });
				return saved(collection);
			},
		}),
	),
});

type BoardCollections = ReturnType<typeof make>;
const made = new Map<string, BoardCollections>();

/** The collection descriptors of one board (the same objects every time, as DB needs). */
export function boardCollections(userId: string, boardId: string): BoardCollections {
	const id = `${userId}:${boardId}`;
	let found = made.get(id);
	if (!found) {
		found = make(userId, boardId);
		made.set(id, found);
	}
	return found;
}
