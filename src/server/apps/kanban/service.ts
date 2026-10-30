import "@tanstack/react-start/server-only";
import type {
	CreateBoardInput,
	CreateCardInput,
	CreateColumnInput,
	UpdateCardInput,
	UpdateColumnInput,
} from "@/features/apps/kanban/schema";
import {
	KANBAN_QUOTAS,
	type KanbanBoard,
	type KanbanBoardList,
	type KanbanBoardSummary,
	type KanbanCard,
} from "@/features/apps/kanban/types";
import { ruleError } from "@/lib/errors";
import { generateKeysBetween } from "@/lib/fractional-index";
import { todayInZone } from "@/lib/i18n/date-only";
import { APP_TIME_ZONE, formatNumber } from "@/lib/i18n/intl";
import { m } from "@/paraglide/messages";
import type { Locale } from "@/paraglide/runtime";
import type { AppServices } from "@/server/apps/ownership";
import { notFound } from "@/server/db/crud";
import type { Tx } from "@/server/db/types";
import * as repo from "./repository";

/**
 * Kanban's rules (decision 0188): every call acts on the caller's own rows only
 * (the repository scopes by owner), quotas per user, and the board a card or column
 * belongs to never changes. Not audited: app data isn't an admin action (0186).
 */

const quotaError = (what: "boards" | "cards" | "columns", max: number) =>
	ruleError(
		"CONFLICT",
		`Kanban quota reached: ${what}`,
		what === "boards"
			? m.kanban_quota_boards({ max: formatNumber(max) })
			: what === "cards"
				? m.kanban_quota_cards({ max: formatNumber(max) })
				: m.kanban_quota_columns({ max: formatNumber(max) }),
	);

export async function listBoards({ db, user }: AppServices): Promise<KanbanBoardList> {
	return { boards: await repo.listBoards(db, user.id), now: new Date().toISOString() };
}

export async function getBoard({ db, user }: AppServices, id: string): Promise<KanbanBoard> {
	const board = await repo.getBoard(db, user.id, id);
	if (!board) throw notFound("Board");
	return { ...board, today: todayInZone(APP_TIME_ZONE) };
}

/** The columns a new board starts with, in the caller's language. */
const defaultColumns = (locale?: Locale) => [
	m.kanban_column_todo({}, locale ? { locale } : {}),
	m.kanban_column_doing({}, locale ? { locale } : {}),
	m.kanban_column_done({}, locale ? { locale } : {}),
];

async function insertBoardWithColumns(tx: Tx, ownerId: string, input: { id?: string; name: string }, locale?: Locale) {
	const board = await repo.insertBoard(tx, ownerId, input);
	const names = defaultColumns(locale);
	const positions = generateKeysBetween(null, null, names.length);
	const columns = await repo.insertColumns(
		tx,
		ownerId,
		names.map((name, index) => ({ boardId: board.id, name, position: positions[index] ?? "a0" })),
	);
	return { board, columns };
}

export async function createBoard({ db, user }: AppServices, input: CreateBoardInput): Promise<KanbanBoardSummary> {
	return db.transaction(async (tx) => {
		if ((await repo.countBoards(tx, user.id)) >= KANBAN_QUOTAS.boards) throw quotaError("boards", KANBAN_QUOTAS.boards);
		const { board, columns } = await insertBoardWithColumns(tx, user.id, input);
		return { id: board.id, name: board.name, columns: columns.length, cards: 0, updatedAt: new Date().toISOString() };
	});
}

export async function renameBoard({ db, user }: AppServices, input: { id: string; name: string }): Promise<void> {
	await db.transaction(async (tx) => {
		if (!(await repo.renameBoard(tx, user.id, input.id, input.name))) throw notFound("Board");
	});
}

export async function deleteBoard({ db, user }: AppServices, id: string): Promise<void> {
	await db.transaction(async (tx) => {
		if (!(await repo.deleteBoard(tx, user.id, id))) throw notFound("Board");
	});
}

export async function createColumn({ db, user }: AppServices, input: CreateColumnInput) {
	return db.transaction(async (tx) => {
		if (!(await repo.lockBoard(tx, user.id, input.boardId))) throw notFound("Board");
		if ((await repo.countColumns(tx, user.id, input.boardId)) >= KANBAN_QUOTAS.columnsPerBoard) {
			throw quotaError("columns", KANBAN_QUOTAS.columnsPerBoard);
		}
		const [column] = await repo.insertColumns(tx, user.id, [input]);
		await repo.touchBoard(tx, input.boardId);
		if (!column) throw new Error("Column insert returned no row");
		return column;
	});
}

