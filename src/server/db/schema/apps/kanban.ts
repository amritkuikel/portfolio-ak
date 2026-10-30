import { sql } from "drizzle-orm";
import { date, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { ChecklistItem } from "../../../../features/apps/kanban/types";
import { user } from "../auth";

/**
 * Kanban (/apps/kanban, decision 0188). Every table has `owner_id` (the user, a guest
 * included), deleted with them; repositories scope every query by it (`ownedBy`).
 * Positions are fractional order keys, compared with COLLATE "C".
 */
const owner = () =>
	text()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" });

const timestamps = () => ({
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const kanbanBoard = pgTable(
	"kanban_board",
	{
		id: uuid().primaryKey().defaultRandom(),
		ownerId: owner(),
		name: text().notNull(),
		...timestamps(),
	},
	(table) => [index("kanban_board_owner_idx").on(table.ownerId, table.updatedAt)],
);

export const kanbanColumn = pgTable(
	"kanban_column",
	{
		id: uuid().primaryKey().defaultRandom(),
		ownerId: owner(),
		boardId: uuid()
			.notNull()
			.references(() => kanbanBoard.id, { onDelete: "cascade" }),
		name: text().notNull(),
		position: text().notNull(),
		...timestamps(),
	},
	(table) => [index("kanban_column_board_idx").on(table.boardId, table.position)],
);

export const kanbanCard = pgTable(
	"kanban_card",
	{
		id: uuid().primaryKey().defaultRandom(),
		ownerId: owner(),
		boardId: uuid()
			.notNull()
			.references(() => kanbanBoard.id, { onDelete: "cascade" }),
		columnId: uuid()
			.notNull()
			.references(() => kanbanColumn.id, { onDelete: "cascade" }),
		title: text().notNull(),
		description: text().notNull().default(""),
		labels: text().array().notNull().default(sql`'{}'::text[]`),
		dueOn: date({ mode: "string" }),
		checklist: jsonb().$type<ChecklistItem[]>().notNull().default([]),
		position: text().notNull(),
		...timestamps(),
	},
	(table) => [
		index("kanban_card_column_idx").on(table.columnId, table.position),
		index("kanban_card_board_idx").on(table.boardId),
		index("kanban_card_owner_idx").on(table.ownerId),
	],
);

export type KanbanBoardRow = typeof kanbanBoard.$inferSelect;
export type KanbanColumnRow = typeof kanbanColumn.$inferSelect;
export type KanbanCardRow = typeof kanbanCard.$inferSelect;
