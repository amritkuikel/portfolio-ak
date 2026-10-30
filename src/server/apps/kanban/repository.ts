import "@tanstack/react-start/server-only";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import type {
	ChecklistItem,
	KanbanBoard,
	KanbanBoardSummary,
	KanbanCard,
	KanbanColumn,
} from "@/features/apps/kanban/types";
import { isKanbanLabel } from "@/features/apps/kanban/types";
import { ownedBy } from "@/server/apps/ownership";
import { kanbanBoard, kanbanCard, kanbanColumn, user } from "@/server/db/schema";
import type { Db, Tx } from "@/server/db/types";

/**
 * Kanban's data access (decision 0188). Every function takes the owner and scopes by
 * it (`ownedBy`), so one user's call can never read or change another's rows; a row
 * that isn't the owner's is simply not found. Writes take the service's transaction.
 */

/** Order keys compare by code unit (src/lib/fractional-index.ts), not by the database's locale. */
const byPosition = (column: typeof kanbanColumn.position | typeof kanbanCard.position) => sql`${column} collate "C"`;

const columnDto = (row: typeof kanbanColumn.$inferSelect): KanbanColumn => ({
	id: row.id,
	boardId: row.boardId,
	name: row.name,
	position: row.position,
});

const cardDto = (row: typeof kanbanCard.$inferSelect): KanbanCard => ({
	id: row.id,
	boardId: row.boardId,
	columnId: row.columnId,
	title: row.title,
	description: row.description,
	labels: row.labels.filter(isKanbanLabel),
	dueOn: row.dueOn,
	checklist: row.checklist,
	position: row.position,
});

/** The owner's boards, most recently changed first, with how many columns and cards each has. */
export async function listBoards(db: Db, ownerId: string): Promise<KanbanBoardSummary[]> {
	const columns = db
		.select({ boardId: kanbanColumn.boardId, total: count().as("columns") })
		.from(kanbanColumn)
		.where(ownedBy(kanbanColumn, ownerId))
		.groupBy(kanbanColumn.boardId)
		.as("column_counts");
	const cards = db
		.select({ boardId: kanbanCard.boardId, total: count().as("cards") })
		.from(kanbanCard)
		.where(ownedBy(kanbanCard, ownerId))
		.groupBy(kanbanCard.boardId)
		.as("card_counts");
	const rows = await db
		.select({
			id: kanbanBoard.id,
			name: kanbanBoard.name,
			updatedAt: kanbanBoard.updatedAt,
			columns: sql<number>`coalesce(${columns.total}, 0)`.mapWith(Number),
			cards: sql<number>`coalesce(${cards.total}, 0)`.mapWith(Number),
		})
		.from(kanbanBoard)
		.leftJoin(columns, eq(columns.boardId, kanbanBoard.id))
		.leftJoin(cards, eq(cards.boardId, kanbanBoard.id))
		.where(ownedBy(kanbanBoard, ownerId))
		.orderBy(desc(kanbanBoard.updatedAt), asc(kanbanBoard.id));
	return rows.map((row) => ({ ...row, updatedAt: row.updatedAt.toISOString() }));
}

/** One board with its columns and cards in order, or null when it isn't the owner's. */
export async function getBoard(db: Db, ownerId: string, boardId: string): Promise<Omit<KanbanBoard, "today"> | null> {
	const [board] = await db
		.select({ id: kanbanBoard.id, name: kanbanBoard.name })
		.from(kanbanBoard)
		.where(and(eq(kanbanBoard.id, boardId), ownedBy(kanbanBoard, ownerId)));
	if (!board) return null;
	const [columns, cards] = await Promise.all([
		db
			.select()
			.from(kanbanColumn)
			.where(and(eq(kanbanColumn.boardId, boardId), ownedBy(kanbanColumn, ownerId)))
			.orderBy(byPosition(kanbanColumn.position), asc(kanbanColumn.id)),
		db
			.select()
			.from(kanbanCard)
			.where(and(eq(kanbanCard.boardId, boardId), ownedBy(kanbanCard, ownerId)))
			.orderBy(byPosition(kanbanCard.position), asc(kanbanCard.id)),
	]);
	return { ...board, columns: columns.map(columnDto), cards: cards.map(cardDto) };
}