export async function updateColumn({ db, user }: AppServices, { id, ...changes }: UpdateColumnInput) {
	return db.transaction(async (tx) => {
		const column = await repo.updateColumn(tx, user.id, id, changes);
		if (!column) throw notFound("Column");
		await repo.touchBoard(tx, column.boardId);
		return column;
	});
}

export async function deleteColumn({ db, user }: AppServices, id: string): Promise<void> {
	await db.transaction(async (tx) => {
		const column = await repo.getColumn(tx, user.id, id);
		if (!column || !(await repo.deleteColumn(tx, user.id, id))) throw notFound("Column");
		await repo.touchBoard(tx, column.boardId);
	});
}

export async function createCard({ db, user }: AppServices, input: CreateCardInput): Promise<KanbanCard> {
	return db.transaction(async (tx) => {
		const column = await repo.getColumn(tx, user.id, input.columnId);
		if (!column || column.boardId !== input.boardId) throw notFound("Column");
		if ((await repo.countCards(tx, user.id)) >= KANBAN_QUOTAS.cards) throw quotaError("cards", KANBAN_QUOTAS.cards);
		const [card] = await repo.insertCards(tx, user.id, [input]);
		if (!card) throw new Error("Card insert returned no row");
		await repo.touchBoard(tx, input.boardId);
		return card;
	});
}

/** Edits a card; a move gives `columnId` and `position` (the column must be on the card's board). */
export async function updateCard({ db, user }: AppServices, { id, ...changes }: UpdateCardInput): Promise<KanbanCard> {
	return db.transaction(async (tx) => {
		const current = await repo.getCard(tx, user.id, id);
		if (!current) throw notFound("Card");
		if (changes.columnId !== undefined && changes.columnId !== current.columnId) {
			const column = await repo.getColumn(tx, user.id, changes.columnId);
			if (!column || column.boardId !== current.boardId) throw notFound("Column");
		}
		const card = await repo.updateCard(tx, user.id, id, changes);
		if (!card) throw notFound("Card");
		await repo.touchBoard(tx, card.boardId);
		return card;
	});
}

export async function deleteCard({ db, user }: AppServices, id: string): Promise<void> {
	await db.transaction(async (tx) => {
		const card = await repo.deleteCard(tx, user.id, id);
		if (!card) throw notFound("Card");
		await repo.touchBoard(tx, card.boardId);
	});
}

/**
 * A new guest's sample board (decision 0186), in the language they started in: three
 * columns and a few cards that explain the board by being on it.
 */
export async function seedKanban(tx: Tx, userId: string, locale: Locale): Promise<void> {
	const t = { locale };
	const { board, columns } = await insertBoardWithColumns(tx, userId, { name: m.kanban_seed_board({}, t) }, locale);
	const [todo, doing, done] = columns;
	if (!todo || !doing || !done) return;
	const todoKeys = generateKeysBetween(null, null, 3);
	const cards: repo.NewCard[] = [
		{
			boardId: board.id,
			columnId: todo.id,
			title: m.kanban_seed_drag({}, t),
			description: m.kanban_seed_drag_body({}, t),
			labels: ["blue"],
			position: todoKeys[0] ?? "a0",
		},
		{
			boardId: board.id,
			columnId: todo.id,
			title: m.kanban_seed_keyboard({}, t),
			description: m.kanban_seed_keyboard_body({}, t),
			labels: ["violet"],
			position: todoKeys[1] ?? "a1",
		},
		{
			boardId: board.id,
			columnId: todo.id,
			title: m.kanban_seed_add({}, t),
			position: todoKeys[2] ?? "a2",
		},
		{
			boardId: board.id,
			columnId: doing.id,
			title: m.kanban_seed_explore({}, t),
			labels: ["amber"],
			checklist: [
				{ id: crypto.randomUUID(), text: m.kanban_seed_check_open({}, t), done: true },
				{ id: crypto.randomUUID(), text: m.kanban_seed_check_label({}, t), done: false },
				{ id: crypto.randomUUID(), text: m.kanban_seed_check_due({}, t), done: false },
			],
			position: "a0",
		},
		{
			boardId: board.id,
			columnId: done.id,
			title: m.kanban_seed_started({}, t),
			description: m.kanban_seed_started_body({}, t),
			labels: ["green"],
			position: "a0",
		},
	];
	await repo.insertCards(tx, userId, cards);
}

export const claimKanban = (tx: Tx, fromUserId: string, toUserId: string) =>
	repo.transferKanban(tx, fromUserId, toUserId);

export const kanbanUsage = repo.kanbanUsage;