export async function countBoards(db: Db, ownerId: string): Promise<number> {
	const [row] = await db.select({ total: count() }).from(kanbanBoard).where(ownedBy(kanbanBoard, ownerId));
	return row?.total ?? 0;
}

export async function countCards(db: Db, ownerId: string): Promise<number> {
	const [row] = await db.select({ total: count() }).from(kanbanCard).where(ownedBy(kanbanCard, ownerId));
	return row?.total ?? 0;
}

export async function countColumns(db: Db, ownerId: string, boardId: string): Promise<number> {
	const [row] = await db
		.select({ total: count() })
		.from(kanbanColumn)
		.where(and(eq(kanbanColumn.boardId, boardId), ownedBy(kanbanColumn, ownerId)));
	return row?.total ?? 0;
}

/** The owner's board, locked for the change (so its `updated_at` moves with it); null when not theirs. */
export async function lockBoard(tx: Tx, ownerId: string, boardId: string) {
	const [row] = await tx
		.select({ id: kanbanBoard.id })
		.from(kanbanBoard)
		.where(and(eq(kanbanBoard.id, boardId), ownedBy(kanbanBoard, ownerId)))
		.for("update");
	return row ?? null;
}

/** Marks a board changed (its list is ordered by it). */
export async function touchBoard(tx: Tx, boardId: string): Promise<void> {
	await tx.update(kanbanBoard).set({ updatedAt: new Date() }).where(eq(kanbanBoard.id, boardId));
}

export async function getColumn(db: Db, ownerId: string, columnId: string) {
	const [row] = await db
		.select()
		.from(kanbanColumn)
		.where(and(eq(kanbanColumn.id, columnId), ownedBy(kanbanColumn, ownerId)));
	return row ?? null;
}

export async function getCard(db: Db, ownerId: string, cardId: string) {
	const [row] = await db
		.select()
		.from(kanbanCard)
		.where(and(eq(kanbanCard.id, cardId), ownedBy(kanbanCard, ownerId)));
	return row ?? null;
}

export async function insertBoard(tx: Tx, ownerId: string, input: { id?: string; name: string }) {
	const [row] = await tx
		.insert(kanbanBoard)
		.values({ ...(input.id ? { id: input.id } : {}), ownerId, name: input.name })
		.returning({ id: kanbanBoard.id, name: kanbanBoard.name });
	if (!row) throw new Error("Board insert returned no row");
	return row;
}

export async function renameBoard(tx: Tx, ownerId: string, boardId: string, name: string): Promise<boolean> {
	const rows = await tx
		.update(kanbanBoard)
		.set({ name })
		.where(and(eq(kanbanBoard.id, boardId), ownedBy(kanbanBoard, ownerId)))
		.returning({ id: kanbanBoard.id });
	return rows.length > 0;
}

/** Deletes a board with its columns and cards (foreign keys cascade). */
export async function deleteBoard(tx: Tx, ownerId: string, boardId: string): Promise<boolean> {
	const rows = await tx
		.delete(kanbanBoard)
		.where(and(eq(kanbanBoard.id, boardId), ownedBy(kanbanBoard, ownerId)))
		.returning({ id: kanbanBoard.id });
	return rows.length > 0;
}

export async function insertColumns(
	tx: Tx,
	ownerId: string,
	rows: ReadonlyArray<{ id?: string; boardId: string; name: string; position: string }>,
): Promise<KanbanColumn[]> {
	if (rows.length === 0) return [];
	const inserted = await tx
		.insert(kanbanColumn)
		.values(rows.map((row) => ({ ...row, ownerId })))
		.returning();
	return inserted.map(columnDto);
}

export async function updateColumn(
	tx: Tx,
	ownerId: string,
	columnId: string,
	changes: { name?: string; position?: string },
): Promise<KanbanColumn | null> {
	const [row] = await tx
		.update(kanbanColumn)
		.set(changes)
		.where(and(eq(kanbanColumn.id, columnId), ownedBy(kanbanColumn, ownerId)))
		.returning();
	return row ? columnDto(row) : null;
}

/** Deletes a column with its cards (foreign keys cascade). */
export async function deleteColumn(tx: Tx, ownerId: string, columnId: string): Promise<boolean> {
	const rows = await tx
		.delete(kanbanColumn)
		.where(and(eq(kanbanColumn.id, columnId), ownedBy(kanbanColumn, ownerId)))
		.returning({ id: kanbanColumn.id });
	return rows.length > 0;
}

export type NewCard = {
	id?: string;
	boardId: string;
	columnId: string;
	title: string;
	position: string;
	description?: string;
	labels?: string[];
	dueOn?: string | null;
	checklist?: ChecklistItem[];
};

export async function insertCards(tx: Tx, ownerId: string, rows: ReadonlyArray<NewCard>): Promise<KanbanCard[]> {
	if (rows.length === 0) return [];
	const inserted = await tx
		.insert(kanbanCard)
		.values(rows.map((row) => ({ ...row, ownerId })))
		.returning();
	return inserted.map(cardDto);
}

export type CardPatch = Partial<
	Pick<KanbanCard, "title" | "description" | "labels" | "dueOn" | "checklist" | "columnId" | "position">
>;

export async function updateCard(
	tx: Tx,
	ownerId: string,
	cardId: string,
	changes: CardPatch,
): Promise<KanbanCard | null> {
	const [row] = await tx
		.update(kanbanCard)
		.set(changes)
		.where(and(eq(kanbanCard.id, cardId), ownedBy(kanbanCard, ownerId)))
		.returning();
	return row ? cardDto(row) : null;
}

export async function deleteCard(tx: Tx, ownerId: string, cardId: string): Promise<KanbanCard | null> {
	const [row] = await tx
		.delete(kanbanCard)
		.where(and(eq(kanbanCard.id, cardId), ownedBy(kanbanCard, ownerId)))
		.returning();
	return row ? cardDto(row) : null;
}

/** Moves every Kanban row of a guest to an account (decision 0186). */
export async function transferKanban(tx: Tx, fromUserId: string, toUserId: string): Promise<void> {
	await tx.update(kanbanCard).set({ ownerId: toUserId }).where(ownedBy(kanbanCard, fromUserId));
	await tx.update(kanbanColumn).set({ ownerId: toUserId }).where(ownedBy(kanbanColumn, fromUserId));
	await tx.update(kanbanBoard).set({ ownerId: toUserId }).where(ownedBy(kanbanBoard, fromUserId));
}

/** Usage for /admin/apps: how many accounts and guests have a board, and the rows. */
export async function kanbanUsage(db: Db) {
	const [owners] = await db
		.select({
			accounts:
				sql<number>`count(distinct ${kanbanBoard.ownerId}) filter (where not coalesce(${user.isAnonymous}, false))`.mapWith(
					Number,
				),
			guests: sql<number>`count(distinct ${kanbanBoard.ownerId}) filter (where ${user.isAnonymous})`.mapWith(Number),
			boards: count(),
		})
		.from(kanbanBoard)
		.innerJoin(user, eq(user.id, kanbanBoard.ownerId));
	const [cards] = await db.select({ total: count() }).from(kanbanCard);
	return {
		accounts: owners?.accounts ?? 0,
		guests: owners?.guests ?? 0,
		rows: { boards: owners?.boards ?? 0, cards: cards?.total ?? 0 },
	};
}
